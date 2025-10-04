#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');

const args = process.argv.slice(2);
const serve = args.includes('--serve');
const watch = serve || args.includes('--watch');
const portArg = args.find((arg) => arg.startsWith('--port='));
const port = portArg ? Number(portArg.split('=')[1]) : 8000;

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const webDir = path.join(projectRoot, 'web');
const entry = 'web/app.js';
const modulesToBundle = [
  'src/constants.js',
  'src/data.js',
  'src/engine.js',
  entry,
];
const staticFiles = ['index.html', 'styles.css'];

function ensureDist() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

function readSource(modulePath) {
  const absolute = path.join(projectRoot, modulePath);
  return fs.readFileSync(absolute, 'utf8');
}

function buildBundle() {
  const sources = {};
  for (const modulePath of modulesToBundle) {
    const normalized = toPosix(modulePath);
    sources[normalized] = readSource(modulePath);
  }

  const moduleEntries = Object.entries(sources)
    .map(([id, code]) => `    '${id}': ${JSON.stringify(code)}`)
    .join(',\n');

  const bundle = `(() => {\n` +
    `  const modules = {\n${moduleEntries}\n  };\n` +
    `  const cache = {};\n` +
    `  function normalize(target) {\n` +
    `    const segments = [];\n` +
    `    target.split('/').forEach((part) => {\n` +
    `      if (!part || part === '.') return;\n` +
    `      if (part === '..') { segments.pop(); return; }\n` +
    `      segments.push(part);\n` +
    `    });\n` +
    `    return segments.join('/');\n` +
    `  }\n` +
    `  function resolve(fromId, request) {\n` +
    `    if (request.startsWith('.')) {\n` +
    `      const base = fromId.includes('/') ? fromId.slice(0, fromId.lastIndexOf('/')) : '';\n` +
    `      const merged = (base ? base + '/' : '') + request;\n` +
    `      let target = normalize(merged);\n` +
    `      if (!modules[target]) {\n` +
    `        if (!target.endsWith('.js') && modules[target + '.js']) {\n` +
    `          target = target + '.js';\n` +
    `        }\n` +
    `      }\n` +
    `      return target;\n` +
    `    }\n` +
    `    return request;\n` +
    `  }\n` +
    `  function localRequire(id) {\n` +
    `    if (!modules[id]) {\n` +
    `      throw new Error('Module not found: ' + id);\n` +
    `    }\n` +
    `    if (cache[id]) {\n` +
    `      return cache[id].exports;\n` +
    `    }\n` +
    `    const module = { exports: {} };\n` +
    `    cache[id] = module;\n` +
    `    const factory = new Function('module', 'exports', 'require', modules[id]);\n` +
    `    factory(module, module.exports, (request) => localRequire(resolve(id, request)));\n` +
    `    return module.exports;\n` +
    `  }\n` +
    `  localRequire('${toPosix(entry)}');\n` +
    `})();\n`;

  ensureDist();
  fs.writeFileSync(path.join(distDir, 'app.js'), bundle, 'utf8');
}

function copyStatic() {
  ensureDist();
  for (const file of staticFiles) {
    fs.copyFileSync(path.join(webDir, file), path.join(distDir, file));
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function buildAll() {
  buildBundle();
  copyStatic();
  console.log('[build] completed');
}

function startWatchers() {
  const watchers = [];
  const files = [...modulesToBundle, ...staticFiles.map((file) => path.join('web', file))];
  for (const file of files) {
    const absolute = path.join(projectRoot, file);
    if (!fs.existsSync(absolute)) continue;
    const watcher = fs.watch(absolute, { persistent: true }, () => {
      try {
        buildAll();
      } catch (error) {
        console.error('[build] failed', error);
      }
    });
    watchers.push(watcher);
  }
  return () => watchers.forEach((watcher) => watcher.close());
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const safePath = url.split('?')[0].split('#')[0];
    const filePath = path.join(distDir, safePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === '.html'
          ? 'text/html; charset=utf-8'
          : ext === '.css'
          ? 'text/css; charset=utf-8'
          : 'application/javascript; charset=utf-8';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
  server.listen(port, () => {
    console.log(`Serving mock app at http://localhost:${port}`);
  });
  return server;
}

try {
  buildAll();
} catch (error) {
  console.error('[build] failed', error);
  process.exit(1);
}

if (watch) {
  const stopWatchers = startWatchers();
  let server;
  if (serve) {
    server = startServer();
  }
  const cleanup = () => {
    stopWatchers();
    if (server) {
      server.close();
    }
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.stdin.resume();
}
