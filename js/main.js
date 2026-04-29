/**
 * Main JS - User Side Functionality
 * Handles loading bookings and general UI interactions for the customer.
 */

// Function to load the current user's bookings from the database
async function loadUserBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    try {
        const response = await fetch('php/bookings.php?action=get_user_bookings');
        const data = await response.json();

        if (data.success) {
            if (data.bookings.length === 0) {
                bookingsList.innerHTML = '<tr><td colspan="7" style="text-align:center;">No bookings found. <a href="booking.html">Book your first ticket!</a></td></tr>';
                return;
            }

            let html = '';
            data.bookings.forEach(booking => {
                html += `
                    <tr>
                        <td>#${booking.id}</td>
                        <td>${booking.bus_name}</td>
                        <td>${booking.source} to ${booking.destination}</td>
                        <td>${formatDate(booking.departure_time)}</td>
                        <td>${booking.seats_reserved}</td>
                        <td>$${booking.total_price}</td>
                        <td><span class="status-badge success">Confirmed</span></td>
                    </tr>
                `;
            });
            bookingsList.innerHTML = html;
        } else {
            bookingsList.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<tr><td colspan="7" style="text-align:center;">Error connecting to server.</td></tr>';
    }
}

/**
 * Utility function to format database date strings into a readable format
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Global search function (if used in index or booking pages)
 */
async function searchBuses(from, to) {
    try {
        const response = await fetch(`php/buses.php?action=search&from=${from}&to=${to}`);
        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return { success: false, message: "Failed to fetch bus data." };
    }
}