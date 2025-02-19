document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa creado por Larry Humpiri LK | © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonLayer;
    let zonasData;
    let mercadosLayer = null;
    let mercadosData = null;
    let gruposLayer = null;
    let gruposData = null;

    // Icono personalizado para Mercados
    const mercadoIcon = L.icon({
        iconUrl: 'https://github.com/MenficksLeon/LarryHO/blob/main/Mercados.png?raw=true',
        iconSize: [25, 25]
    });

    // Cargar GeoJSON de zonas
    fetch('zonas.geojson')
        .then(response => response.json())
        .then(data => {
            zonasData = data;
            cargarFiltros(zonasData);
            mostrarZonas(zonasData);
        })
        .catch(error => console.error('Error cargando zonas:', error));

    function mostrarZonas(data) {
        if (geojsonLayer) {
            map.removeLayer(geojsonLayer);
        }

        geojsonLayer = L.geoJSON(data, {
            style: feature => ({
                color: feature.properties.color || "#FF0000",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.2
            }),
            onEachFeature: (feature, layer) => {
                let props = feature.properties;
                layer.bindPopup(`<strong>${props.zona}</strong><br>Agencia: ${props.agencia}<br>Territorio: ${props.territorio}`);
            }
        }).addTo(map);

        if (data.features.length > 0) {
            let bounds = geojsonLayer.getBounds();
            map.fitBounds(bounds);
        }
    }

    function cargarFiltros(data) {
        let territorios = new Set();
        let agencias = new Set();
        let zonas = new Set();

        data.features.forEach(feature => {
            territorios.add(feature.properties.territorio);
            agencias.add(feature.properties.agencia);
            zonas.add(feature.properties.zona);
        });

        llenarSelect("territorio", territorios);
        llenarSelect("agencia", agencias);
        llenarSelect("zona", zonas);

        document.getElementById("territorio").addEventListener("change", actualizarFiltros);
        document.getElementById("agencia").addEventListener("change", actualizarFiltros);
        document.getElementById("zona").addEventListener("change", actualizarFiltros);
    }

    function actualizarFiltros() {
        let territorioSeleccionado = document.getElementById("territorio").value;
        let agenciaSeleccionada = document.getElementById("agencia").value;
        let zonaSeleccionada = document.getElementById("zona").value;

        let territorios = new Set();
        let agencias = new Set();
        let zonas = new Set();

        let datosFiltrados = {
            type: "FeatureCollection",
            features: zonasData.features.filter(feature => {
                let pertenece = 
                    (territorioSeleccionado === "" || feature.properties.territorio === territorioSeleccionado) &&
                    (agenciaSeleccionada === "" || feature.properties.agencia === agenciaSeleccionada) &&
                    (zonaSeleccionada === "" || feature.properties.zona === zonaSeleccionada);

                if (pertenece) {
                    territorios.add(feature.properties.territorio);
                    agencias.add(feature.properties.agencia);
                    zonas.add(feature.properties.zona);
                }

                return pertenece;
            })
        };

        llenarSelect("territorio", territorios, territorioSeleccionado);
        llenarSelect("agencia", agencias, agenciaSeleccionada);
        llenarSelect("zona", zonas, zonaSeleccionada);

        mostrarZonas(datosFiltrados);
    }

    function llenarSelect(id, valores, seleccionado = "") {
        let select = document.getElementById(id);
        select.innerHTML = '<option value="">Todos</option>'; 
        valores.forEach(valor => {
            let option = document.createElement("option");
            option.value = valor;
            option.textContent = valor;
            if (valor === seleccionado) option.selected = true;
            select.appendChild(option);
        });
    }

    // Carga diferida de Mercados y Grupos (Lazy Load)
    map.on('zoomend', function () {
        if (map.getZoom() >= 10) {
            if (!mercadosData) {
                fetch('mercados.json')
                    .then(response => response.json())
                    .then(data => {
                        mercadosData = data;
                        mostrarMercados(mercadosData);
                    })
                    .catch(error => console.error('Error cargando mercados:', error));
            }

            if (!gruposData) {
                fetch('grupos.json')
                    .then(response => response.json())
                    .then(data => {
                        gruposData = data;
                        mostrarGrupos(gruposData);
                    })
                    .catch(error => console.error('Error cargando grupos:', error));
            }
        }
    });

    function mostrarMercados(data) {
        if (mercadosLayer) {
            map.removeLayer(mercadosLayer);
        }

        mercadosLayer = L.layerGroup();

        data.features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            let marker = L.marker([coords[1], coords[0]], { icon: mercadoIcon })
                .bindPopup(`<strong>Mercado:</strong> ${feature.properties.nombre}`);
            mercadosLayer.addLayer(marker);
        });

        map.addLayer(mercadosLayer);
    }

    function mostrarGrupos(data) {
        if (gruposLayer) {
            map.removeLayer(gruposLayer);
        }

        gruposLayer = L.layerGroup();

        data.features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            let marker = L.circleMarker([coords[1], coords[0]], {
                radius: 5,
                color: "#007bff",
                fillColor: "#007bff",
                fillOpacity: 0.7
            }).bindPopup(`<strong>Grupo:</strong> ${feature.properties.nombre}`);
            gruposLayer.addLayer(marker);
        });

        map.addLayer(gruposLayer);
    }
});
ddLayer(gruposLayer);
    }
});
