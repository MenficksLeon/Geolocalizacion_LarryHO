document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa creado por Larry Humpiri LK | © OpenStreetMap contributors'
    }).addTo(map);

    const zonasProhibidas = ["PEDREGAL", "CAMANA", "MOLLENDO", "JOSE LUIS BUSTAMANTE Y RIVERO", "CERRO COLORADO", "PAUCARPATA"];
    
    let zonasLayer, canalesLayer, gruposLayer, mercadosLayer;
    let zonaBounds = null;

    const territorioSelect = document.getElementById("territorioSelect");
    const zonaSelect = document.getElementById("zonaSelect");
    const agenciaSelect = document.getElementById("agenciaSelect");

    // Cargar Zonas
    fetch('zonas.geojson')
        .then(response => response.json())
        .then(data => {
            zonasLayer = L.geoJSON(data, {
                style: feature => ({
                    color: feature.properties.color || "#FF0000",
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.2
                }),
                onEachFeature: (feature, layer) => {
                    let zona = feature.properties.ZONA.trim();
                    if (!zonasProhibidas.includes(zona)) {
                        layer.bindPopup(`<strong>Zona:</strong> ${zona}`);

                        if (zonaSelect.querySelector(`option[value="${zona}"]`) === null) {
                            let option = document.createElement('option');
                            option.value = zona;
                            option.textContent = zona;
                            zonaSelect.appendChild(option);
                        }
                    } else {
                        map.removeLayer(layer);
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error cargando zonas:', error));

    // Cargar Canales
    function cargarCanales() {
        fetch('canales.json')
            .then(response => response.json())
            .then(data => {
                limpiarCapas(canalesLayer);
                canalesLayer = L.layerGroup();

                data.features.forEach(feature => {
                    let zona = feature.properties.ZONA.trim();
                    if (!zonasProhibidas.includes(zona)) {
                        const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                        const icon = L.icon({
                            iconUrl: feature.properties.IMAGEN,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                            popupAnchor: [0, -30]
                        });

                        let marker = L.marker(latlng, { icon: icon }).bindPopup(`
                            <strong>${feature.properties.NOMBRE}</strong><br>
                            <em>${feature.properties.TIPO_DE_CANAL}</em><br>
                            Ciudad: ${feature.properties.CIUDAD}<br>
                            Dirección: ${feature.properties.DIRECCION}<br>
                            Horario: ${feature.properties.HORARIO}
                        `);
                        canalesLayer.addLayer(marker);
                    }
                });

                map.addLayer(canalesLayer);
            })
            .catch(error => console.error('Error cargando canales:', error));
    }

    // Cargar Grupos (sin popup)
    function cargarGrupos() {
        fetch('grupos.json')
            .then(response => response.json())
            .then(data => {
                limpiarCapas(gruposLayer);
                gruposLayer = L.layerGroup();

                data.features.forEach(feature => {
                    const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                    let marker = L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "#007BFF",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.9
                    });
                    gruposLayer.addLayer(marker);
                });

                map.addLayer(gruposLayer);
            })
            .catch(error => console.error('Error cargando grupos:', error));
    }

    // Cargar Mercados
    function cargarMercados() {
        fetch('mercados.json')
            .then(response => response.json())
            .then(data => {
                limpiarCapas(mercadosLayer);
                mercadosLayer = L.layerGroup();

                data.features.forEach(feature => {
                    const latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                    const icon = L.icon({
                        iconUrl: feature.properties.IMAGEN,
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                        popupAnchor: [0, -30]
                    });

                    let marker = L.marker(latlng, { icon: icon }).bindPopup(`
                        <strong>Mercado:</strong> ${feature.properties.NOMBRE}<br>
                        Dirección: ${feature.properties.DIRECCION}<br>
                        Referencia: ${feature.properties.REFERENCIA}
                    `);
                    mercadosLayer.addLayer(marker);
                });

                map.addLayer(mercadosLayer);
            })
            .catch(error => console.error('Error cargando mercados:', error));
    }

    // Función para limpiar capas previas
    function limpiarCapas(layer) {
        if (layer) {
            map.removeLayer(layer);
        }
    }

    // Filtrar al cambiar la zona
    zonaSelect.addEventListener('change', function () {
        let selectedZona = this.value;
        console.log("Zona seleccionada:", selectedZona);
        cargarCanales();
        cargarGrupos();
        cargarMercados();
    });

    // Cargar todos los datos al inicio
    cargarCanales();
    cargarGrupos();
    cargarMercados();
});
