import L from 'leaflet';
import transporte from '../imgs/transporte.png'
import bici from '../imgs/bici.png'
import auto from '../imgs/auto.png'
import subte from '../imgs/subte.png'
import tren from '../imgs/tren.png'
import caminar from '../imgs/caminar.png'
let endMarkerCount = 0;

function recorridoStyle(feature, recorrido) {
  let estilo = Object.assign({}, {
    radius: 10,
    fillColor: "#fff",
    color: recorrido.options.template.color,
    weight: 6,
    opacity: 0.65,
    fillOpacity: 1
  }, recorrido.estilo);
  if (feature.geometry.type === 'Point') {
    switch (feature.properties.type) {
      case 'walk':
        return estilo;

      case 'marker':
      case 'beginbus':
      case 'begintrain':
        return Object.assign({}, estilo, {weight: 3, fillColor: "#0075cf", color: "#144c82", radius: 10});

      default:
        return estilo;
    }
  } else {
    switch (feature.properties.type) {
      case 'walk':
        return Object.assign({}, estilo, {dashArray: [1, 6]});

      default:
        return estilo;
    }
  }
}
function recorridoPointToLayer(feature, latlng, css_class, recorrido){
  let content = '', i = 100, markerClass = '';
  if (feature.properties.type === 'beginwalk' ||
    (feature.properties.type === 'marker' && recorrido.tipo !== 'bike')
    || recorrido.tipo === 'car' || feature.properties.type === 'end') {
    endMarkerCount++;
    content = endMarkerCount + '';
    markerClass = 'stop';
    i = 1000;
  } else {
    markerClass = css_class;
    content = '<img src="' + transporte + '" width="16px" height="16px"/>';
    switch (feature.properties.type) {
      case 'beginbike':
      case 'bike':
        content = '<img src="' + bici + '" width="16px" height="16px"/>';
        break;
      case 'bus':
      case 'beginbus':
        content = '<img src="' + transporte + '" width="16px" height="16px"/>'
        break;
      case 'car':
        content = '<img src="' + auto + '" width="16px" height="16px"/>';
        break;
      case 'subway':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayA':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayB':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayC':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayD':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayE':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
      case 'subwayH':
        content = '<img src="' + subte + '" width="16px" height="16px"/>';
        break;
      case 'train':
      case 'begintrain':
        content = '<img src="' + tren + '" width="16px" height="16px"/>';
        break;
      case 'walk':
      case 'beginwalk':
        content = '<img src="' + caminar + '" width="16px" height="16px"/>';
        break;
      case 'connection':
      case 'marker':
        content = '&nbsp;'
        break;
    }
  }
  let myIcon = L.divIcon({className: 'marker-recorrido circlePill-mapa marker '+markerClass+' '+feature.properties.type, html: content, iconSize: L.Point(10, 20)});
  return L.marker(latlng, {icon: myIcon, zIndexOffset: i, opacity: recorrido.estilo && recorrido.estilo.markerOpacity || 1});
}

function getLayer(recorrido, coordinateConversion) {
  endMarkerCount = 0
  return L.geoJson(recorrido.geoJson, {
    style: (feature) => recorridoStyle(feature, recorrido),
    coordsToLatLng: coordinateConversion,
    pointToLayer: (feature, latlng) => recorridoPointToLayer(feature, latlng, 'recorrido_'+recorrido.options.template.index, recorrido)
  });
}

export default getLayer
