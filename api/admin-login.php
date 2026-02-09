<?php

/**
 * POST /api/admin-login.php
 * Body: { "username": "admin", "password": "admin123" }
 * Returns a token (hash) stored in memory for session validation.
 */

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

$envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
$env = is_file($envPath) ? parse_ini_file($envPath) : [];

$adminUser = $env['ADMIN_USERNAME'] ?? 'admin';
$adminPass = $env['ADMIN_PASSWORD'] ?? 'admin123';

if ($username !== $adminUser || $password !== $adminPass) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit;
}

// Generate a simple token based on credentials + secret
$token = hash('sha256', $adminUser . ':' . $adminPass . ':biztools_admin_secret');

echo json_encode([
    'status' => 'authenticated',
    'token'  => $token,
]);
