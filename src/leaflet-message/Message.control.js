import L from 'leaflet';

/*
 * L.Control.Message 
 */

L.Control.Message = L.Control.extend({
	options: {
		position: 'bottomleft',
		message: 'Message'
	},
	self: this,

	onAdd: function (map) {
		this.container = L.DomUtil.create('div', 'leaflet-control-message');
		this.container.innerHTML = '<p>'+this.options.message+'</p>';

		var stop = L.DomEvent.stopPropagation,
			self = this;
		L.DomEvent
		    .on(this.container, 'click', stop)
		    .on(this.container, 'mousedown', stop)
		    .on(this.container, 'dblclick', stop)
		    .on(this.container, 'click', L.DomEvent.preventDefault)
		    .on(this.container, 'click', self.hide, self);

		this._map = map;

		return this.container;
	},

	changeMessage: function(text) {
		this.container.innerHTML = '<p>'+text+'</p>';
	},

	hide: function() {
		L.DomUtil.removeClass(this.container, 'active');
	},

	show: function(text) {
		if (text) {
			this.changeMessage(text);
		}
		L.DomUtil.addClass(this.container, 'active');
	}	
});


L.control.message = function (options) {
	return new L.Control.Message(options);
};