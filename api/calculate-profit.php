<?php

/**
 * POST /api/calculate-profit (Selling Price & Profit)
 * Body: purchase_price, total_expenses, selling_multiple [, extra_fee ]
 * Formula: total_cost = purchase + expenses;
 *          selling_price = total_cost × selling_multiple (e.g. 2 = 2× cost);
 *          total_selling_price = selling_price + extra_fee  (extra fee added ON TOP of selling price)
 * Example: 10000 + 5000, multiple 2, extra_fee 500 → cost 15000, selling 30000, total 30500
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

$purchasePrice   = (float) ($data['purchase_price'] ?? 0);
$totalExpenses   = (float) ($data['total_expenses'] ?? 0);
$sellingMultiple = (float) ($data['selling_multiple'] ?? 0);
$extraFee        = isset($data['extra_fee']) ? (float) $data['extra_fee'] : 0;

$totalCost = $purchasePrice + $totalExpenses;

if ($sellingMultiple <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Selling multiple must be greater than 0 (e.g. 3 for 3× cost).']);
    exit;
}

$sellingPrice      = $totalCost * $sellingMultiple;
$profitValue       = $sellingPrice - $totalCost;
$totalSellingPrice = $sellingPrice + $extraFee;

echo json_encode([
    'total_cost'         => round($totalCost, 2),
    'profit_value'       => round($profitValue, 2),
    'selling_multiple'   => round($sellingMultiple, 2),
    'selling_price'      => round($sellingPrice, 2),
    'extra_fee'          => round($extraFee, 2),
    'total_selling_price' => round($totalSellingPrice, 2),
]);
