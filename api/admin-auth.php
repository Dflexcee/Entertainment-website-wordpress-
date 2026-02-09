<?php

/**
 * Shared admin authentication check.
 * Include this at the top of every admin endpoint after bootstrap.
 * Reads the Authorization header and validates the token.
 */

function require_admin_auth(): void
{
    $envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
    $env = is_file($envPath) ? parse_ini_file($envPath) : [];
    $adminUser = $env['ADMIN_USERNAME'] ?? 'admin';
    $adminPass = $env['ADMIN_PASSWORD'] ?? 'admin123';

    $expectedToken = hash('sha256', $adminUser . ':' . $adminPass . ':biztools_admin_secret');

    // Try multiple sources: header, custom header, query param
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['HTTP_X_ADMIN_TOKEN']
        ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    // Fallback: read from query string (most reliable on XAMPP)
    if (!$token && !empty($_GET['admin_token'])) {
        $token = $_GET['admin_token'];
    }

    if ($token !== $expectedToken) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Admin login required.']);
        exit;
    }
}
