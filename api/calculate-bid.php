<?php

/**
 * POST /api/calculate-bid (Budget → Bid)
 * Body: target_total, vat_percent, buyers_premium_percent, document_fee
 * Formula: estimated_bid = (target_total/(1+vat/100) - document_fee) / (1 + buyers_premium/100)
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

$targetTotal          = (float) ($data['target_total'] ?? 0);
$vatPercent           = (float) ($data['vat_percent'] ?? 0);
$buyersPremiumPercent = (float) ($data['buyers_premium_percent'] ?? 0);
$documentFee          = (float) ($data['document_fee'] ?? 0);
$extraFee             = isset($data['extra_fee']) ? (float) $data['extra_fee'] : 0;
$payingInCash         = isset($data['paying_in_cash']) ? (bool) $data['paying_in_cash'] : false;
$cashFeePercent       = isset($data['cash_fee_percent']) ? (float) $data['cash_fee_percent'] : 0;

$vatFactor = 1 + ($vatPercent / 100);
if ($vatFactor <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid VAT']);
    exit;
}

$subtotal = $targetTotal / $vatFactor;

// Cash handling fee: % of target total, converted to pre-VAT
$cashFee = 0.0;
if ($payingInCash && $cashFeePercent > 0) {
    $cashFeeGross = $targetTotal * ($cashFeePercent / 100);
    $cashFee = $cashFeeGross / $vatFactor;
}

$bpFactor = 1 + ($buyersPremiumPercent / 100);
if ($bpFactor <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid buyer\'s premium']);
    exit;
}

// estimated_bid = ((target_total/vat_factor) - document_fee - extra_fee - cash_fee) / (1 + buyers_premium)
$estimatedBid  = ($subtotal - $documentFee - $extraFee - $cashFee) / $bpFactor;
$buyersPremium = $estimatedBid * ($buyersPremiumPercent / 100);
$vatAmount     = $targetTotal - $subtotal;

echo json_encode([
    'subtotal'        => round($subtotal, 2),
    'vat_amount'      => round($vatAmount, 2),
    'buyers_premium'  => round($buyersPremium, 2),
    'estimated_bid'   => round($estimatedBid, 2),
    'document_fee'    => round($documentFee, 2),
    'extra_fee'       => round($extraFee, 2),
    'cash_fee'        => round($cashFee, 2),
]);
