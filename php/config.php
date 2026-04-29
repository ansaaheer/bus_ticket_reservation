<?php
/**
 * Database Configuration and Connection
 * This file is included in all PHP scripts to provide DB access and Session management.
 */

// 1. Session Initialization
// Starting the session at the very beginning to handle user authentication across pages.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. Database Credentials
$db_host = 'localhost';
$db_user = 'root';     // Default XAMPP user
$db_pass = '';         // Default XAMPP password is empty
$db_name = 'bus_booking_system';

// 3. Establish Connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// 4. Check Connection
if ($conn->connect_error) {
    // In a production environment, you would log this and show a friendly message.
    die("Connection failed: " . $conn->connect_error);
}

// 5. Global Settings
// Set charset to utf8mb4 for full Unicode support (emojis, special characters)
$conn->set_charset("utf8mb4");

/**
 * Helper function to sanitize user inputs for basic XSS protection
 * and ensure clean data handling throughout the app.
 */
function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

/**
 * Helper function to send JSON responses back to JavaScript fetch requests.
 */
function send_json_response($success, $message, $extra_data = []) {
    header('Content-Type: application/json');
    $response = array_merge(['success' => $success, 'message' => $message], $extra_data);
    echo json_encode($response);
    exit();
}
?>