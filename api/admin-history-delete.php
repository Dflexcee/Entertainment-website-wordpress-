<?php

/**
 * POST /api/admin-history-delete.php
 * Body: { "id": 1 }
 * Deletes a single calculation history entry.
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

$id = (int)($data['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'History ID is required']);
    exit;
}

try {
    $pdo = biztools_db();
    $stmt = $pdo->prepare('DELETE FROM calculation_history WHERE id = ?');
    $stmt->execute([$id]);

    echo json_encode(['status' => 'deleted']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
