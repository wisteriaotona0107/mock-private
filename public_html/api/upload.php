<?php
// 画像アップロードAPI: POST dataset, token, image(file)
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin && parse_url($origin, PHP_URL_HOST) === $host) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (empty($_SESSION['csrf_token']) || ($_POST['token'] ?? '') !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid CSRF token']);
    exit;
}

$allowedDatasets = ['sake', 'menu'];
$dataset = $_POST['dataset'] ?? 'sake';
if (!in_array($dataset, $allowedDatasets, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid dataset']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$imagesDir = realpath(__DIR__ . '/../images');
if ($imagesDir === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Images directory not found']);
    exit;
}

$tmpName = $_FILES['image']['tmp_name'];
$error = $_FILES['image']['error'];
if ($error !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $error]);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $tmpName);
finfo_close($finfo);
$allowedMime = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
];
if (!isset($allowedMime[$mime])) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported file type']);
    exit;
}

// 拡張子チェック
$originalName = $_FILES['image']['name'] ?? '';
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if ($ext !== $allowedMime[$mime]) {
    http_response_code(400);
    echo json_encode(['error' => 'File extension does not match MIME type']);
    exit;
}

function nextFilename(string $dir, string $prefix, string $ext): string
{
    $max = 0;
    foreach (glob($dir . '/' . $prefix . '*.' . $ext) as $file) {
        if (preg_match('/' . preg_quote($prefix, '/') . '(\d{3})\.' . preg_quote($ext, '/') . '$/', basename($file), $m)) {
            $max = max($max, (int)$m[1]);
        }
    }
    $number = $max + 1;
    return sprintf('%s%03d.%s', $prefix, $number, $ext);
}

$prefix = $dataset === 'sake' ? 'sake' : 'img';
$nextName = nextFilename($imagesDir, $prefix, $ext);
$destination = $imagesDir . '/' . $nextName;

if (!move_uploaded_file($tmpName, $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file. Check directory permissions (recommend 705 or 755).']);
    exit;
}

chmod($destination, 0644);

$relativePath = 'images/' . $nextName;

echo json_encode([
    'ok' => true,
    'path' => $relativePath,
    'filename' => $nextName,
]);
