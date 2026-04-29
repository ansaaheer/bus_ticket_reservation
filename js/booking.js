/**
 * Booking Page Logic
 * Handles searching buses and creating reservations.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    
    // Initial load: show all buses
    fetchBuses();

    // Handle Search
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const from = document.getElementById('searchFrom').value;
            const to = document.getElementById('searchTo').value;
            fetchBuses(from, to);
        });
    }
});

// Fetch buses from server (optionally filtered by source/destination)
async function fetchBuses(from = '', to = '') {
    const listBody = document.getElementById('availableBusesList');
    let url = 'php/buses.php?action=list_all';
    
    if (from || to) {
        url = `php/buses.php?action=search&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            renderBusTable(data.buses);
        } else {
            listBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        listBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Connection error.</td></tr>`;
    }
}

// Render the fetched bus data into the table
function renderBusTable(buses) {
    const listBody = document.getElementById('availableBusesList');
    
    if (buses.length === 0) {
        listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No buses available for this route.</td></tr>';
        return;
    }

    let html = '';
    buses.forEach(bus => {
        html += `
            <tr>
                <td><strong>${bus.bus_name}</strong><br><small>${bus.bus_number}</small></td>
                <td>${bus.source} &rarr; ${bus.destination}</td>
                <td>${new Date(bus.departure_time).toLocaleString()}</td>
                <td>${bus.available_seats} / ${bus.total_seats}</td>
                <td>$${bus.fare}</td>
                <td>
                    <button onclick="bookTicket(${bus.id}, ${bus.available_seats})" class="btn-primary" style="padding: 5px 10px; width: auto;">Book Now</button>
                </td>
            </tr>
        `;
    });
    listBody.innerHTML = html;
}

// Function to handle the actual booking process
async function bookTicket(busId, maxSeats) {
    const seatCount = prompt(`How many seats would you like to book? (Max: ${maxSeats})`, "1");
    
    if (seatCount === null) return; // User cancelled

    const seats = parseInt(seatCount);
    if (isNaN(seats) || seats <= 0 || seats > maxSeats) {
        alert("Please enter a valid number of seats.");
        return;
    }

    const formData = new FormData();
    formData.append('bus_id', busId);
    formData.append('seats', seats);

    try {
        const response = await fetch('php/bookings.php?action=create_booking', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert("Success! Your ticket is booked.");
            window.location.href = 'dashboard.html';
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert("Failed to process booking.");
    }
}