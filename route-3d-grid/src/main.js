import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BASE_Z, createGrid, applySampleData, toSerializableState, updateCellHeight } from './grid.js';
import { Logger } from './logger.js';
import { runAStarSteps } from './pathfinding.js';
import { setupUI, renderLogs, renderSelection } from './ui.js';

const state = { cells:createGrid(), start:{x:0,y:0}, goal:{x:7,y:7}, path:[], logs:[], mode:'block', closed:[] };
applySampleData(state);
const logger = new Logger();

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x10141d);
const camera = new THREE.PerspectiveCamera(60,1,0.1,1000); camera.position.set(10,14,14);
const renderer = new THREE.WebGLRenderer({antialias:true});
const container = document.querySelector('#scene-container'); container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(3.5,0,3.5);
scene.add(new THREE.AmbientLight(0xffffff,0.7)); const dl=new THREE.DirectionalLight(0xffffff,0.8); dl.position.set(8,12,4); scene.add(dl);

const root = new THREE.Group(); scene.add(root);
let pathLine = null;
const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();

function cellColor(c) {
  if (state.start.x===c.x && state.start.y===c.y) return 0x26c281;
  if (state.goal.x===c.x && state.goal.y===c.y) return 0xe74c3c;
  if (c.blocked) return 0x1b1b1b;
  if (state.path.some(p=>p.x===c.x&&p.y===c.y)) return 0xffd166;
  if (state.closed.some(p=>p.x===c.x&&p.y===c.y)) return 0x7fb3ff;
  return c.z === BASE_Z ? 0x7d8ca3 : (c.z > BASE_Z ? 0x9dbf9e : 0x6f7a92);
}

function redrawGrid() {
  root.clear();
  const gridHelper = new THREE.GridHelper(8,8,0x58657d,0x293141); gridHelper.position.set(3.5,0,3.5); scene.add(gridHelper);
  state.cells.flat().forEach(c=>{
    const h = 0.2 + c.z * 0.45;
    const g = new THREE.BoxGeometry(0.9,h,0.9);
    const m = new THREE.MeshStandardMaterial({ color: cellColor(c) });
    const mesh = new THREE.Mesh(g,m);
    mesh.position.set(c.x, h/2, c.y);
    mesh.userData = { x:c.x, y:c.y };
    root.add(mesh);
  });
  if (pathLine) scene.remove(pathLine);
  if (state.path.length > 1) {
    const pts = state.path.map(p => new THREE.Vector3(p.x, 0.25 + state.cells[p.y][p.x].z*0.45, p.y));
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    pathLine = new THREE.Line(geom, new THREE.LineBasicMaterial({ color:0xffff00 }));
    scene.add(pathLine);
  }
}

function doSearch() {
  logger.clear();
  const result = runAStarSteps(state, logger);
  state.closed = result.closedOrder;
  state.path = result.path;
  state.logs = logger.logs;
  redrawGrid(); renderLogs(state.logs);
}

renderer.domElement.addEventListener('click', (ev)=>{
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(root.children)[0];
  if (!hit) return;
  const {x,y} = hit.object.userData;
  const c = state.cells[y][x];
  if (state.mode==='start') state.start = {x,y};
  else if (state.mode==='goal') state.goal = {x,y};
  else if (state.mode==='block') { c.blocked=!c.blocked; c.type=c.blocked?'blocked':'normal'; }
  else if (state.mode==='height') updateCellHeight(c, Number(document.querySelector('#height-select').value));
  else if (state.mode==='normal') { c.blocked=false; c.type='normal'; updateCellHeight(c, BASE_Z); }
  renderSelection(c); redrawGrid();
});

setupUI(state, {
  run: doSearch,
  step: doSearch,
  auto: doSearch,
  reset: ()=>{state.path=[];state.closed=[];logger.clear();state.logs=[]; redrawGrid(); renderLogs([]);},
  clear: ()=>{ state.cells=createGrid(); applySampleData(state); state.start={x:0,y:0}; state.goal={x:7,y:7}; state.path=[]; state.closed=[]; logger.clear(); state.logs=[]; redrawGrid(); renderLogs([]); },
  clearLogs: ()=>{ logger.clear(); state.logs=[]; renderLogs([]); },
  exportJson: ()=>{
    const data = JSON.stringify(toSerializableState({...state, logs:state.logs}), null, 2);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data],{type:'application/json'})); a.download='route3d.json'; a.click();
  },
  importJson: (e)=>{
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = ()=>{
      const d = JSON.parse(r.result);
      d.cells.forEach(cc=>{ const c = state.cells[cc.y][cc.x]; c.z=cc.z; c.heightLevel=cc.z-BASE_Z; c.blocked=cc.blocked; });
      state.start=d.start; state.goal=d.goal; state.path=d.path ?? []; state.logs=d.logs ?? []; state.closed=[];
      renderLogs(state.logs); redrawGrid();
    }; r.readAsText(file);
  }
});

function resize(){ const w=container.clientWidth,h=container.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize(); redrawGrid();
(function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); })();
