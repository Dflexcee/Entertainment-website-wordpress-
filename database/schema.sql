-- BizTools – Run this once in phpMyAdmin (select database first)
-- Database: biztools_db (create it first if needed)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table: users (soft registration, phone = unique ID)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(11) NOT NULL,
  `last_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `last_verified_at` (`last_verified_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: calculation_history (all 3 features, JSON for inputs/outputs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calculation_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_phone` VARCHAR(11) NOT NULL,
  `feature_type` VARCHAR(50) NOT NULL COMMENT 'budget_to_bid | bid_to_total | profit',
  `input_data` JSON NOT NULL,
  `output_data` JSON NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_phone` (`user_phone`),
  KEY `feature_type` (`feature_type`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
