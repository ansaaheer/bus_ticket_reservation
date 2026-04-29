/**
 * Authentication Handler
 * Manages Login, Registration, and Session checks.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 1. Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);

            try {
                const response = await fetch('php/auth.php?action=register', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                alert(result.message);
                if (result.success) {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Registration Error:', error);
                alert('An error occurred during registration.');
            }
        });
    }

    // 2. Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);

            try {
                const response = await fetch('php/auth.php?action=login', {
                    method: 'POST',
                    body: formData
                });
                
                // Response text check karein agar JSON parse fail ho jaye
                const result = await response.json();

                if (result.success) {
                    // Debugging ke liye alert (Aap ise baad mein remove kar sakte hain)
                    console.log("Login Success. Role:", result.role);

                    if (result.role === 'admin') {
                        // Agar file folder ke andar hai
                        window.location.replace('admin/dashboard.html'); 
                    } else {
                        window.location.replace('dashboard.html');
                    }
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Login Error:', error);
                alert('Invalid response from server. Check console.');
            }
        });
    }
});

/**
 * Utility function to check authentication status
 * Iska path handle karna zaroori hai agar file admin folder mein ho
 */
async function checkAuth() {
    // Agar hum admin folder ke andar hain, toh path change hoga
    const path = window.location.pathname.includes('/admin/') ? '../php/auth.php' : 'php/auth.php';
    
    try {
        const response = await fetch(`${path}?action=check`);
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false };
    }
}

/**
 * Handle Logout
 */
function logout() {
    const path = window.location.pathname.includes('/admin/') ? '../php/auth.php' : 'php/auth.php';
    window.location.href = `${path}?action=logout`;
}