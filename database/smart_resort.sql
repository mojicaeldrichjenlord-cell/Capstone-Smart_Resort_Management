-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2026 at 05:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_resort`
--

-- --------------------------------------------------------

--
-- Table structure for table `accommodations`
--

CREATE TABLE `accommodations` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `max_capacity` int(11) DEFAULT NULL,
  `free_entrance_pax` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `map_label` varchar(150) DEFAULT NULL,
  `status` enum('available','unavailable') NOT NULL DEFAULT 'available',
  `day_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `overnight_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `extended_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `day_start_time` time DEFAULT NULL,
  `day_end_time` time DEFAULT NULL,
  `overnight_start_time` time DEFAULT NULL,
  `overnight_end_time` time DEFAULT NULL,
  `extended_start_time` time DEFAULT NULL,
  `extended_end_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accommodations`
--

INSERT INTO `accommodations` (`id`, `category_id`, `name`, `description`, `max_capacity`, `free_entrance_pax`, `image`, `map_label`, `status`, `day_price`, `overnight_price`, `extended_price`, `day_start_time`, `day_end_time`, `overnight_start_time`, `overnight_end_time`, `extended_start_time`, `extended_end_time`, `created_at`, `updated_at`) VALUES
(33, 2, 'Single Room (Cottage 1)', 'Single room for 2-4 pax, 1 bed, 1 bathroom, free pool and beach entrance for 2 pax.', 4, 0, 'images/accommodations/single-room-cover.jpg', 'Room Wing - Single Room', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-04-18 06:45:44', '2026-05-09 14:12:56'),
(36, 2, 'Family Room-A', 'Family room for 3-7 pax, 2 beds, free pool and beach entrance for 3 pax.', 7, 0, 'images/accommodations/family-room-a-cover.jpg', 'Room Wing - Family Room A', 'available', 3500.00, 3500.00, 6000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-04-18 06:45:44', '2026-05-09 05:58:37'),
(37, 2, 'Family Room-B', 'Family room for 8-20 pax, 4 beds, 2 bathrooms, free pool and beach entrance for 8 pax.', 20, 0, 'images/accommodations/family-room-b-cover.jpg', 'Room Wing - Family Room B', 'available', 8000.00, 8000.00, 15000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-04-18 06:45:44', '2026-05-09 13:59:05'),
(39, 3, 'Pool Pavillion', 'Function area with 100-150 pax capacity. Entrance fee not included.', 150, 0, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'Function Area - Pool Pavillion', 'available', 12000.00, 12000.00, 20000.00, '08:00:00', '18:00:00', '20:00:00', '06:00:00', '08:00:00', '18:00:00', '2026-04-18 06:45:44', '2026-04-18 06:46:09'),
(42, 1, 'Small Nipa Hut 2', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-2.jpg', 'Cottage - Small Nipa Hut 2', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:42:18', '2026-05-11 07:42:18'),
(43, 1, 'Small Nipa Hut 3', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-3.jpg', 'Cottage - Small Nipa Hut 3', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:44:36', '2026-05-11 07:44:36'),
(44, 1, 'Small Nipa Hut 4', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-4.jpg', 'Cottage - Small Nipa Hut 4', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:45:43', '2026-05-11 07:45:43'),
(45, 1, 'Small Nipa Hut 7', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-7.jpg', 'Cottage - Small Nipa Hut 7', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:47:03', '2026-05-11 07:47:03'),
(46, 1, 'Small Nipa Hut 8', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-8.jpg', 'Cottage - Small Nipa Hut 8', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:48:15', '2026-05-11 07:48:15'),
(47, 1, 'Small Shade 1', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-1.jpg', 'Cottage - Small Shade 1', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:50:24', '2026-05-11 07:50:24'),
(48, 1, 'Small Shade 1A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-1A.jpg', 'Cottage - Small Shade 1A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:51:20', '2026-05-11 07:51:58'),
(49, 1, 'Small Shade 3', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-3.jpg', 'Cottage - Small Shade 3', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:52:49', '2026-05-11 07:52:49'),
(50, 1, 'Small Shade 3A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-3A.jpg', 'Cottage Small Shade 3A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:53:46', '2026-05-11 07:53:46'),
(51, 1, 'Small Shade 5', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-5.jpg', 'Cottage - Small Shade 5', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:54:44', '2026-05-11 07:54:44'),
(52, 1, 'Small Shade 5A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-5A.jpg', 'Cottage - Small Shade 5A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:55:34', '2026-05-11 07:55:34'),
(53, 1, 'Small Shade 10', 'Cottage Accommodation 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-10.jpg', 'Cottage - Small Shade 10', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 07:56:40', '2026-05-11 07:56:40'),
(54, 1, 'Small Shade 10A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-10A.jpg', 'Cottage - Small Shade 10A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:02:14', '2026-05-11 08:02:14'),
(55, 1, 'Small Shade 11', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-11.jpg', 'Cottage - Small Shade 11', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:03:22', '2026-05-11 08:03:22'),
(56, 1, 'Small Shade 11A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-11A.jpg', 'Cottage - Small Shade 11A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:04:14', '2026-05-11 08:04:14'),
(57, 1, 'Small Shade 12', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-12.jpg', 'Cottage - Small Shade 12A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:05:16', '2026-05-11 08:05:16'),
(58, 1, 'Small Shade 12A', 'Cottage Accommodation 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-12A.jpg', 'Cottage - Small Shade 12A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:23:47', '2026-05-11 08:23:47'),
(59, 1, 'Small Shade 13', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-13.jpg', 'Cottage - Small Shade 13', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:24:40', '2026-05-11 08:24:40'),
(60, 1, 'Small Shade 13A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-13A.jpg', 'Cottage - Small Shade 13A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:25:33', '2026-05-11 08:25:33'),
(61, 1, 'Small Shade 14', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-14.jpg', 'Cottage - Small Shade 14', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '06:00:00', '2026-05-11 08:26:15', '2026-05-11 08:26:15'),
(62, 1, 'Small Shade 14A', 'Cottage Accommodation for 8-10 pax.', 10, 0, 'images/accommodations/Small-Shade/Small-Shade-14A.jpg', 'Cottage - Small Shade 14A', 'available', 800.00, 800.00, 1500.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-11 08:27:19', '2026-05-11 08:27:19'),
(63, 1, 'Big Nipa Hut 2', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-2.jpg', 'Cottage - Big Nipa Hut 2', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:10:29', '2026-05-30 06:11:02'),
(64, 1, 'Big Nipa Hut 3', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-3.jpg', 'Cottage - Big Nipa Hut 3', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:12:22', '2026-05-30 06:12:22'),
(65, 1, 'Big Nipa Hut 4', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-4.jpg', 'Cottage - Big Nipa Hut 4', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:13:25', '2026-05-30 06:13:25'),
(66, 1, 'Big Nipa Hut 5', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-5.jpg', 'Cottage - Big Nipa Hut 5', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:15:05', '2026-05-30 06:15:05'),
(67, 1, 'Big Nipa Hut 10', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-10.jpg', 'Cottage - Big Nipa Hut 10', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:16:24', '2026-05-30 06:16:24'),
(68, 1, 'Big Nipa Hut 11', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-11.jpg', 'Cottage - Big Nipa Hut 11', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:17:18', '2026-05-30 06:17:18'),
(69, 1, 'Big Nipa Hut 12', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-12.jpg', 'Cottage - Big Nipa Hut 12', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:18:07', '2026-05-30 06:18:07'),
(70, 1, 'Big Nipa Hut 13', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-13.jpg', 'Cottage - Big Nipa Hut 13', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:19:07', '2026-05-30 06:19:07'),
(71, 1, 'Big Nipa Hut 14', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-14.jpg', 'Cottage - Big Nipa Hut 14', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:19:58', '2026-05-30 06:19:58'),
(72, 1, 'Big Nipa Hut 15', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-15.jpg', 'Cottage - Big Nipa Hut 15', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:20:44', '2026-05-30 06:20:44'),
(73, 1, 'Big Nipa Hut 16', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-16.jpg', 'Cottage - Big Nipa Hut 16', 'available', 1000.00, 1000.00, 2000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:21:25', '2026-05-30 06:21:25'),
(74, 1, 'Big Shade 2', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-2.jpg', 'Cottage - Big Shade 2', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:25:06', '2026-05-30 06:25:06'),
(75, 1, 'Big Shade 4', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-4.jpg', 'Cottage - Big Shade 4', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:26:17', '2026-05-30 06:26:17'),
(76, 1, 'Big Shade 6', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-6.jpg', 'Cottage - Big Shade 6', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:27:08', '2026-05-30 06:27:08'),
(77, 1, 'Big Shade 7', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-7.jpg', 'Cottage - Big Shade 7', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:28:00', '2026-05-30 06:28:00'),
(78, 1, 'Big Shade 8', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-8.jpg', 'Cottage - Big Shade 8', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:28:52', '2026-05-30 06:28:52'),
(79, 1, 'Big Shade 9', 'Cottage accommodation for 20-25 pax.', 25, 0, 'images/accommodations/Big-Shade/Big-Shade-9.jpg', 'Cottage - Big Shade 9', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:29:35', '2026-05-30 06:29:35'),
(80, 1, 'Pool Shade A', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-A.jpg', 'Cottage - Pool Shade A', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:31:39', '2026-05-30 06:31:39'),
(81, 1, 'Pool Shade C', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-C.jpg', 'Cottage - Pool Shade C', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '17:00:00', '06:00:00', '05:00:00', '2026-05-30 06:32:28', '2026-05-30 06:32:28'),
(82, 1, 'Pool Shade D', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-D.jpg', 'Cottage - Pool Shade D', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '17:00:00', '06:00:00', '05:00:00', '2026-05-30 06:33:21', '2026-05-30 06:33:21'),
(83, 1, 'Pool Shade E', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-E.jpg', 'Cottage - Pool Shade E', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:34:14', '2026-05-30 06:34:14'),
(84, 1, 'Pool Shade G', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-G.jpg', 'Cottage - Pool Shade G', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:35:13', '2026-05-30 06:35:13'),
(85, 1, 'Pool Shade H', 'Cottage accommodation for 15-20 pax.', 20, 0, 'images/accommodations/Pool-Shade/Pool-Shade-H.jpg', 'Cottage - Pool Shade H', 'available', 1500.00, 1500.00, 3000.00, '06:00:00', '17:00:00', '18:00:00', '05:00:00', '06:00:00', '05:00:00', '2026-05-30 06:35:52', '2026-05-30 06:35:52'),
(86, 2, 'Single Room Cottage 1', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Cottage-1.jpg', 'Room - Single Room Cottage 1', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '17:00:00', '2026-05-30 06:41:36', '2026-05-30 06:42:02'),
(87, 2, 'Single Room Cottage 2', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Cottage-2.jpg', 'Room - Single Room Cottage 2', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:43:16', '2026-05-30 06:43:16'),
(88, 2, 'Single Room Cottage 3', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Cottage-3.jpg', 'Room - Single Room Cottage 3', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:44:36', '2026-05-30 06:44:36'),
(89, 2, 'Single Room Cottage 4', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Cottage-4.jpg', 'Room - Single Room Cottage 4', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:45:50', '2026-05-30 06:45:50'),
(90, 2, 'Single Room Cottage 5', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Cottage-5.jpg', 'Room - Single Room Cottage 5', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:47:03', '2026-05-30 06:47:03'),
(91, 2, 'Single Room (Pool Side) A', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool Side) A', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:49:21', '2026-05-30 06:58:45'),
(92, 2, 'Single Room (Pool side) B', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool side) B', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:50:33', '2026-05-30 06:58:59'),
(93, 2, 'Single Room (Pool side) C', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool side) C', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:51:45', '2026-05-30 06:59:11'),
(94, 2, 'Single Room (Pool side) D', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool side) D', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:52:46', '2026-05-30 06:59:25'),
(95, 2, 'Single Room (Pool side) E', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool side) E', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:56:59', '2026-05-30 06:56:59'),
(96, 2, 'Single Room (Pool side) F', 'Room accommodation for 2-4 pax.', 4, 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg', 'Room - Single Room (Pool side) F', 'available', 3000.00, 3000.00, 5000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 06:58:28', '2026-05-30 06:58:28'),
(97, 2, 'Double Room 1', 'Room accommodation for 3-7 pax.', 7, 0, 'images/accommodations/Double-Room/Double-Room-Cover.jpg', 'Room - Double Room 1', 'available', 4000.00, 4000.00, 7000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 07:02:31', '2026-05-30 07:02:31'),
(98, 2, 'Double Room 2', 'Room accommodation for 3-7 pax.', 7, 0, 'images/accommodations/Double-Room/Double-Room-Cover.jpg', 'Room - Double Room 2', 'available', 4000.00, 4000.00, 7000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 07:03:29', '2026-05-30 07:03:29'),
(99, 2, 'Family Room A', 'Room accommodation for 3-7 pax.', 7, 0, 'images/accommodations/Family-Room-A-Cover.jpg', 'Room - Family Room A', 'available', 3500.00, 3500.00, 6000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 07:06:01', '2026-05-30 07:06:01'),
(100, 2, 'Family Room B', 'Room accommodation for 3-7 pax.', 7, 0, 'images/accommodations/Family-Room-B-Cover.jpg', 'Room - Family Room B', 'available', 3500.00, 3500.00, 6000.00, '07:00:00', '17:00:00', '19:00:00', '05:00:00', '07:00:00', '05:00:00', '2026-05-30 07:07:35', '2026-05-30 07:07:35');

-- --------------------------------------------------------

--
-- Table structure for table `accommodation_categories`
--

CREATE TABLE `accommodation_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accommodation_categories`
--

INSERT INTO `accommodation_categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Cottage', 'Default cottage category', '2026-04-18 05:54:31'),
(2, 'Room', 'Default room category', '2026-04-18 05:54:31'),
(3, 'Function Area', 'Default function area / pavillion category', '2026-04-18 05:54:31');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `booking_source` varchar(20) NOT NULL DEFAULT 'online',
  `walkin_guest_name` varchar(150) DEFAULT NULL,
  `walkin_guest_phone` varchar(50) DEFAULT NULL,
  `walkin_guest_address` text DEFAULT NULL,
  `room_id` int(11) NOT NULL,
  `check_in` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out` date NOT NULL,
  `check_out_time` time DEFAULT NULL,
  `guests` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) NOT NULL DEFAULT 'cash',
  `payment_status` varchar(50) NOT NULL DEFAULT 'pending',
  `extra_bed_count` int(11) DEFAULT 0,
  `extra_bed_fee` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `booking_source`, `walkin_guest_name`, `walkin_guest_phone`, `walkin_guest_address`, `room_id`, `check_in`, `check_in_time`, `check_out`, `check_out_time`, `guests`, `status`, `created_at`, `payment_method`, `payment_status`, `extra_bed_count`, `extra_bed_fee`) VALUES
(27, 8, 'online', NULL, NULL, NULL, 8, '2026-05-01', '08:00:00', '2026-05-02', '10:00:00', 5, 'approved', '2026-04-06 01:41:39', 'cash', 'unpaid', 0, 0.00),
(28, NULL, 'walk-in', 'walkinCustomer', '009188329323', 'kwodkosad', 8, '2026-04-16', '14:00:00', '2026-04-17', '12:00:00', 6, 'approved', '2026-04-16 13:22:15', 'cash', 'pending', 0, 0.00),
(29, 8, 'online', NULL, NULL, NULL, 9, '2026-04-17', '14:00:00', '2026-04-18', '12:00:00', 1, 'pending', '2026-04-17 06:11:58', 'cash', 'unpaid', 0, 0.00),
(30, 8, 'online', NULL, NULL, NULL, 8, '2026-04-17', '14:00:00', '2026-04-18', '12:00:00', 1, 'pending', '2026-04-17 06:16:40', 'cash', 'unpaid', 0, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `booking_modification_requests`
--

CREATE TABLE `booking_modification_requests` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `requested_check_in_date` date DEFAULT NULL,
  `requested_slot_type` varchar(50) DEFAULT NULL,
  `requested_guest_count` int(11) DEFAULT NULL,
  `requested_note` text DEFAULT NULL,
  `request_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `map_markers`
--

CREATE TABLE `map_markers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `info` text DEFAULT NULL,
  `x` float DEFAULT NULL,
  `y` float DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `accommodation_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `map_markers`
--

INSERT INTO `map_markers` (`id`, `name`, `type`, `color`, `info`, `x`, `y`, `room_id`, `created_at`, `accommodation_id`) VALUES
(16, 'Small Shade 1', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 38.892, 45.4286, 47, '2026-05-11 08:18:48', NULL),
(17, 'Small Shade 1A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 38.9, 39.3, 48, '2026-05-13 05:38:35', NULL),
(18, 'Small Shade 3', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 46, 45, 49, '2026-05-13 05:38:35', NULL),
(19, 'Small Shade 3A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 46, 40, 50, '2026-05-13 05:38:35', NULL),
(20, 'Small Shade 5', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 53.1, 44.1, 51, '2026-05-13 05:38:35', NULL),
(21, 'Small Shade 5A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 53.1, 39.3, 52, '2026-05-13 05:38:35', NULL),
(22, 'Small Shade 10', 'shade', '#4a50c8', 'Cottage Accommodation 8-10 pax.', 42.8, 60.9, 53, '2026-05-13 05:38:35', NULL),
(23, 'Small Shade 10A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 42.8, 65.7, 54, '2026-05-13 05:46:16', NULL),
(24, 'Small Shade 11', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 45.8, 60.3, 55, '2026-05-13 05:46:16', NULL),
(25, 'Small Shade 11A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 45.9, 65.8, 56, '2026-05-13 05:46:16', NULL),
(26, 'Small Shade 12', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 49.5455, 60.1165, 57, '2026-05-13 05:46:16', NULL),
(27, 'Small Shade 12A', 'shade', '#4a50c8', 'Cottage Accommodation 8-10 pax.', 49.7, 65.2, 58, '2026-05-13 05:46:16', NULL),
(28, 'Small Shade 13', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 53.271, 60.225, 59, '2026-05-13 05:46:16', NULL),
(29, 'Small Shade 13A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 53.4, 65, 60, '2026-05-13 05:46:16', NULL),
(30, 'Small Shade 14', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 57, 59.9, 61, '2026-05-13 05:46:16', NULL),
(31, 'Small Shade 14A', 'shade', '#4a50c8', 'Cottage Accommodation for 8-10 pax.', 57.1, 64.9, 62, '2026-05-13 05:46:16', NULL),
(32, 'Family Room-B', 'room', '#0ea5e9', 'Family room for 8-20 pax, 4 beds, 2 bathrooms, free pool and beach entrance for 8 pax.', 20.5, 5.2, 37, '2026-05-29 12:42:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `reservation_code` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `booking_source` enum('online','manual') NOT NULL DEFAULT 'online',
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `contact_no` varchar(50) NOT NULL,
  `guest_count` int(11) NOT NULL DEFAULT 1,
  `estimated_entrance_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `accommodation_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `required_downpayment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `remaining_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `payment_method` enum('gcash','paymaya','cash','walk_in','other') NOT NULL DEFAULT 'gcash',
  `payment_status` enum('pending','paid','partially_paid','unpaid','rejected') NOT NULL DEFAULT 'pending',
  `reservation_status` enum('pending','approved','cancelled','completed') NOT NULL DEFAULT 'pending',
  `proof_of_payment` varchar(255) DEFAULT NULL,
  `reserved_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `reservation_code`, `user_id`, `booking_source`, `first_name`, `middle_name`, `last_name`, `contact_no`, `guest_count`, `estimated_entrance_fee`, `accommodation_total`, `required_downpayment`, `paid_amount`, `remaining_balance`, `note`, `payment_method`, `payment_status`, `reservation_status`, `proof_of_payment`, `reserved_at`, `created_at`, `updated_at`) VALUES
(1, 'APR-19-001', NULL, 'manual', 'Eldrich', 'F.', 'F.Mojica', '09672995549', 13, 3900.00, 1000.00, 500.00, 0.00, 1000.00, 'Entrance Type: Pool & Beach | Reference Number: 9172839391931839 | Free Entrance Included: 0 pax | Chargeable Entrance Guests: 13 | Discount reminder: Senior/PWD/Kids discount will be verified at the front desk. | Customer Note: wala | test', 'cash', 'pending', 'pending', '/uploads/payment-proofs/1776570833532-Screenshot_2026-04-18_202438.png', '2026-04-19 11:53:53', '2026-04-19 03:53:53', '2026-04-19 03:53:53'),
(6, 'MAY-11-001', 8, 'online', 'Customer', 'f', 'wqewq', '09672995549', 10, 2500.00, 800.00, 400.00, 800.00, 0.00, 'Entrance Type: Pool & Beach | Free Entrance Included: 0 pax | Chargeable Entrance Guests: 10 | Discount reminder: Senior/PWD/Kids discount will be verified at the front desk. | Reference Number: 9172839391931839', 'gcash', 'paid', 'approved', '/uploads/payment-proofs/1778487658868-Single-Room-Poolside-1.jpg', '2026-05-11 16:20:58', '2026-05-11 08:20:58', '2026-05-17 13:54:03'),
(7, 'MAY-29-001', NULL, 'manual', 'Eldrich', 'user middle', 'user last', '09672995549', 4, 1200.00, 800.00, 400.00, 800.00, 0.00, 'Entrance Type: Pool & Beach | Free Entrance Included: 0 pax | Chargeable Entrance Guests: 4 | Discount reminder: Senior/PWD/Kids discount will be verified at the front desk. | Manual Reservation Payment Type: 50% Down Payment', 'gcash', 'paid', 'completed', NULL, '2026-05-29 11:45:58', '2026-05-29 03:45:58', '2026-05-29 10:45:20'),
(8, 'MAY-29-002', NULL, 'manual', 'Eldrich', 'F.', 'user last', '09123456789', 2, 600.00, 4300.00, 2150.00, 4300.00, 0.00, 'Entrance Type: Pool & Beach | Free Entrance Included: 0 pax | Chargeable Entrance Guests: 2 | Discount reminder: Senior/PWD/Kids discount will be verified at the front desk. | Manual Reservation Payment Type: Full Payment | Customer Note: dsadwd', 'cash', 'paid', 'approved', NULL, '2026-05-29 20:08:32', '2026-05-29 12:08:32', '2026-05-29 12:08:32'),
(9, 'MAY-30-001', 14, 'online', 'Eldrich', 'F.', 'F.Mojica', '09672995549', 23, 5750.00, 800.00, 400.00, 0.00, 800.00, 'Entrance Type: Pool & Beach | Free Entrance Included: 0 pax | Chargeable Entrance Guests: 23 | Discount reminder: Senior/PWD/Kids discount will be verified at the front desk. | Reference Number: 9172839391931839', 'gcash', 'pending', 'pending', '/uploads/payment-proofs/1780080594945-mb-MEG-ACE-1920-1080.jpg', '2026-05-30 02:49:54', '2026-05-29 18:49:54', '2026-05-29 18:49:54');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_items`
--

CREATE TABLE `reservation_items` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `slot_type` enum('day_tour','overnight','extended') NOT NULL,
  `slot_label` varchar(100) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_in_time` time NOT NULL,
  `check_out_date` date NOT NULL,
  `check_out_time` time NOT NULL,
  `item_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation_items`
--

INSERT INTO `reservation_items` (`id`, `reservation_id`, `accommodation_id`, `slot_type`, `slot_label`, `check_in_date`, `check_in_time`, `check_out_date`, `check_out_time`, `item_price`, `created_at`) VALUES
(7, 6, 47, 'day_tour', 'Day Tour', '2026-05-11', '06:00:00', '2026-05-11', '17:00:00', 800.00, '2026-05-11 08:20:58'),
(8, 7, 58, 'overnight', 'Overnight', '2026-05-29', '18:00:00', '2026-05-30', '05:00:00', 800.00, '2026-05-29 03:45:58'),
(9, 8, 46, 'overnight', 'Overnight', '2026-05-29', '18:00:00', '2026-05-30', '05:00:00', 800.00, '2026-05-29 12:08:32'),
(10, 8, 36, 'day_tour', 'Day Tour', '2026-05-29', '07:00:00', '2026-05-29', '17:00:00', 3500.00, '2026-05-29 12:08:32'),
(11, 9, 62, 'day_tour', 'Day Tour', '2026-05-29', '06:00:00', '2026-05-29', '17:00:00', 800.00, '2026-05-29 18:49:54');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `capacity` int(11) NOT NULL,
  `bed_count` int(11) DEFAULT NULL,
  `bed_type` varchar(100) DEFAULT NULL,
  `view_type` varchar(100) DEFAULT NULL,
  `aircon_type` varchar(50) DEFAULT NULL,
  `amenities` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_name`, `description`, `price`, `capacity`, `bed_count`, `bed_type`, `view_type`, `aircon_type`, `amenities`, `image`, `status`) VALUES
(2, 'Family Cottage', 'Spacious cottage perfect for family outings.', 4500.00, 10, 5, '1 Queen Bed, 4 Double Beds', 'standard view', 'aircon', 'wdwds', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'available'),
(3, 'Poolside Villa', 'Premium villa with relaxing poolside view.', 6500.00, 8, 4, '2 Queen Bed, 2 Double Beds', 'mountain view', 'aircon', 'wdadw', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'available'),
(4, 'Deluxe Room', 'A cozy room good for couples and small families.', 2500.00, 2, 1, '1 queen', 'mountain view', 'aircon', 'hello', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'available'),
(5, 'Family Cottage', 'Spacious cottage perfect for family outings.', 4500.00, 6, 3, '1 Queen Bed, 2 Double Beds', 'beach view', 'aircon', 'wifi', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'available'),
(6, 'Poolside Villa', 'Premium villa with relaxing poolside view.', 6500.00, 4, 4, '1 queen', 'garden view', 'aircon', 'dwdsa', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'available'),
(8, 'New ROOM', 'ayos ayos', 6500.00, 6, 3, '1 Queen Bed, 2 Double Beds', 'pool view', 'aircon', 'madami tinatamad nako mag type', 'images/room3.jpg', 'available'),
(9, 'Together Room', 'ayos ayos', 4500.00, 2, 1, '1 queen', 'standard view', 'aircon', 'Wifi, PC', 'https://img.freepik.com/free-photo/interior-modern-comfortable-hotel-room_1232-1822.jpg?semt=ais_incoming&w=740&q=80', 'available');

-- --------------------------------------------------------

--
-- Table structure for table `room_gallery`
--

CREATE TABLE `room_gallery` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `image_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_gallery`
--

INSERT INTO `room_gallery` (`id`, `room_id`, `image_path`, `sort_order`, `image_url`) VALUES
(36, 36, '', 0, 'images/accommodations/family-room-a-1.jpg'),
(37, 36, '', 0, 'images/accommodations/family-room-a-2.jpg'),
(38, 36, '', 0, 'images/accommodations/family-room-a-3.jpg'),
(39, 36, '', 0, 'images/accommodations/family-room-a-4.jpg'),
(40, 36, '', 0, 'images/accommodations/family-room-a-5.jpg'),
(41, 36, '', 0, 'images/accommodations/family-room-a-6.jpg'),
(42, 37, '', 0, 'images/accommodations/family-room-b-1.jpg'),
(43, 37, '', 0, 'images/accommodations/family-room-b-2.jpg'),
(44, 37, '', 0, 'images/accommodations/family-room-b-3.jpg'),
(45, 37, '', 0, 'images/accommodations/family-room-b-4.jpg'),
(46, 37, '', 0, 'images/accommodations/family-room-b-5.jpg'),
(47, 37, '', 0, 'images/accommodations/family-room-b-6.jpg'),
(48, 33, '', 0, 'images/accommodations/single-room-cottage-1.jpg'),
(49, 33, '', 0, 'images/accommodations/single-room-1.jpg'),
(50, 33, '', 0, 'images/accommodations/single-room-2.jpg'),
(53, 86, '', 0, 'images/accommodations/Single-Room-1.jpg'),
(54, 86, '', 0, 'images/accommodations/Single-Room-2.jpg'),
(55, 87, '', 0, 'images/accommodations/Single-Room-1.jpg'),
(56, 87, '', 0, 'images/accommodations/Single-Room-2.jpg'),
(57, 88, '', 0, 'images/accommodations/Single-Room-1.jpg'),
(58, 88, '', 0, 'images/accommodations/Single-Room-2.jpg'),
(59, 89, '', 0, 'images/accommodations/Single-Room-1.jpg'),
(60, 89, '', 0, 'images/accommodations/Single-Room-2.jpg'),
(61, 90, '', 0, 'images/accommodations/Single-Room-1.jpg'),
(62, 90, '', 0, 'images/accommodations/Single-Room-2.jpg'),
(81, 95, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(82, 95, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(83, 95, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-E.jpg'),
(84, 96, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(85, 96, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(86, 96, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-F.jpg'),
(87, 91, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(88, 91, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(89, 91, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-A.jpg'),
(90, 92, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(91, 92, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(92, 92, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-B.jpg'),
(93, 93, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(94, 93, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(95, 93, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-C.jpg'),
(96, 94, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg'),
(97, 94, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg'),
(98, 94, '', 0, 'images/accommodations/Single-Room-Poolside/Single-Room-Poolside-D.jpg'),
(99, 97, '', 0, 'images/accommodations/Double-Room/Double-Room-1.jpg'),
(100, 97, '', 0, 'images/accommodations/Double-Room/Double-Room-2.jpg'),
(101, 97, '', 0, 'images/accommodations/Double-Room/Double-Room-3.jpg'),
(102, 97, '', 0, 'images/accommodations/Double-Room/Double-Room-4.jpg'),
(103, 98, '', 0, 'images/accommodations/Double-Room/Double-Room-1.jpg'),
(104, 98, '', 0, 'images/accommodations/Double-Room/Double-Room-2.jpg'),
(105, 98, '', 0, 'images/accommodations/Double-Room/Double-Room-3.jpg'),
(106, 98, '', 0, 'images/accommodations/Double-Room/Double-Room-4.jpg'),
(107, 99, '', 0, 'images/accommodations/Family-Room-A-1.jpg'),
(108, 99, '', 0, 'images/accommodations/Family-Room-A-2.jpg'),
(109, 99, '', 0, 'images/accommodations/Family-Room-A-3.jpg'),
(110, 99, '', 0, 'images/accommodations/Family-Room-A-4.jpg'),
(111, 99, '', 0, 'images/accommodations/Family-Room-A-5.jpg'),
(112, 99, '', 0, 'images/accommodations/Family-Room-A-6.jpg'),
(113, 100, '', 0, 'images/accommodations/Family-Room-B-1.jpg'),
(114, 100, '', 0, 'images/accommodations/Family-Room-B-2.jpg'),
(115, 100, '', 0, 'images/accommodations/Family-Room-B-3.jpg'),
(116, 100, '', 0, 'images/accommodations/Family-Room-B-4.jpg'),
(117, 100, '', 0, 'images/accommodations/Family-Room-B-5.jpg'),
(118, 100, '', 0, 'images/accommodations/Family-Room-B-6.jpg'),
(119, 100, '', 0, 'images/accommodations/Family-Room-B-7.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `home_address` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `account_status` enum('active','disabled') DEFAULT 'active',
  `reset_otp_hash` varchar(255) DEFAULT NULL,
  `reset_otp_expires` datetime DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `register_otp_hash` varchar(255) DEFAULT NULL,
  `register_otp_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `phone`, `address`, `phone_number`, `home_address`, `password`, `role`, `account_status`, `reset_otp_hash`, `reset_otp_expires`, `is_verified`, `register_otp_hash`, `register_otp_expires`) VALUES
(4, 'Admin', 'Admin@gmail.com', '09123456789', 'Cavite', '', '', '$2b$10$nBzCwx13MLeXFOQ8BwyNXex1v9lRGUaKTECWUFHqrF0FbWrvLs.3O', 'admin', 'active', NULL, NULL, 1, NULL, NULL),
(8, 'Customer', 'Customer@gmail.com', '09672995549', 'Sta. Cecilia 2 Julugan 8 Blk 1 Lot 23 Tanza, Cavite', NULL, NULL, '$2b$10$YxleGpIY62j7Xm6zT7VyTe1MLf82bPh51i6gewMTQgwvDSbqzIegu', 'customer', 'active', '$2b$10$2ddVuuTVVNFKckczqRuz5uoH1WKTIBj3RlcjpgYYRT3v1QCAvLMYC', '2026-05-29 16:05:28', 0, NULL, NULL),
(9, 'user1', 'user1@gmail.com', '09672995549', 'tanza', NULL, NULL, '$2b$10$48fnU77QHCzAbC.P08hQu.APwokTmSSCJiEohQLAlHtV7O8p72y6e', 'customer', 'active', NULL, NULL, 0, NULL, NULL),
(11, 'Eldrich F.Mojica', 'fmojicaeldrich@gmail.com', '09672995549', 'cavite tanza', NULL, NULL, '$2b$10$pK/uAKJ/NwTPuWtwk712iuWjkiENFKNaUWXcboyy5N5R7djMvKFiS', 'admin', 'active', '$2b$10$2g3HmEaBwBpUIKJkPBqeuu7AbbSwYk/xj9nLKjl2nfkcM/YKrosu.', '2026-05-29 21:58:34', 1, NULL, NULL),
(14, 'Eldrich F.Mojica', 'mojicaeldrichjenlord@gmail.com', '09672995549', 'cavite', NULL, NULL, '$2b$10$oRb5ZwJfr4Qg1xKIUIZX1OSuL0P9FDHaPYbiY1pdEG9KOEXiIZWaC', 'customer', 'active', '$2b$10$Pq312GdtZSCHzpmike3fEugv9nh4WB7jycBX4rit0mcqq6JNRPReW', '2026-05-29 17:55:40', 1, NULL, NULL),
(15, 'Icce Tan', 'icctan10@gmail.com', '09562317224', 'Imus Cavite', NULL, NULL, '$2b$10$3kqF2PP.ZifTJE1O2X1UeuF5hwapijwnzJA2nz.73qr5GHmuZJyoG', 'customer', 'active', NULL, NULL, 1, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_accommodations_category_id` (`category_id`);

--
-- Indexes for table `accommodation_categories`
--
ALTER TABLE `accommodation_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_accommodation_categories_name` (`name`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `booking_modification_requests`
--
ALTER TABLE `booking_modification_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `map_markers`
--
ALTER TABLE `map_markers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_map_marker_accommodation` (`accommodation_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_reservations_reservation_code` (`reservation_code`),
  ADD KEY `idx_reservations_user_id` (`user_id`),
  ADD KEY `idx_reservations_booking_source` (`booking_source`),
  ADD KEY `idx_reservations_payment_status` (`payment_status`),
  ADD KEY `idx_reservations_reservation_status` (`reservation_status`);

--
-- Indexes for table `reservation_items`
--
ALTER TABLE `reservation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reservation_items_reservation_id` (`reservation_id`),
  ADD KEY `idx_reservation_items_accommodation_id` (`accommodation_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_gallery`
--
ALTER TABLE `room_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `accommodation_categories`
--
ALTER TABLE `accommodation_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `booking_modification_requests`
--
ALTER TABLE `booking_modification_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `map_markers`
--
ALTER TABLE `map_markers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `reservation_items`
--
ALTER TABLE `reservation_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `room_gallery`
--
ALTER TABLE `room_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD CONSTRAINT `fk_accommodations_category` FOREIGN KEY (`category_id`) REFERENCES `accommodation_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `map_markers`
--
ALTER TABLE `map_markers`
  ADD CONSTRAINT `fk_map_marker_accommodation` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reservation_items`
--
ALTER TABLE `reservation_items`
  ADD CONSTRAINT `fk_reservation_items_accommodation` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reservation_items_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room_gallery`
--
ALTER TABLE `room_gallery`
  ADD CONSTRAINT `fk_room_gallery_accommodation` FOREIGN KEY (`room_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
