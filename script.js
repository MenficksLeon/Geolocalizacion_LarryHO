document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Obtener la zona desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const zonaFiltrar = urlParams.get('zona'); // Obtiene la zona seleccionada

    let zonaBounds = null; // Para almacenar los límites de la zona

    // Cargar Zonas
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

                    // Si la zona de la URL coincide, centrar el mapa
                    if (zonaFiltrar && feature.properties.zona.trim() === zonaFiltrar) {
                        map.fitBounds(layer.getBounds());
                        layer.openPopup();
                        zonaBounds = layer.getBounds(); // Guardamos los límites de la zona
                    }
                }
            }).addTo(map);

            // Una vez que tenemos la zona, cargamos los demás elementos dentro de la zona
            cargarCanales(zonaBounds);
            cargarGrupos(zonaBounds);
            cargarMercados(zonaBounds);
        })
        .catch(error => console.error('Error cargando zonas:', error));

    // Función para cargar Canales dentro de la zona seleccionada
    function cargarCanales(bounds) {
        fetch('canales.json')
            .then(response => response.json())
            .then(data => {
                data.features.forEach(feature => {
                    const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

                    // Solo agregar si está dentro de la zona
                    if (!bounds || bounds.contains(latlng)) {
                        const icon = L.icon({
                            iconUrl: feature.properties.IMAGEN,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                            popupAnchor: [0, -30]
                        });

                        L.marker(latlng, { icon: icon })
                            .bindPopup(`
                                <strong>${feature.properties.NOMBRE}</strong><br>
                                <em>${feature.properties.TIPO_DE_CANAL}</em><br>
                                Ciudad: ${feature.properties.CIUDAD}<br>
                                Dirección: ${feature.properties.DIRECCION}<br>
                                Horario: ${feature.properties.HORARIO}
                            `)
                            .addTo(map);
                    }
                });
            })
            .catch(error => console.error('Error cargando canales:', error));
    }

    // Función para cargar Grupos dentro de la zona seleccionada
    function cargarGrupos(bounds) {
        fetch('grupos.json')
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    pointToLayer: function (feature, latlng) {
                        // Solo agregar si está dentro de la zona
                        if (!bounds || bounds.contains(latlng)) {
                            return L.circleMarker(latlng, {
                                radius: 6,
                                fillColor: "#007BFF",
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.9
                            });
                        }
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(`
                            <strong>Grupo:</strong> ${feature.properties.NombreGrupo}<br>
                            <strong>Código:</strong> ${feature.properties.CodigoGrupo}
                        `);
                    }
                }).addTo(map);
            })
            .catch(error => console.error('Error cargando grupos:', error));
    }

    // Función para cargar Mercados dentro de la zona seleccionada
    function cargarMercados(bounds) {
        fetch('mercados.json')
            .then(response => response.json())
            .then(data => {
                data.features.forEach(feature => {
                    const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

                    // Solo agregar si está dentro de la zona
                    if (!bounds || bounds.contains(latlng)) {
                        const icon = L.icon({
                            iconUrl: feature.properties.IMAGEN,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                            popupAnchor: [0, -30]
                        });

                        L.marker(latlng, { icon: icon })
                            .bindPopup(`
                                <strong>Mercado:</strong> ${feature.properties.NOMBRE}<br>
                                Dirección: ${feature.properties.DIRECCION}<br>
                                Referencia: ${feature.properties.REFERENCIA}
                            `)
                            .addTo(map);
                    }
                });
            })
            .catch(error => console.error('Error cargando mercados:', error));
    }
});
