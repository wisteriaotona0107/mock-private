<?php
// JSON保存API: POST dataset, token, data(JSON文字列)
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

$allowed = [
    'sake' => __DIR__ . '/../data/sake.json',
    'menu' => __DIR__ . '/../data/menu.json',
];

$dataset = $_POST['dataset'] ?? '';
if (!isset($allowed[$dataset])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid dataset']);
    exit;
}

$raw = $_POST['data'] ?? '';
if ($raw === '') {
    http_response_code(400);
    echo json_encode(['error' => 'No data payload']);
    exit;
}

$decoded = json_decode($raw, true);
if (!is_array($decoded)) {
    http_response_code(400);
    echo json_encode(['error' => 'Malformed JSON payload']);
    exit;
}

// display_order を再計算して整列
usort($decoded, function ($a, $b) {
    return ($a['display_order'] ?? 0) <=> ($b['display_order'] ?? 0);
});
foreach ($decoded as $index => &$item) {
    $item['display_order'] = $index + 1;
}
unset($item);

$json = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
$path = $allowed[$dataset];
if (file_put_contents($path, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write data file. Check file permissions (recommend 604 or 644).']);
    exit;
}

echo json_encode(['ok' => true]);
