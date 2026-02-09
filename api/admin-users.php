<?php

/**
 * GET /api/admin-users.php
 * Returns all users with their calculation count.
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

try {
    $pdo = biztools_db();

    $stmt = $pdo->query('
        SELECT u.id, u.full_name, u.phone_number, u.created_at, u.last_verified_at,
               COUNT(ch.id) AS calculation_count
        FROM users u
        LEFT JOIN calculation_history ch ON ch.user_phone = u.phone_number
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ');

    $users = $stmt->fetchAll();

    echo json_encode(['users' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
