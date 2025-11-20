<?php
// JSON読み込みAPI: GET /api/load.php?dataset=sake
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin && parse_url($origin, PHP_URL_HOST) === $host) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

$allowed = [
    'sake' => __DIR__ . '/../data/sake.json',
    'menu' => __DIR__ . '/../data/menu.json',
];

$dataset = $_GET['dataset'] ?? 'sake';
if (!isset($allowed[$dataset])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid dataset']);
    exit;
}

// CSRFトークン生成
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$path = realpath($allowed[$dataset]);
if ($path === false || !is_readable($path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Data file is not readable. Check permissions.']);
    exit;
}

$json = file_get_contents($path);
$data = json_decode($json, true);
if (!is_array($data)) {
    $data = [];
}

usort($data, function ($a, $b) {
    return ($a['display_order'] ?? 0) <=> ($b['display_order'] ?? 0);
});

echo json_encode([
    'dataset' => $dataset,
    'data' => $data,
    'token' => $_SESSION['csrf_token'],
]);
