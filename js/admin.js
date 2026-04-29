/**
 * Admin Panel Logic
 * Manages bus CRUD operations and admin statistics.
 */

// 1. Load all buses for the admin table
async function loadAdminBuses() {
    const adminBusList = document.getElementById('adminBusList');
    if (!adminBusList) return;

    try {
        const response = await fetch('../php/buses.php?action=list_all');
        const data = await response.json();

        if (data.success) {
            if (data.buses.length === 0) {
                adminBusList.innerHTML = '<tr><td colspan="7" style="text-align:center;">No buses found. Add your first bus route!</td></tr>';
                return;
            }

            let html = '';
            data.buses.forEach(bus => {
                html += `
                    <tr>
                        <td><strong>${bus.bus_number}</strong></td>
                        <td>${bus.bus_name}</td>
                        <td>${bus.source} &rarr; ${bus.destination}</td>
                        <td>${new Date(bus.departure_time).toLocaleString()}</td>
                        <td>${bus.available_seats} / ${bus.total_seats}</td>
                        <td>$${bus.fare}</td>
                        <td>
                            <button onclick="deleteBus(${bus.id})" class="btn-logout" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                        </td>
                    </tr>
                `;
            });
            adminBusList.innerHTML = html;
        }
    } catch (error) {
        console.error('Error fetching buses:', error);
    }
}

// 2. Handle Adding New Bus
const addBusForm = document.getElementById('addBusForm');
if (addBusForm) {
    addBusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addBusForm);

        try {
            const response = await fetch('../php/buses.php?action=add', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                addBusForm.reset();
                toggleBusForm(); // Function defined in manage_buses.html
                loadAdminBuses(); // Refresh table
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error adding bus:', error);
            alert('An error occurred while adding the bus.');
        }
    });
}

// 3. Handle Deleting a Bus
async function deleteBus(id) {
    if (!confirm('Are you sure you want to delete this bus route? All associated bookings will be removed.')) return;

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('../php/buses.php?action=delete', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            loadAdminBuses();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error deleting bus:', error);
    }
}

/**
 * Admin Dashboard Stats (for admin/dashboard.html)
 */
async function loadAdminStats() {
    try {
        const response = await fetch('../php/api.php?action=admin_stats');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalBuses').innerText = data.total_buses;
            document.getElementById('totalBookings').innerText = data.total_bookings;
            document.getElementById('totalRevenue').innerText = `$${data.total_revenue}`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}