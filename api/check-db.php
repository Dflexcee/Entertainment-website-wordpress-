<?php

/**
 * GET /api/check-db.php
 * Quick test: can we connect to the database?
 * Open in browser or call from frontend to see a clear message.
 */

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = biztools_db();
    $pdo->query('SELECT 1');
    echo json_encode(['ok' => true, 'message' => 'Database connection OK. History save will work.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage(),
        'hint'  => 'Ensure MySQL is running in XAMPP, api/.env has correct DB_HOST, DB_NAME, DB_USER, DB_PASS, and you ran database/schema.sql in phpMyAdmin.',
    ]);
}
