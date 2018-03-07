import L from 'leaflet';

function getLayer(geoJson, coordinateConversion, style, icon) {
    var icono = L.icon(icon);
    return L.geoJson(geoJson, {
        coordsToLatLng: coordinateConversion,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: icono});
        }
    });
}

export default getLayer