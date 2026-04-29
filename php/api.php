<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Security: Only allow Admin to access these stats
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    send_json_response(false, "Access denied.");
}

if ($action === 'admin_stats') {
    try {
        // 1. Get Total Buses
        $resBuses = $conn->query("SELECT COUNT(*) as total FROM buses");
        $totalBuses = $resBuses->fetch_assoc()['total'];

        // 2. Get Total Bookings
        $resBookings = $conn->query("SELECT COUNT(*) as total FROM bookings");
        $totalBookings = $resBookings->fetch_assoc()['total'];

        // 3. Get Total Revenue
        $resRevenue = $conn->query("SELECT SUM(total_price) as total FROM bookings");
        $totalRevenue = $resRevenue->fetch_assoc()['total'] ?? 0;

        send_json_response(true, "Stats retrieved", [
            "total_buses" => $totalBuses,
            "total_bookings" => $totalBookings,
            "total_revenue" => number_format($totalRevenue, 2)
        ]);

    } catch (Exception $e) {
        send_json_response(false, "Error calculating stats.");
    }
} else {
    send_json_response(false, "Invalid API action.");
}
?>