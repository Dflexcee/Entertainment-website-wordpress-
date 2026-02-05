<?php

/**
 * GET /api/history-list.php?user_phone=08012345678
 * Returns all history for this user, newest first.
 */

require_once __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userPhone = isset($_GET['user_phone']) ? trim((string) $_GET['user_phone']) : '';
if ($userPhone === '' || !preg_match('/^[0-9]{11}$/', $userPhone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid user_phone (11 digits) required']);
    exit;
}

try {
    $pdo = biztools_db();
    $stmt = $pdo->prepare('SELECT id, user_phone, feature_type, input_data, output_data, created_at FROM calculation_history WHERE user_phone = ? ORDER BY created_at DESC');
    $stmt->execute([$userPhone]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $list = [];
    foreach ($rows as $row) {
        $list[] = [
            'id'          => (int) $row['id'],
            'feature_type' => $row['feature_type'],
            'input_data'  => json_decode($row['input_data'], true) ?? [],
            'output_data' => json_decode($row['output_data'], true) ?? [],
            'created_at'  => $row['created_at'],
        ];
    }
    echo json_encode(['history' => $list]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load history']);
}
