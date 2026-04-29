<?php
require_once 'config.php';

// Determine the action (login, register, or logout)
$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $fullname = sanitize_input($_POST['fullname']);
    $email = sanitize_input($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $role = 'user'; // Default role for web registration

    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        send_json_response(false, "Email already registered.");
    }

    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $fullname, $email, $password, $role);
    
    if ($stmt->execute()) {
        send_json_response(true, "Registration successful! Please login.");
    } else {
        send_json_response(false, "Registration failed.");
    }

} elseif ($action === 'login') {
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, fullname, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $user['fullname'];
            $_SESSION['user_role'] = $user['role'];

            send_json_response(true, "Login successful", ["role" => $user['role']]);
        } else {
            send_json_response(false, "Invalid password.");
        }
    } else {
        send_json_response(false, "User not found.");
    }

} elseif ($action === 'logout') {
    session_unset();
    session_destroy();
    header("Location: ../index.html");
    exit();

} elseif ($action === 'check') {
    // Check if user is logged in for JS-side UI updates
    if (isset($_SESSION['user_id'])) {
        send_json_response(true, "Authenticated", [
            "name" => $_SESSION['user_name'],
            "email" => $_SESSION['user_email'],
            "role" => $_SESSION['user_role']
        ]);
    } else {
        send_json_response(false, "Not authenticated");
    }
}
?>