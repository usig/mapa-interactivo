import L from 'leaflet';

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
                iconUrl: 'https://mapa.buenosaires.gob.ar/symbols/b/estacion_de_servicio.png',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                shadowUrl: 'https://mapa.buenosaires.gob.ar/imgs/fondos/2.png',
                shadowSize: [24, 24],
                shadowAnchor: [12, 12]								
            };
            switch(feature.properties.Nombre) {
                case 'YPF':
                    icon.shadowUrl = 'https://mapa.buenosaires.gob.ar/imgs/fondos/1.png';
                    break;
                case 'SHELL':
                    icon.iconUrl = "https://mapa.buenosaires.gob.ar/symbols/n/estacion_de_servicio.png";
                    icon.shadowUrl = 'https://mapa.buenosaires.gob.ar/imgs/fondos/9.png';
                    break;
                case 'ESSO':
                    icon.shadowUrl = 'https://mapa.buenosaires.gob.ar/imgs/fondos/7.png';
                    break;
                case 'PETROBRAS':
                    icon.shadowUrl = 'https://mapa.buenosaires.gob.ar/imgs/fondos/3.png';
                    break;
            }
            return L.marker(latlng, {icon: L.icon(icon), zIndexOffset: i});

        }
    });
}

export default getLayer;
