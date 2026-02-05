<?php

/**
 * POST /api/history-save
 * Body: user_phone, feature_type, input_data, output_data
 * feature_type: budget_to_bid | bid_to_total | profit
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

$userPhone   = isset($data['user_phone']) ? trim((string) $data['user_phone']) : '';
$featureType = isset($data['feature_type']) ? trim((string) $data['feature_type']) : '';
$inputData   = $data['input_data'] ?? null;
$outputData  = $data['output_data'] ?? null;

$allowed = ['budget_to_bid', 'bid_to_total', 'profit'];
if ($userPhone === '' || !in_array($featureType, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid user_phone / feature_type']);
    exit;
}

if (!is_array($inputData)) {
    $inputData = [];
}
if (!is_array($outputData)) {
    $outputData = [];
}

$inputJson  = json_encode($inputData);
$outputJson = json_encode($outputData);

try {
    $pdo = biztools_db();
    $stmt = $pdo->prepare('INSERT INTO calculation_history (user_phone, feature_type, input_data, output_data) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userPhone, $featureType, $inputJson, $outputJson]);
    $id = (int) $pdo->lastInsertId();
    echo json_encode(['id' => $id, 'saved' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save history']);
}
