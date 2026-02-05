<?php

/**
 * POST /api/verify-user
 * Body: { "full_name": "...", "phone_number": "08012345678" }
 * Nigeria phone: 11 digits only.
 * If phone exists → update last_verified_at; else → insert new user.
 * Response: { "status": "verified", "phone_number": "..." }
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

$name = isset($data['full_name']) ? trim((string) $data['full_name']) : '';
$phone = isset($data['phone_number']) ? trim((string) $data['phone_number']) : '';

if ($name === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Full name is required']);
    exit;
}

if (!preg_match('/^[0-9]{11}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid phone number. Use 11 digits (e.g. 08012345678).']);
    exit;
}

try {
    $pdo = biztools_db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user) {
        $update = $pdo->prepare('UPDATE users SET full_name = ?, last_verified_at = NOW() WHERE phone_number = ?');
        $update->execute([$name, $phone]);
    } else {
        $insert = $pdo->prepare('INSERT INTO users (full_name, phone_number, last_verified_at) VALUES (?, ?, NOW())');
        $insert->execute([$name, $phone]);
    }

    echo json_encode([
        'status'        => 'verified',
        'phone_number'  => $phone,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
