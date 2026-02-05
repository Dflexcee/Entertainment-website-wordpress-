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

$targetTotal         = (float) ($data['target_total'] ?? 0);
$vatPercent          = (float) ($data['vat_percent'] ?? 0);
$buyersPremiumPercent = (float) ($data['buyers_premium_percent'] ?? 0);
$documentFee         = (float) ($data['document_fee'] ?? 0);

$vatFactor = 1 + ($vatPercent / 100);
if ($vatFactor <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid VAT']);
    exit;
}

$subtotal = $targetTotal / $vatFactor;

$bpFactor = 1 + ($buyersPremiumPercent / 100);
if ($bpFactor <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid buyer\'s premium']);
    exit;
}

$estimatedBid   = ($subtotal - $documentFee) / $bpFactor;
$buyersPremium  = $estimatedBid * ($buyersPremiumPercent / 100);
$vatAmount      = $targetTotal - $subtotal;

echo json_encode([
    'subtotal'         => round($subtotal, 2),
    'vat_amount'       => round($vatAmount, 2),
    'buyers_premium'   => round($buyersPremium, 2),
    'estimated_bid'   => round($estimatedBid, 2),
]);
