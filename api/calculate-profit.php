<?php

/**
 * POST /api/calculate-profit (Selling Price & Profit)
 * Body: purchase_price, total_expenses, profit_percentage
 * Formula: total_cost = purchase + expenses; profit = total_cost * profit%; selling_price = total_cost + profit
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

$purchasePrice  = (float) ($data['purchase_price'] ?? 0);
$totalExpenses  = (float) ($data['total_expenses'] ?? 0);
$profitPercent  = (float) ($data['profit_percentage'] ?? 0);

$totalCost    = $purchasePrice + $totalExpenses;
$profitValue  = $totalCost * ($profitPercent / 100);
$sellingPrice = $totalCost + $profitValue;

echo json_encode([
    'total_cost'       => round($totalCost, 2),
    'profit_value'     => round($profitValue, 2),
    'profit_percentage' => round($profitPercent, 2),
    'selling_price'    => round($sellingPrice, 2),
]);
