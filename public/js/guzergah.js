document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('routeTableBody');
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
            const response = await fetch(`/guzergah/search?term=${encodeURIComponent(searchTerm)}`, {
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
        tableBody.innerHTML = data.map(route => `
            <tr>
                <td>${route.GuzergahID}</td>
                <td>${route.Sure}</td>
                <td>${route.Baslangic_istasyon}</td>
                <td>${route.Bitis_istasyon}</td>
                <td>${route.Mesafe}</td>
                <td class="action-buttons">
                    <a href="/guzergah/edit/${route.GuzergahID}" class="btn btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <form action="/guzergah/delete/${route.GuzergahID}" method="POST" class="d-inline">
                        <button type="submit" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this route?')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </form>
                </td>
            </tr>
        `).join('');
    }
});
