import L from 'leaflet';

const config = {
    symbol_server: "https://static.usig.buenosaires.gob.ar/symbols/"
}

function layerStyle(feature) {
    var estilo = {
        radius: 10,
        fillColor: "#fff",
        color: "#DD0083",
        weight: 4,
        opacity: 1,
        fillOpacity: 1
    };
    return estilo;
}

function getLayer(geoJson, coordinateConversion, style, icon) {
    return L.geoJson(geoJson, {
        style: layerStyle,
        coordsToLatLng: coordinateConversion,
        pointToLayer: function (feature, latlng) {
            var content = '', i = 100,
                icon = {
                    iconUrl: config.symbol_server + '/b/corte_de_transito.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    shadowUrl: 'https://mapa.buenosaires.gob.ar/imgs/fondos/1.png',
                    shadowSize: [24, 24],
                    shadowAnchor: [12, 12]
                };
            switch (feature.properties.Tipo) {
                case 'Corte por Obra':
                    icon.iconUrl = config.symbol_server + "/b/obras.png";
                    break;
                case 'Manifestación':
                    icon.iconUrl = config.symbol_server + "/b/manifestacion.png";
                    break;
                case 'Evento Cultural':
                    icon.iconUrl = config.symbol_server + "/b/evento_cultural.png";
                    break;
                case 'Cordón policial':
                    icon.iconUrl = config.symbol_server + "/b/cordon_policial.png";
                    break;
                case 'Filmación':
                    icon.iconUrl = config.symbol_server + "/b/filmacion.png";
                    break;
                case 'Choque':
                    icon.iconUrl = config.symbol_server + "/b/choque.png";
                    break;
                case 'Semáforo Roto':
                    icon.iconUrl = config.symbol_server + "/b/semaforo_roto.png";
                    break;
                case 'Evento Deportivo':
                    icon.iconUrl = config.symbol_server + "/b/evento_deportivo.png";
                    break;
                case 'Incendio':
                    icon.iconUrl = config.symbol_server + "/b/incendio.png";
                    break;
                case 'Corte':
                    icon.iconUrl = config.symbol_server + "/b/otros_cortes.png";
                    break;
            }
            // 					var myIcon = L.divIcon({className: 'marker-recorrido circlePill-mapa marker generic-marker ', html: content, iconSize: L.Point(36, 36)});
            return L.marker(latlng, { icon: L.icon(icon), zIndexOffset: i });
            // .bindPopup(feature.properties.Nombre).openPopup();
            // return L.circleMarker(latlng, {});
        }
    });
}

export default getLayer;
