document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('ticketTableBody');
    let timeoutId;

    searchInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const searchTerm = this.value.trim();
            fetchResults(searchTerm);
        }, 300);
    });

    async function fetchResults(searchTerm) {
        try {
            const response = await fetch(`/bilet/search?term=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            updateTable(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateTable(data) {
        tableBody.innerHTML = data.map(ticket => `
            <tr>
                <td>${ticket.BiletID}</td>
                <td>${ticket.Yolcu_adi}</td>
                <td>${ticket.Kalkis_istasyon}</td>
                <td>${ticket.Varis_istasyon}</td>
                <td>${ticket.Ucret}</td>
                <td>${new Date(ticket.Tarih).toLocaleDateString()}</td>
                <td class="action-buttons">
                    <a href="/bilet/edit/${ticket.BiletID}" class="btn btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <form action="/bilet/delete/${ticket.BiletID}" method="POST" class="d-inline">
                        <button type="submit" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this ticket?')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </form>
                </td>
            </tr>
        `).join('');
    }
});