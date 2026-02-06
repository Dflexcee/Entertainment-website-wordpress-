<?php

/**
 * POST /api/calculate-total (Bid → Total)
 * Body: bid_amount, buyers_premium_percent, document_fee, vat_percent
 * Formula: bp = bid * bp%; subtotal = bid + bp + doc_fee; vat = subtotal * vat%; total = subtotal + vat
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

$bidAmount            = (float) ($data['bid_amount'] ?? 0);
$buyersPremiumPercent = (float) ($data['buyers_premium_percent'] ?? 0);
$documentFee          = (float) ($data['document_fee'] ?? 0);
$vatPercent           = (float) ($data['vat_percent'] ?? 0);
$extraFee             = isset($data['extra_fee']) ? (float) $data['extra_fee'] : 0;
$payingInCash         = isset($data['paying_in_cash']) ? (bool) $data['paying_in_cash'] : false;
$cashFeePercent       = isset($data['cash_fee_percent']) ? (float) $data['cash_fee_percent'] : 0;

$buyersPremium = $bidAmount * ($buyersPremiumPercent / 100);
$subtotal      = $bidAmount + $buyersPremium + $documentFee + $extraFee;

$cashFee = 0.0;
if ($payingInCash && $cashFeePercent > 0) {
    $cashFee = $subtotal * ($cashFeePercent / 100);
}

$vatAmount = ($subtotal + $cashFee) * ($vatPercent / 100);
$total     = $subtotal + $cashFee + $vatAmount;

echo json_encode([
    'bid'             => round($bidAmount, 2),
    'buyers_premium'  => round($buyersPremium, 2),
    'document_fee'    => round($documentFee, 2),
    'extra_fee'       => round($extraFee, 2),
    'subtotal'        => round($subtotal, 2),
    'vat'             => round($vatAmount, 2),
    'cash_fee'        => round($cashFee, 2),
    'total'           => round($total, 2),
]);
