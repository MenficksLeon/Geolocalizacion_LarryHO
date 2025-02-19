document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([-9.19, -75.0152], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa creado por Larry Humpiri LK | © OpenStreetMap contributors'
    }).addTo(map);

    let geojsonLayer;
    let zonasData;

    const zonasExcluidas = new Set([
        "PEDREGAL", "CAMANA", "MOLLENDO",
        "JOSE LUIS BUSTAMANTE Y RIVERO",
        "CERRO COLORADO", "PAUCARPATA"
    ]);

    // Cargar GeoJSON
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

                // Si es un mercado, no mostrar popup
                if (props.tipo === "mercado") {
                    return;
                }

                // Si es un grupo y está en una de las zonas excluidas, no agregarlo
                if (props.tipo === "grupo" && zonasExcluidas.has(props.zona)) {
                    return;
                }

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

        // Eventos de cambio en los filtros
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
                let props = feature.properties;

                let pertenece =
                    (territorioSeleccionado === "" || props.territorio === territorioSeleccionado) &&
                    (agenciaSeleccionada === "" || props.agencia === agenciaSeleccionada) &&
                    (zonaSeleccionada === "" || props.zona === zonaSeleccionada);

                // Excluir grupos de las zonas no permitidas
                if (props.tipo === "grupo" && zonasExcluidas.has(props.zona)) {
                    return false;
                }

                if (pertenece) {
                    territorios.add(props.territorio);
                    agencias.add(props.agencia);
                    zonas.add(props.zona);
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
});

