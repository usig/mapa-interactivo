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
                iconUrl: 'http://mapa.buenosaires.gob.ar/symbols/b/estacion_de_bicicletas.png',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                shadowUrl: 'http://mapa.buenosaires.gob.ar/imgs/fondos/9.png',
                shadowSize: [24, 24],
                shadowAnchor: [12, 12]								
            };
            switch(feature.properties.Estado) {
                case 'inhabilitada':
                case 'mantenimiento':
                case 'cerrada':
                    icon.shadowUrl = 'http://mapa.buenosaires.gob.ar/imgs/fondos/15.png';
                    break;
                case 'llena':
                    icon.shadowUrl = 'http://mapa.buenosaires.gob.ar/imgs/fondos/9.png';
                    break;
                case 'vacia':
                    icon.iconUrl = 'http://mapa.buenosaires.gob.ar/symbols/n/estacion_de_bicicletas.png'
                    icon.shadowUrl = 'http://mapa.buenosaires.gob.ar/imgs/fondos/12.png';
                    break;
                case 'disponible':
                    if (feature.properties.CantidadBicicletas > 3) {
                        icon.shadowUrl = 'http://mapa.buenosaires.gob.ar/imgs/fondos/3.png';                        
                    } else {
                        icon.iconUrl = 'http://mapa.buenosaires.gob.ar/symbols/n/estacion_de_bicicletas.png'                        
                        icon.shadowUrl = 'http://mapa.buenosaires.gob.ar/imgs/fondos/9.png';                        
                    }
                    break;
            }
            return L.marker(latlng, {icon: L.icon(icon), zIndexOffset: i});

        }
    });
}

export default getLayer;