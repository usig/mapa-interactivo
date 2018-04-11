# Mapa Interactivo
Una manera simple de crear un mapa de la Ciudad de Buenos Aires y alrededores utilizando la libreria [leaflet](http://leafletjs.com/).

# Instalación
```
npm install @usig-gcba/mapa-interactivo
```

# Cómo usarlo

### ES6

```javascript
import MapaInteractivo from '@usig-gcba/mapa-interactivo'

const mapaInteractivo = new MapaInteractivo("mapa-id", {center: [34.5, 29.4]});
```

# API

#### new MapaInteractivo(id: String, opciones?: Object) => MapaInteractivo
* **id**: id del elemento html donde se debe insertar el mapa
* **opciones**: objecto de configuracion con cualquiera de las siguientes propiedades:

| Opcion        | Tipo           | Default  | Descripcion |
| ------------- |:-------------: | :---------:| :---------- |
| **onClick** | *function* | null |Callback llamado al hacer click en el mapa |
| **onContextMenu** | *function* | null |Callback llamado al hacer click derecho sobre el mapa |
| **onMoveStart** | *function* | null |Callback llamado al comienzo de un movimiento generado en el mapa (tanto por zoom como por desplazamiento) |
| **onMoveEnd** | *function* | null |Callback llamado al final de un movimiento generado en el mapa|
| **onMarkerDragEnd** | *function* | null |Callback llamado luego de arrastrar un marcador|
| **onFeatureClick** | *function* | null |Callback llamado al seleccionar un feature|
| **onInactivateMarker** | *function* | null |Callback llamado al desactivar un marcador|
| **center** | *[Number, Number]*     |    `[-34.62,   -58.44]` |Centro del mapa al iniciar|
| **zoomControl** | *boolean*      |   `false` |Mostrar el control de zoom cuando es `true`|
| **zoom** | *Number*      |   `13` |Nivel de zoom del mapa al iniciar|
| **touchZoom** | *boolean*      |   `true` | Habilita zoom mediante eventos touch cuando es `true` |
| **tap** | *boolean*      |   `true` | Habilita eventos touch cuando es `true` |
| **attributionControl** | *boolean*      |   `false` | Se muestra la informacion de atribucion
| **markerZoomInLevel** | *Number* | `15` |Nivel en el que se debe hacer zoom sobre un marcador |
| **featureZoomInLevel** | *Number*      |   `17` |Nivel en el que se debe hacer zoom sobre un feature|
| **language** | *String*      |   `es` |Idioma de los mensajes del mapa |
| **fromMarker** | [*Icon*](http://leafletjs.com/reference-1.3.0.html#icon)      |   ![alt text](https://mapa.buenosaires.gob.ar/imgs/marker-source.png "Marcador") |Icono del marcador de inicio al mostrar un recorrido|
| **toMarker** | [*Icon*](http://leafletjs.com/reference-1.3.0.html#icon)      |   ![alt text](https://mapa.buenosaires.gob.ar/imgs/marker-target.png "Marcador") |Icono del marcador de fin al mostrar un recorrido |
| **activeMarker** | [*Icon*](http://leafletjs.com/reference-1.3.0.html#icon)      |   ![alt text](https://mapa.buenosaires.gob.ar/imgs/marker-icon.png "Marcador") |Icono del marcador activo|
| **marker** | [*Icon*](http://leafletjs.com/reference-1.3.0.html#icon)      |   ![alt text](http://mapa.buenosaires.gob.ar/imgs/marker-target.png "Marcador") |Icono del marcador default |

##### *opciones.baseLayer?: Object*

| Opcion        | Tipo           | Default  | Descripcion |
| ------------- |:-------------: | :---------:| :----------: |
| **params.maxZoom** | *Number*      |   `18` |Zoom máximo sobre el mapa|
| **params.minZoom** | *Number*      |   `9` |Zoom minimo sobre el mapa|

##### *opciones.texts?: Object*

Objeto conteniendo los textos definidos para cada idioma. Por default se encuentran los siguientes textos: 
```javascript
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
   }
```
#### getMapa() => LeafletMap

*Retorna la instancia interna del mapa*

#### addPublicLayer(layerName: String, options?: Object)

*Agrega una capa en base a su nombre*
  * **layerName**: `String` indicando el nombre de la capa perteneciente a una de las [capas disponibles](http://epok.buenosaires.gob.ar/mapainteractivoba/layers).
  * **options**: `Object` conteniendo atributos opcionales de la capa
    * **clustering**: `boolean` si la capa debe ser clusterizada
    * **callAPIOnClick**: `boolean` en caso de `true`, se hace un llamado a la API especificada al hacer click sobre el mapa
    * **onClickAPI**: `String` API a la que se debe llamar al hacer click sobre el mapa
    * **layerId**: `String` identificador de la capa
    * **baseLayer**: en caso de que se incluya este parametro, la capa sera agregada como una capa base.
      * **Posibles tipos**
        * `Object`
          * **uri**: `String` uri utilizado para descargar la capa
          * **options**: `Object` opciones de [L.tileLayer](http://leafletjs.com/reference-1.3.0.html#tilelayer-option)
        * [`L.tileLayer`](http://leafletjs.com/reference-1.3.0.html#tilelayer)
    
#### removePublicLayer(layerName: String)

*Remueve una capa en base a su nombre*
  * **layerName**: `String` nombre de la capa
  
#### setBaseLayer()

*Agrega la capa base default del mapa*

#### setBaseLayer(baselayer: [L.tileLayer](http://leafletjs.com/reference-1.3.0.html#tilelayer))

*Cambia la capa base del mapa*
##### Parámetros

  * **baseLayer**: `L.tileLayer` la nueva base a agregar
  
#### setBaseLayer(baselayer: Object)

*Cambia la capa base del mapa*
##### Parámetros

  * **baseLayer**: `Object` la nueva base a agregar conteniendo:
    * **uri**: `String` uri utilizado para descargar la capa
    * **options**: `Object` opciones de [L.tileLayer](http://leafletjs.com/reference-1.3.0.html#tilelayer-option)
  
#### addMarker(latlng: Object, visible: boolean, draggable: boolean, goTo: boolean, activate: boolean, clickable: boolean, options: Object) => markerId: Number

*Agrega un marcador en la posicion especificada, retornando su id*
##### Parámetros

  * **latlng**: `Object` posicion del marcador
    * **lat**: `Number` latitud
    * **lng**: `Number` longitud
  * **visible**: `boolean` indicando si el marcador debe estar visible
  * **draggable**: `boolean` indicando si el marcador puede ser arrastrado
  * **goTo**: `boolean` indicando si el mapa debe recentrarse en el marcador
  * **activate**: `boolean` indicando si se debe activar el marcador
  * **clickable**: `boolean` indicando si el marcador puede ser clickeado
  * **options**: `Object` datos a guardar dentro del marcador
##### Return

  * `Number` id del marcador generado
  
#### selectMarker(markerId: String)

*Selecciona el marcador indicado*
##### Parámetros

  * **markerId**: `Number` id del marcador a seleccionar

#### selectMarker(markerId: String) => boolean
*Pregunta si el marcador esta activo*
##### Parámetros
  * **markerId**: `Number` id del marcador a analizar
  
#### removeMarker(markerId: String)
*Remueve el marcador indicado*
##### Parámetros
  * **markerId**: `Number` id del marcador a remover
##### Return
  * **seleccionado**: `boolean` indicando si el marcador esta seleccionado
  
#### addLocationMarker(position: Object, recenter: boolean, zoomIn: boolean) => [L.Marker](http://leafletjs.com/reference-1.3.0.html#marker)
*Agrega al mapa un marcador de ubicación actual en la posicion especificada*
##### Parámetros
  * **position**: `Object` posicion del marcador
    * **coords**: `Object`
      * **latitude**: `Number` latitud
      * **longitude**: `Number` longitud
  * **recenter**: `boolean` indicando si el mapa debe recentrarse en la posicion del marcador
  * **zoomIn**: `boolean` indicando si se debe ajustar el nivel de zoom
##### Return
  * **marker**: `L.marker` marcador agregado
  
#### mostrarRecorrido(recorrido: Object)
*Agrega un recorrido al mapa*
##### Parámetros
  * **recorrido**: `Object` recorrido a ser agregado. El mismo debe seguir cierta [estructura](https://www.npmjs.com/package/@usig-gcba/recorridos)

#### ocultarRecorrido(recorrido: Object)
*Remueve el recorrido del mapa*
##### Parámetros
  * **recorrido**: `Object` recorrido a ser removido.
