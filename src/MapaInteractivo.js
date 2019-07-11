import L from 'leaflet';
/*
Misterioso fix para cluster group
https://github.com/Asymmetrik/ngx-leaflet-markercluster/issues/6
*/
import MarkerClusterGroup from 'imports-loader?L=leaflet!exports-loader?L.MarkerClusterGroup!../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';
import './leaflet-message/Message.control.css';
import './leaflet-message/Message.control.js';
import activeMarkerIcon from './imgs/marker-icon-1x.png'
import markerIcon from './imgs/marker-icon.png'
import genericPoint from './layer-builders/GenericPointLayerBuilder'
import genericLine from './layer-builders/GenericLineLayerBuilder'
import cortes_de_transito from './layer-builders/CortesDeTransitoLayerBuilder'
import estaciones_de_servicio from './layer-builders/EstacionesDeServicioLayerBuilder'
import estaciones_de_bicicletas from './layer-builders/EstacionesDeBicicletasLayerBuilder'
import recorrido from './layer-builders/RecorridoLayerBuilder'
import {Coords} from './utils/coordinates'
import iconoOrigen from './imgs/marker-source.png'
import iconoDestino from './imgs/marker-target.png'
import _ from 'lodash'
import leafletImage from './utils/leaflet-image';
import "leaflet.heat";
import './leaflet-vectorgrid/Leaflet.VectorGrid.js';

// Purge window.L early
// L.noConflict();
// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
const defaults = {
    markerZoomInLevel: 15,
    featureZoomInLevel: 17,
    params: {
        center: [-34.62, -58.44],
        zoomControl: false,
        zoom: 13,
        touchZoom: true,
        tap: true,
        legends: true,
        infoControl: false,
        attributionControl: false,
        scaleControl: true
    },
    baseLayer: {
        uri: 'https://servicios.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png',
        params: {
            maxZoom: 18,
            minZoom: 9,
            attribution: '<a href="https://usig.buenosaires.gob.ar" target="_blank">USIG</a> (<a href="http://www.buenosaires.gob.ar" target="_blank">GCBA</a>), © <a href="http://www.openstreetmap.org/copyright/en" target="_blank">OpenStreetMap</a> (ODbL)',
            tms: true,
            id: '',
            accessToken: ''
        }
    },
    activeMarker: L.icon({
        iconUrl: activeMarkerIcon,
        iconSize: [24, 38],
        iconAnchor: [12, 31],
        popupAnchor: [0, -22],
        shadowUrl: ''
    }),
    fromMarker: L.icon({
      iconUrl: iconoOrigen,
      iconSize: [24, 38],
      iconAnchor: [12, 31],
      popupAnchor: [0, -22],
      shadowUrl: ''
    }),
    toMarker: L.icon({
      iconUrl: iconoDestino,
      iconSize: [24, 38],
      iconAnchor: [12, 31],
      popupAnchor: [0, -22],
      shadowUrl: ''
    }),
   marker: L.icon({
        iconUrl: markerIcon,
        iconSize: [24, 38],
        iconAnchor: [12, 31],
        popupAnchor: [0, -22],
        shadowUrl: ''
    }),
    layers: {
        apiUrl: 'https://epok.buenosaires.gob.ar/',
        reverseGeocodeUrl: 'reverseGeocoderLugares'
    },
    texts: {
      es: {
        loadingLayers: 'Cargando capas...',
        loadingMaps: 'Cargando mapas...',
        loadingInformation: 'Cargando información...',
        errorLoadingInformation: 'Se produjo un error al acceder a la información. Reintente más tarde.'
      },
      en : {
        loadingLayers: 'Loading layers...',
        loadingMaps: 'Loading maps...',
        loadingInformation: 'Loading information...',
        errorLoadingInformation: 'An error ocurred. Please try again later.'
      }
    },
    language: "es"
};

