
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('personalTableBody');
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
            const response = await fetch(`/trenler/search?term=${encodeURIComponent(searchTerm)}`, {
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
        tableBody.innerHTML = data.map(tren => `
            <tr>
                <td>${tren.TrenID}</td>
                <td>${tren.Model}</td>
                <td>${tren.Marka}</td>
                <td>${tren.Kapasite}</td>
                <td class="action-buttons">
                    <a href="/Trenler/edit/${tren.TrenID}" class="btn btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <form action="/Trenler/delete/${tren.TrenID}" method="POST" class="d-inline">
                        <button type="submit" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this train?')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </form>
                </td>
            </tr>
        `).join('');
    }
});
