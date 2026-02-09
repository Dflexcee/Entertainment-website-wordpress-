<?php

/**
 * POST /api/admin-history-update.php
 * Body: { "id": 1, "input_data": {...}, "output_data": {...} }
 * Updates a calculation history entry.
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

    $fields = [];
    $params = [];

    if (isset($data['input_data'])) {
        $fields[] = 'input_data = ?';
        $params[] = json_encode($data['input_data']);
    }
    if (isset($data['output_data'])) {
        $fields[] = 'output_data = ?';
        $params[] = json_encode($data['output_data']);
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nothing to update']);
        exit;
    }

    $params[] = $id;
    $sql = 'UPDATE calculation_history SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'updated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
