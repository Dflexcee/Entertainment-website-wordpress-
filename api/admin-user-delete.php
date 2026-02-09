<?php

/**
 * POST /api/admin-user-delete.php
 * Body: { "phone": "08012345678" }
 * Deletes a user and all their calculation history.
 * Requires admin token.
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/admin-auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_admin_auth();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$phone = trim($data['phone'] ?? '');

if ($phone === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Phone is required']);
    exit;
}

try {
    $pdo = biztools_db();
    $pdo->beginTransaction();

    // Delete history first
    $del1 = $pdo->prepare('DELETE FROM calculation_history WHERE user_phone = ?');
    $del1->execute([$phone]);

    // Delete user
    $del2 = $pdo->prepare('DELETE FROM users WHERE phone_number = ?');
    $del2->execute([$phone]);

    $pdo->commit();

    echo json_encode(['status' => 'deleted']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
