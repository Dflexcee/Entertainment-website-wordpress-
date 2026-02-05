<?php

/**
 * POST /api/history-delete.php
 * Body: user_phone, id (optional). If id provided, delete one; else delete all for user_phone.
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

$userPhone = isset($data['user_phone']) ? trim((string) $data['user_phone']) : '';
if ($userPhone === '' || !preg_match('/^[0-9]{11}$/', $userPhone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid user_phone (11 digits) required']);
    exit;
}

$id = isset($data['id']) ? (int) $data['id'] : null;

try {
    $pdo = biztools_db();
    if ($id > 0) {
        $stmt = $pdo->prepare('DELETE FROM calculation_history WHERE user_phone = ? AND id = ?');
        $stmt->execute([$userPhone, $id]);
    } else {
        $stmt = $pdo->prepare('DELETE FROM calculation_history WHERE user_phone = ?');
        $stmt->execute([$userPhone]);
    }
    echo json_encode(['deleted' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete']);
}
