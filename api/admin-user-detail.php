<?php

/**
 * GET /api/admin-user-detail.php?phone=08012345678
 * Returns a user's full details + all their calculation history.
 * Requires admin token.
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/admin-auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_admin_auth();

$phone = $_GET['phone'] ?? '';
if ($phone === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Phone parameter is required']);
    exit;
}

try {
    $pdo = biztools_db();

    // Get user
    $stmt = $pdo->prepare('SELECT id, full_name, phone_number, created_at, last_verified_at FROM users WHERE phone_number = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Get history
    $histStmt = $pdo->prepare('
        SELECT id, feature_type, input_data, output_data, created_at
        FROM calculation_history
        WHERE user_phone = ?
        ORDER BY created_at DESC
    ');
    $histStmt->execute([$phone]);
    $history = $histStmt->fetchAll();

    // Parse JSON fields
    foreach ($history as &$h) {
        $h['input_data'] = json_decode($h['input_data'], true);
        $h['output_data'] = json_decode($h['output_data'], true);
    }

    echo json_encode([
        'user'    => $user,
        'history' => $history,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
