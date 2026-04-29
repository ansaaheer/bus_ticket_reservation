<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Check permissions for administrative actions
$isAdmin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';

if ($action === 'list_all') {
    // Get all buses for the booking list or search
    $result = $conn->query("SELECT * FROM buses ORDER BY departure_time ASC");
    $buses = $result->fetch_all(MYSQLI_ASSOC);
    send_json_response(true, "Buses retrieved", ["buses" => $buses]);

} elseif ($action === 'search') {
    $source = sanitize_input($_GET['from']);
    $dest = sanitize_input($_GET['to']);
    
    $stmt = $conn->prepare("SELECT * FROM buses WHERE source LIKE ? AND destination LIKE ? AND available_seats > 0");
    $search_from = "%$source%";
    $search_to = "%$dest%";
    $stmt->bind_param("ss", $search_from, $search_to);
    $stmt->execute();
    $buses = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    send_json_response(true, "Search results", ["buses" => $buses]);

} elseif ($action === 'add' && $isAdmin) {
    $bus_num = sanitize_input($_POST['bus_number']);
    $bus_name = sanitize_input($_POST['bus_name']);
    $source = sanitize_input($_POST['source']);
    $dest = sanitize_input($_POST['destination']);
    $dept_time = $_POST['departure_time'];
    $seats = (int)$_POST['total_seats'];
    $fare = (float)$_POST['fare'];

    $stmt = $conn->prepare("INSERT INTO buses (bus_number, bus_name, source, destination, departure_time, total_seats, available_seats, fare) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssiid", $bus_num, $bus_name, $source, $dest, $dept_time, $seats, $seats, $fare);
    
    if ($stmt->execute()) {
        send_json_response(true, "Bus added successfully.");
    } else {
        send_json_response(false, "Failed to add bus. Number might be duplicate.");
    }

} elseif ($action === 'delete' && $isAdmin) {
    $id = (int)$_POST['id'];
    $stmt = $conn->prepare("DELETE FROM buses WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        send_json_response(true, "Bus deleted successfully.");
    } else {
        send_json_response(false, "Failed to delete bus.");
    }

} elseif ($action === 'get_single') {
    $id = (int)$_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM buses WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $bus = $stmt->get_result()->fetch_assoc();
    
    if ($bus) {
        send_json_response(true, "Bus found", ["bus" => $bus]);
    } else {
        send_json_response(false, "Bus not found");
    }
}
?>