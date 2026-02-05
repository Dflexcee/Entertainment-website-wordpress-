<?php

/**
 * Shared bootstrap: CORS, JSON, error handling, DB.
 * Include this at the top of every API endpoint.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowCors = ($origin && (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false));
$envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
if (is_file($envPath)) {
    $env = parse_ini_file($envPath);
    if (!empty($env['CORS_ANY'])) {
        $allowCors = true;
    }
}
if ($allowCors) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/database.php';
