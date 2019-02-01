import MapaInteractivo from '@usig-gcba/mapa-interactivo'

 let map = new MapaInteractivo("map", {
    preferCanvas: true,
    language: "en",
    attributionControl: true,
    onLayerLoaded: function (layerName, layerId) {console.log (layerName, layerId)},
    onContextMenu: onContextMenu
  });

  function addLayerEstacionamientos() {
    map.addPublicLayer("estacionamiento_en_via_publica", {
      callAPIOnClick: true,
      onClickAPI: "http://epok.buenosaires.gob.ar/atlasvial/buscarInformacionEstacionamiento/?formato=geojson&fullInfo=True&x=$lng&y=$lat&categorias=$categories",
      baseLayer: {
        uri: "http://servicios.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/estacionamiento_en_via_publica_caba_3857@GoogleMapsCompatible/{z}/{x}/{y}.png"
      }
    });
  }

  function addLayer(id) {
    map.addPublicLayer(id, {clustering: true});
  }
  function onContextMenu(ev) {
    const id = map.addMarker(ev.latlng, true, false, false, false, false, {iconUrl: 'http://static.usig.buenosaires.gob.ar/symbols/bases_extrahospitalarias.png'});
  }

  function getImage() {
    map.getStaticImage().then((canvas) => {
      var img = document.createElement('img');
      var dimensions = map.getMapa().getSize();
      img.width = dimensions.x;
      img.height = dimensions.y;
      img.src = canvas.toDataURL();
      document.getElementById('images').innerHTML = '';
      document.getElementById('images').appendChild(img);
    })
  }
module.exports = {
	addLayerEstacionamientos: addLayerEstacionamientos,
	addLayer : addLayer,
        map
}
//  setTimeout(() => {
//    map.removePublicLayer("estacionamiento_en_via_publica");
//    map.addPublicLayer("cajeros_automaticos", {clustering: true});
//  }, 10000)
