<?php

/**
 * Database configuration – load from .env in api root.
 * PDO singleton for BizTools API.
 */

declare(strict_types=1);

function biztools_db(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
    if (!is_file($envPath)) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Server configuration missing (.env)']);
        exit;
    }

    $env = parse_ini_file($envPath);
    if ($env === false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Invalid .env file']);
        exit;
    }

    $host = $env['DB_HOST'] ?? 'localhost';
    $name = $env['DB_NAME'] ?? 'biztools_db';
    $user = $env['DB_USER'] ?? '';
    $pass = $env['DB_PASS'] ?? '';

    $dsn = "mysql:host=" . $host . ";dbname=" . $name . ";charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    return $pdo;
}
