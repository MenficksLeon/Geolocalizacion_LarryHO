document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Obtener la zona de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const zonaFiltrar = urlParams.get('zona'); // Obtiene el parámetro 'zona'

    fetch('zonas.geojson')
        .then(response => response.json())
        .then(data => {
            let zonasLayer = L.geoJSON(data, {
                style: feature => ({
                    color: feature.properties.color || "#FF0000",
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.2
                }),
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`<strong>Zona:</strong> ${feature.properties.zona.trim()}`);

                    // Filtrar por zona
                    if (zonaFiltrar && feature.properties.zona.trim() === zonaFiltrar) {
                        map.fitBounds(layer.getBounds());
                        layer.openPopup();
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error cargando zonas:', error));
});
