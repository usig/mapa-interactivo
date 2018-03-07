import L from 'leaflet';

function layerStyle(feature, style) {
    var defaultStyle = {
            radius: 10,
            fillColor: "#DD0083",
            color: "#DD0083",
            weight: 4,
            opacity: 1,
            fillOpacity: .5
        };
    return Object.assign({}, defaultStyle, style);
}

function getLayer(geoJson, coordinateConversion, style) {
    var layer = L.geoJson(geoJson, {
        style: (feature) => layerStyle(feature, style),
        coordsToLatLng: coordinateConversion
    });			
    return layer;
}

export default getLayer;