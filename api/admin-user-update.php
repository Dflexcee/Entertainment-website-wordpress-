<?php

/**
 * POST /api/admin-user-update.php
 * Body: { "phone": "08012345678", "full_name": "New Name", "new_phone": "08099999999" }
 * Updates a user's name and/or phone. Also updates history references if phone changes.
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
$newName = trim($data['full_name'] ?? '');
$newPhone = trim($data['new_phone'] ?? '');

if ($phone === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Current phone is required']);
    exit;
}

try {
    $pdo = biztools_db();

    // Verify user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $pdo->beginTransaction();

    // Update name if provided
    if ($newName !== '') {
        $upd = $pdo->prepare('UPDATE users SET full_name = ? WHERE phone_number = ?');
        $upd->execute([$newName, $phone]);
    }

    // Update phone if provided and different
    if ($newPhone !== '' && $newPhone !== $phone) {
        // Check if new phone already taken
        $chk = $pdo->prepare('SELECT id FROM users WHERE phone_number = ? AND phone_number != ?');
        $chk->execute([$newPhone, $phone]);
        if ($chk->fetch()) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => 'Phone number already in use by another user']);
            exit;
        }

        // Update phone in users table
        $upd = $pdo->prepare('UPDATE users SET phone_number = ? WHERE phone_number = ?');
        $upd->execute([$newPhone, $phone]);

        // Update phone in history table so history follows the user
        $upd2 = $pdo->prepare('UPDATE calculation_history SET user_phone = ? WHERE user_phone = ?');
        $upd2->execute([$newPhone, $phone]);
    }

    $pdo->commit();

    echo json_encode(['status' => 'updated']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