class MapaInteractivo {
    constructor(nodeId, options) {
        this.config = Object.assign({}, defaults, options);
        this.config.supportedLanguages = Object.keys(this.config.texts);
        if (this.config.supportedLanguages.length === 0) {
          this.config.texts = defaults.texts;
          this.config.language = defaults.language;
          this.config.supportedLanguages = Object.keys(this.config.texts);
        }
        if (this.config.supportedLanguages.indexOf(this.config.language) === -1)
          this.config.language = this.config.supportedLanguages[0];
        const params = Object.assign({}, this.config.params, options);
        this.map = L.map(nodeId, params);
        this.msgControl = L.control.message({
            position: 'bottomleft',
            message: ''
        }).addTo(this.map);
        this._markers = {};
        this._recorridos = {}
        this._layers = {};
        this._lastFitBounds = null;
		    this._layerGroup = L.layerGroup().addTo(this.map);
        this._markersLayerGroup = L.featureGroup().addTo(this.map);
        this._markersClusterLayerGroup = new MarkerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 30});
        // this.msgControl.show('Cargando...')
        if (params.scaleControl)
          L.control.scale({ imperial: false, position: "bottomleft" }).addTo(this.map);
        this.baseLayer = L.tileLayer(this.config.baseLayer.uri, this.config.baseLayer.params);
        this.baseLayer.addTo(this.map);
        this.map.on('contextmenu', this._onContextMenu, this);
        this.map.on('click', this._onClick, this);
        this.map.on('zoomstart', this._onMoveStart, this);
        this.map.on('dragstart', this._onMoveStart, this);
        this.map.on('zoomend', this._onMoveEnd, this);
        this.map.on('dragend', this._onMoveEnd, this);
        this.mapsDefs = null;
        this.layersDefs = null;
        const self = this;
        this._layerBuilders = {
            tms: (config) => {
                    return L.tileLayer(config.url, config.options);
                },
            genericPoint,
            genericLine,
            cortes_de_transito,
            estaciones_de_servicio,
            estaciones_de_bicicletas,
            recorrido
        }
    }
    setIdioma(idioma) {
      if (this.config.supportedLanguages.indexOf(idioma) > -1) {
        this.config.language = idioma;
      }
    }

    getStaticImage() {
      return new Promise((resolve, reject) => {
        leafletImage(this.map, function(err, canvas) {
          // now you have canvas
          // example thing to do with that canvas:
          if (err) reject();
          resolve(canvas);
        });
      });
    }

    mostrarRecorrido(r, options) {
      if (!this._recorridos[r.id]) {
        // this.ocultarRecorrido();
        this._recorridos[r.id] = r;
      }
      for (let id in this._recorridos) {
        let auxRecorrido = this._recorridos[id];
        if (id === r.id)  {
          if (!auxRecorrido._layer) {
            // this.ocultarRecorrido();
            this._recorridos[r.id] = Object.assign({}, r, {estilo: (r.setOpacity ? {opacity: 0.65, markerOpacity: 1} : {opacity: 0.35, markerOpacity: 0.35})});
            this._recorridos[r.id]._layer = recorrido(this._recorridos[r.id], r.tipo === 'car' || r.tipo === 'walk' ? null : Coords.toLngLat);
            this._recorridos[r.id]._layer.on('click', (e) => this.recorridoClick(e, r.id));
            this._layerGroup.addLayer(this._recorridos[r.id]._layer);

            this._lastFitBounds = this._recorridos[r.id]._layer.getBounds();
            this._fitBoundsOptions = {
              paddingTopLeft: options.paddingTopLeft,
              paddingBottomRight: options.paddingBottomRight,
              padding: options.padding,
              maxZoom: options.maxZoom
            };
            this.refitBounds();
            // this.map.fitBounds(this._recorridos[r.id]._layer.getBounds(), options);
          }
          else {
            auxRecorrido.estilo = r.setOpacity ? {opacity: 0.65, markerOpacity: 1} : {opacity: 0.35, markerOpacity: 0.35};
            this._layerGroup.removeLayer(auxRecorrido._layer);
            this._recorridos[auxRecorrido.id]._layer = recorrido(auxRecorrido, auxRecorrido.tipo === 'car' || auxRecorrido.tipo === 'walk' ? null : Coords.toLngLat);
            this._recorridos[auxRecorrido.id]._layer.on('click', (e) => this.recorridoClick(e, auxRecorrido.id));
            this._layerGroup.addLayer(auxRecorrido._layer);
          }
        }
        else {
          auxRecorrido.estilo = r.setOpacity ? {opacity: 0.35, markerOpacity: 0.35} : auxRecorrido.estilo;
          this._layerGroup.removeLayer(auxRecorrido._layer);
          this._recorridos[auxRecorrido.id]._layer = recorrido(auxRecorrido, auxRecorrido.tipo === 'car' || auxRecorrido.tipo === 'walk' ? null : Coords.toLngLat);
          this._recorridos[auxRecorrido.id]._layer.on('click', (e) => this.recorridoClick(e, auxRecorrido.id));
          this._layerGroup.addLayer(auxRecorrido._layer);
        }
      }
    }
    mostrarPaso(recorridoId, pasoId) {
      let selectedGeometry;
      if (pasoId === 'end') {
        this.map.flyTo(this._markers[this.toMarkerId].getLatLng(), 16);
      }
      else {
        this._recorridos[recorridoId]._layer.eachLayer((geometry) => {if (geometry.feature.properties.paso_id === pasoId) selectedGeometry = geometry});
        if (selectedGeometry) {
          if (selectedGeometry.feature.geometry.type === "Point") {
            this.map.flyTo(selectedGeometry.getLatLng(), 16);
          }
          else {
            this.map.fitBounds(selectedGeometry.getBounds(), {
              padding: [40,40]
            });
          }
          console.log (selectedGeometry);
        }
      }
    }
    recorridoClick (e, recId) {
      L.DomEvent.stop(e);
      if (typeof(this.config.onRecorridoClick) === "function") {
        this.config.onRecorridoClick(e, recId);
      }
    }

    mostrarMarkersRecorrido(r) {
      if (!this._mostrandoMarkersRecorrido) {
        let coordsOrigen = null;
        let coordsDestino = null;

        if (r.coordOrigen) {
          coordsOrigen = Coords.toLngLat(r.coordOrigen.split(',').map(parseFloat));
          coordsDestino = Coords.toLngLat(r.coordDestino.split(',').map(parseFloat));
        } else {
          coordsOrigen = r.origen.direccion.coordenadas;
          coordsDestino = r.destino.direccion.coordenadas;
          coordsOrigen = L.latLng(coordsOrigen.y, coordsOrigen.x);
          coordsDestino = L.latLng(coordsDestino.y, coordsDestino.x);
        }

        this.toMarkerId = this.addMarker(coordsDestino, true, false, false, false, false, { icon: this.config.toMarker });
        this.fromMarkerId = this.addMarker(coordsOrigen, true, false, false, false, false, { icon: this.config.fromMarker });
        this._mostrandoMarkersRecorrido = true;
      }
    }
    ocultarMarkersRecorrido() {
      if (this.toMarkerId && this.fromMarkerId) {
        this.removeMarker(this.toMarkerId);
        this.removeMarker(this.fromMarkerId);
        this._mostrandoMarkersRecorrido = false;
        this.toMarkerId = undefined;
        this.fromMarkerId = undefined;
      }
    }
    refitBounds() {
        this.map.fitBounds(this._lastFitBounds, this._fitBoundsOptions);
    }

    invalidateSize(fitBounds) {
        if (this.map) {
            this.map.invalidateSize(fitBounds);
        }
    }

    ocultarRecorrido(r, ocultarMarkers) {
        // console.log('ocultarRecorrido', r);
        const id = r.id || r;
        if (id && this._recorridos[id] && this._recorridos[id]._layer) {
            this._layerGroup.removeLayer(this._recorridos[id]._layer);
            delete this._recorridos[id]._layer;
            delete this._recorridos[id];
            this.msgControl.hide();
            if (ocultarMarkers && this._mostrandoMarkersRecorrido) {
              this.ocultarMarkersRecorrido();
            }
        }
    }

    _loadLayerDefs() {
        if (!this._loadingLayers && !this.layersDefs) {
            this._loadingLayers = true;
            let layerPromise = fetch(this.config.layers.apiUrl+'mapainteractivoba/layers/?protocol=https')
            .then ((res) => res.json())
            .then ((layersDefs) => {
                this._loadingLayers = false;
                this.layersDefs = layersDefs;
                // console.log('layersDefs', layersDefs)
            }).catch((err) => {
                console.error(err)
            });
            return layerPromise;
        }
        return new Promise((resolve, reject) => reject());
    }

    setLayerDefs(defs) {
        this.layersDefs = defs;
    }

    _loadMapsDefs() {
        if (!this._loadingMaps && !this.mapsDefs) {
            this._loadingMaps = true;
            let mapsPromise = fetch(this.config.layers.apiUrl+'mapainteractivoba/mapas/?protocol=https')
            .then ((res) => res.json())
            .then ((mapsDefs) => {
                this._loadingMaps = false;
                this.mapsDefs = mapsDefs;
            }).catch((err) => {
                console.error(err)
            });
            return mapsPromise;
        }
        return false;
    }

    setMapsDefs(defs) {
        this.mapsDefs = defs;
    }

	_loadLayer(layerName, layerGroup) {
        // console.log('loadLayer', layerName, layerGroup);
        const self = this;
    const conf = layerName.indexOf(".") === -1 ? this.layersDefs[layerName] : {[layerName]: this.layersDefs[layerName.split('.')[0]][layerName.split('.')[1]]};

    this._loadingLayer = true;
        Object.entries(conf).forEach((layer) => {
          switch(layer[1].format) {
            case 'geojson':
                        this.msgControl.show(this.config.texts[this.config.language].loadingInformation);
                        // console.log('Fetching ', layer[1].url);
                        fetch(layer[1].url)
                        .then((res) => res.json())
                        .then((data) => {
                            if (self._layers[layerName]) {
                              self._addLayer(layerName, layer[0], layerGroup||self._layerGroup, data);
                              this._loadingLayer = false;
                            }
                        }).catch((err) => {
                          if (self._layers[layerName]) {
                            console.error(err);
                            self.msgControl.show(this.config.texts[this.config.language].errorLoadingInformation);
                            this._loadingLayer = false;
                          }
                        });
            break;
            case 'wms':
            case 'tms':
              this._addLayer(layerName, layer[0], layerGroup||this._layerGroup, layer[1]);
              this._loadingLayer = false;
              break;
          }
        });
    }

    _buildClickedFeatureIcon(featureIcon) {
        const newIcon = {
            iconUrl: featureIcon.options.iconUrl,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            shadowUrl: featureIcon.options.shadowUrl,
            shadowSize: [36, 36],
            shadowAnchor: [18, 18]
        }
        return L.icon(newIcon)
    }

    _onFeatureClick(e) {
        // console.log(e);
        this.inactivateMarker();
        const layerId = e.target && e.target.options?e.target.options.layerId:'';
        const layerName = e.target && e.target.options?e.target.options.layerName:'';
        // this.map.flyTo(e.latlng, this.config.featureZoomInLevel)
        if (this._lastFeatureClicked) {
            this._lastFeatureClicked.setIcon(this._lastFeatureClickedIcon);
        }
        this._lastFeatureClicked = e.layer;
        this._lastFeatureClickedIcon = e.layer.options.icon;
        e.layer.setIcon(this._buildClickedFeatureIcon(e.layer.options.icon));
      this.map.flyTo(e.latlng);

      if (e && e.layer && e.layer.feature) {
            if (typeof(this.config.onFeatureClick) === "function") {
                this.config.onFeatureClick(e.layer.feature, layerId, layerName);
            }
        }
    }

    getFeatureProps(fid) {
        return fetch(this.config.layers.apiUrl+'getObjectContent/?id='+fid)
    }

	_addLayer(layerName, layerId, layerGroup, data) {
      const layer = layerName.indexOf(".") === -1 ? this.layersDefs[layerName] : {[layerName]: this.layersDefs[layerName.split('.')[0]][layerName.split('.')[1]]};
		this.msgControl.hide();
		const builder = (this._layerBuilders[layerId] || !layer[layerId].builder)?layerId:layer[layerId].builder;
        try {
            if (this._layerBuilders[builder]) {
                if (!this._layers[layerName]) {
                    this._layers[layerName] = [];
                }
                if (this._layers[layerName][layerId]) {
                    layerGroup.removeLayer(this._layers[layerName][layerId]);
                }
                this._layers[layerName][layerId] = this._layerBuilders[builder](data, undefined,
                  layer[layerId].style, layer[layerId].icon);
                this._layers[layerName][layerId].on('click', this._onFeatureClick.bind(this));
                this._layers[layerName][layerId].options.layerId = layerId;
                this._layers[layerName][layerId].options.layerName = layerName;
                layerGroup.addLayer(this._layers[layerName][layerId]);
                this._layers[layerName][layerId].fire('add');
                layerGroup.addTo(this.map);
                if (layer[layerId].options && layer[layerId].options.refresh) {
                    // console.log('auto refresh', layerName, layerGroup);
                    clearTimeout(this._layers[layerName].refreshTimeout);
                    const self = this;
                    this._layers[layerName].refreshTimeout = setTimeout(() => {
                        self.loadLayer(layerName, layerGroup)
                    }, this.Layers[layerName][layerId].options.refresh);
                }
              if (typeof(this.config.onLayerLoaded) === "function") {
                this.config.onLayerLoaded(layerName, layerId);
              }
            } else {
                throw("LayerBuilderNotDefined");
            }
        } catch(e) {
            console.error(e);
        }
    }

    addPublicLayer(layerName, options = {}) {
        if (!this._layers[layerName]) {
          this.inactivateMarker();
          if (this.layersDefs) {
            const layer = layerName.indexOf(".") === -1 ? this.layersDefs[layerName] : this.layersDefs[layerName.split('.')[0]][layerName.split('.')[1]];
            if (layer) {
              if (!this._layers[layerName]) {
                this._layers[layerName] = Object.assign({}, this._layers[layerName], options);
              }
              if (options.baseLayer)
                this.setBaseLayer(options.baseLayer);
              else if (options && options.clustering) {
                this._loadLayer(layerName, this._markersClusterLayerGroup);
              } else {
                this._loadLayer(layerName, this._layerGroup);
              }
            }
          } else if (!this.layersDefs) {
            // console.log('Must load layers defs');
            const self = this;
            this.msgControl.show(this.config.texts[this.config.language].loadingLayers);
            this._loadLayerDefs().then(() => {
              self.msgControl.hide();
              self.addPublicLayer(layerName, options);
            });
          }
        }
    }

    removePublicLayer(layerName) {
      if (this.layersDefs) {
        const layer = layerName.indexOf(".") === -1 ? this.layersDefs[layerName] : {[layerName]: this.layersDefs[layerName.split('.')[0]][layerName.split('.')[1]]};
        if (this.onClickFeature) this.map.removeLayer(this.onClickFeature);
        if (layer) {
          if (this._layers[layerName]) {
            if (this._layers[layerName].baseLayer)
              this.setBaseLayer();
            else {
              Object.entries(layer).forEach((layer) => {
                try {
                  if (!this._loadingLayer) {
                    if (this._layers[layerName].clustering) {
                      this._markersClusterLayerGroup.removeLayer(this._layers[layerName][layer[0]]);
                    } else {
                      this._layerGroup.removeLayer(this._layers[layerName][layer[0]]);
                    }
                  }
                  clearTimeout(this._layers[layerName].refreshTimeout);
                } catch(e) {
                  console.error(e);
                }
              });
            }
            delete this._layers[layerName];
          }
        }
        console.log (this._layers)
      }
    }

    setBaseLayer(baseLayer) {
      if (this.baseLayer)
        this.map.removeLayer(this.baseLayer);
      if (!baseLayer) {
        this.baseLayer = L.tileLayer(this.config.baseLayer.uri, this.config.baseLayer.params);
      }
      else if (baseLayer.uri) {
        this.baseLayer = L.tileLayer(baseLayer.uri, Object.assign ({}, baseLayer.params, this.config.baseLayer.params));
      }
      else {
        this.baseLayer = baseLayer;
      }
      this.baseLayer.addTo(this.map);
    }

    _onContextMenu(ev) {
        if (typeof(this.config.onContextMenu) === "function") {
            this.config.onContextMenu(ev);
        }
    }

    _onClick(ev) {
      if (typeof(this.config.onClick) === "function") {
        this.inactivateMarker();
        this.config.onClick(ev);
      }
      let messageControl;

      _.forOwn(this._layers, (layer, layerName) => {
        if (layer.callAPIOnClick) {
          const url = (layer.onClickAPI || this.config.layers.apiUrl + this.config.layers.reverseGeocodeUrl)
            .replace("$lng", ev.latlng.lng)
            .replace("$lat", ev.latlng.lat)
            .replace("$categories", layerName);
          if (!messageControl) this.msgControl.show(this.config.texts[this.config.language].loadingInformation);
          if (this.onClickFeature) {
            this.map.removeLayer(this.onClickFeature);
            this.onClickFeature = null;
          }
          fetch(url).then ((res) => res.json()).then((data) => {
            this.msgControl.hide();
            if (data.features && data.features.length > 0) {
              const geometria = data;
              this.onClickFeature = L.geoJSON(geometria.features[0], {
                style: {
                  color: "rgb(221, 0, 131)", weight: 10
                }
              });
              this.onClickFeature.addTo(this.map);
              if (typeof(this.config.onFeatureClick) === "function") {
                this.config.onFeatureClick(geometria.features[0], layer.layerId, layerName);
              }
            }
          })
        }
      });
    }

    _onMoveStart(ev) {
      if (typeof(this.config.onMoveStart) === "function") {
        this.config.onMoveStart(ev);
      }
    }

    _onMoveEnd(ev) {
      if (typeof(this.config.onMoveEnd) === "function") {
        this.config.onMoveEnd(ev);
      }
    }

    _onMarkerClick(ev) {
      this.selectMarker(ev.target.options.markerId)
    }

    selectMarker(markerId) {
      this.inactivateMarker();
      const marker = markerId === "-1" ? this._locationMarker : this._markers[markerId];
      this.activateMarker(marker.options.markerId);
      this.map.flyTo(marker.getLatLng());
      if (typeof(this.config.onMarkerClick) === "function") {
        this.config.onMarkerClick(marker.options.markerId, marker);
      }
    }

    inactivateMarker() {
        if (this._activeMarker) {
            this._activeMarker.setIcon(this.config.marker);
            this._activeMarker = null;
        }
        if (this._lastFeatureClicked) {
            this._lastFeatureClicked.setIcon(this._lastFeatureClickedIcon);
            this._lastFeatureClicked = null;
        }
        if (typeof(this.config.onInactivateMarker) === "function") {
            this.config.onInactivateMarker();
        }
    }

    activateMarker(markerId) {
      if (this._markers[markerId] && this._markers[markerId].options.clickable) {
        this._markers[markerId].setIcon(this.config.activeMarker);
        this._activeMarker = this._markers[markerId];
      }
    }

    isMarkerActive(markerId){
      return this._activeMarker && this._activeMarker.options.markerId === markerId
    }
    _onMarkerDragEnd(ev) {
        // console.log(ev);
        if (this._activeMarker && (ev.target.options.markerId !== this._activeMarker.options.markerId)) {
            this.inactivateMarker();
            this.activateMarker(ev.target.options.markerId)
        }
        if (!this._activeMarker) {
            this.activateMarker(ev.target.options.markerId)
        }
        if (typeof(this.config.onMarkerDragEnd) === "function") {
            this.config.onMarkerDragEnd(ev.target.options.markerId, ev.target);
        }
    }

	addMarker(latlng, visible = true, draggable = false, goTo, activate = true, clickable = true, options = {}) {
        let random = Math.floor(Math.random()*100001);
        let id = options.markerId?options.markerId:new Date()*1 +random;
        const existentMarker = _.map(this._markers, (value) => value).filter((marker) => marker.options.id === (options.id || id))[0];
        if (!this._markers[id] && !existentMarker) {
          const icon = options.icon || (options.iconUrl ?
            L.icon({
              iconUrl: options.iconUrl || activeMarkerIcon,
              iconSize: options.iconSize || [24, 38],
              iconAnchor: options.iconAnchor || [12, 31],
              popupAnchor: options.popupAnchor || [0, -22],
              shadowUrl: options.shadowUrl || ''
            }) : (activate?this.config.activeMarker:this.config.marker));

          let marker = L.marker(latlng, {icon: icon, clickable: clickable, draggable: draggable, markerId: id, id: options.id, zIndexOffset: 2000});

          if (activate) {
              this.inactivateMarker();
              this._activeMarker = marker;
          }
          marker.on('click', this._onMarkerClick.bind(this));
          if (draggable) {
            marker.on('dragend', this._onMarkerDragEnd.bind(this));
          }

          // marker.bindPopup(this.templateMarkersMenu({ titulo: etiqueta, subtitulo: '', markerClass: 'marker', id: id, latlng: coords.y+','+coords.x }), { className: 'marker-menu-popup'});
          this._markers[id] = marker;
          marker.visible = visible;
          if (visible) {
            this._markersLayerGroup.addLayer(marker);
          }
          if (goTo) {
            this.goToMarker(marker, true);
          }
        } else if (this._markers[id] && !this._markers[id].options.id) {
            this._markers[id].options.id = options.id;
        }
        if (existentMarker && goTo) this.goToMarker(existentMarker, false);
		return id;
	}

	removeMarker(id) {
		this._markersLayerGroup.removeLayer(this._markers[id]);
		this._markers[id] = undefined;
		delete this._markers[id];
	}

    getMapViewport() {
        return {
            center: this.map.getCenter(),
            zoom: this.map.getZoom()
        }
    }

    getCenter() {
      return this.map.getCenter();
    }

    remove() {
        try {
            this.map.remove();
        } catch (e) {
            console.log("ERROR: fallo al quitar el mapa.")
        }
    }

    getLocationClass(pos) {
        return (Date.now() - pos.timestamp > 10000 || pos.coords.accuracy > 200 ? 'gray' : '')
    }

    _createLocationMarker(pos) {
        this._locationMarkerClass = this.getLocationClass(pos);
        let iconLocation = L.divIcon({
            className: 'circle ' + this.getLocationClass(pos)
        });
        this._locationMarker = L.marker(
            L.latLng(pos.coords.latitude, pos.coords.longitude),
            { icon: iconLocation, markerId: "-1", id: "-1" , zIndexOffset: 1000, lat: pos.coords.latitude, lon: pos.coords.longitude}
        ).addTo(this.map);
        this._locationMarker.on('click', this._onMarkerClick.bind(this));
    }

    addLocationMarker(pos, recenter, zoomIn) {
        // console.log('addLocationMarker: ', pos);
        if (!this._locationMarker) {
            this._createLocationMarker(pos);
        } else if (this._locationMarkerClass === this.getLocationClass(pos)) {
            this._locationMarker.setLatLng(L.latLng(pos.coords.latitude, pos.coords.longitude));
        } else {
            this.map.removeLayer(this._locationMarker);
            this._createLocationMarker(pos);
        }
        if (recenter) {
            this.goToMarker(this._locationMarker, zoomIn);
        }
        return this._locationMarker;
    }

    goToMarker(marker, zoomIn) {
        if (zoomIn) {
            this.map.flyTo(marker.getLatLng(), this.config.markerZoomInLevel);
        } else {
            this.map.flyTo(marker.getLatLng());
        }
    }

    setHeatMapData(data, options) {
      this.heat = L.heatLayer(data, options).addTo(this.map);
    }
    removeHeatMapData() {
      this.map.removeLayer(this.heat);
    }

    addVectorTileLayer(layerName, options){
      this._loadingLayer = true;
      let that = this;
      let url = false;
      if (!this._layers[layerName]) {
        this.inactivateMarker();
        if (options && options.url){
          url = options.url;

          let layer = L.vectorGrid.protobuf(url, {
            rendererFactory: L.canvas.tile,
            vectorTileLayerStyles: (options.style)? options.style : {},
            interactive: true,
            token: (options.token)? options.token : '',
            key: (options.key)? options.key : '',
            attribution: ''
          });
          if(layer){
              this._layers[layerName] = layer;
              this.msgControl.show(this.config.texts[this.config.language].loadingLayers);
              layer.addTo(this.map);
              if(options.displayPopup){
                const eventListener = (options.displayPopup.onEvent)? options.displayPopup.onEvent : 'click';
                layer.on(eventListener,function(e){
                  that.showVectorTilePopup(e,options.displayPopup);
                });
              }
              setTimeout(()=>{
                this.msgControl.hide();
                this._loadingLayer = false;
              },2000)
          }

        }else{
          console.log("Error: es necesario pasar la url del tile service entre las opciones");
        }

      }
    }

    showVectorTilePopup(e,options){
        const template = L.Util.template(options.content,e.layer.properties)
        L.popup()
         .setLatLng(e.latlng)
         .setContent(template)
         .openOn(this.map);
    }

    removeVectorTileLayer(layerName){
        if(this._layers[layerName]){
          this.map.removeLayer(this._layers[layerName]);
          delete this._layers[layerName];
        }
    }

    showMessage(text) {
        this.msgControl.show(text);
    }

    hideMessage() {
        this.msgControl.hide();
    }

    getMapa() {
      return this.map;
    }

    getMapEngine() {
      return L;
    }


}

export default MapaInteractivo;
