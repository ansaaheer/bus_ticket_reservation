<?php
require_once 'config.php';

$action = $_GET['action'] ?? '';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    send_json_response(false, "Unauthorized access.");
}

$user_id = $_SESSION['user_id'];

if ($action === 'create_booking') {
    $bus_id = (int)$_POST['bus_id'];
    $seats_requested = (int)$_POST['seats'];

    // Start Transaction to ensure data integrity
    $conn->begin_transaction();

    try {
        // 1. Check seat availability and get fare
        $stmt = $conn->prepare("SELECT available_seats, fare FROM buses WHERE id = ? FOR UPDATE");
        $stmt->bind_param("i", $bus_id);
        $stmt->execute();
        $bus = $stmt->get_result()->fetch_assoc();

        if (!$bus || $bus['available_seats'] < $seats_requested) {
            throw new Exception("Not enough seats available.");
        }

        $total_price = $bus['fare'] * $seats_requested;

        // 2. Deduct seats from Buses table
        $update_stmt = $conn->prepare("UPDATE buses SET available_seats = available_seats - ? WHERE id = ?");
        $update_stmt->bind_param("ii", $seats_requested, $bus_id);
        $update_stmt->execute();

        // 3. Create record in Bookings table
        $book_stmt = $conn->prepare("INSERT INTO bookings (user_id, bus_id, seats_reserved, total_price) VALUES (?, ?, ?, ?)");
        $book_stmt->bind_param("iiid", $user_id, $bus_id, $seats_requested, $total_price);
        $book_stmt->execute();

        // Commit transaction
        $conn->commit();
        send_json_response(true, "Ticket booked successfully!");

    } catch (Exception $e) {
        // Rollback changes if anything fails
        $conn->rollback();
        send_json_response(false, $e->getMessage());
    }

} elseif ($action === 'get_user_bookings') {
    // Join with buses table to get route details for the user
    $query = "SELECT b.id, b.seats_reserved, b.total_price, b.booking_date, 
                     bus.bus_name, bus.source, bus.destination, bus.departure_time 
              FROM bookings b 
              JOIN buses bus ON b.bus_id = bus.id 
              WHERE b.user_id = ? 
              ORDER BY b.booking_date DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $bookings = $result->fetch_all(MYSQLI_ASSOC);

    send_json_response(true, "Bookings retrieved", ["bookings" => $bookings]);
}
?>