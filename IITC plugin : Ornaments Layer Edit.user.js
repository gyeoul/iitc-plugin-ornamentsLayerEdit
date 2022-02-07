// ==UserScript==
// @name           IITC plugin: Ornaments Layer Edit
// @id             iitc-plugin-ornamentsLayerEdit
// @version        0.0.1
// @category       Layer
// @name           IITC plugin: Edited Oranments Layer (ap2,Scout)
// @author         Gyeoul
// @description    [2022-02-07-2252] 스카우트, ap2 레이어 분리 및 크기 조절 스크립트
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    // PLUGIN START ////////////////////////////////////////////////////////
    window.plugin.ornamentsLayerEdit = function () { };

    window.plugin.ornamentsLayerEdit.setup = function () {
        var layerGroup = L.layerGroup;
        if (window.map.options.preferCanvas && L.Browser.canvas && !window.DISABLE_CANVASICONLAYER) {
            layerGroup = L.canvasIconLayer;
            L.CanvasIconLayer.mergeOptions({ padding: L.Canvas.prototype.options.padding });
        }
        window.ornaments._sc = layerGroup();
        window.ornaments._ap2 = layerGroup();
        window.addLayerGroup('ap2', window.ornaments._ap2, true);
        window.addLayerGroup('Scout', window.ornaments._sc, true);

        window.ornaments.addPortal = function (portal) {
            this.removePortal(portal);

            var ornaments = portal.options.data.ornaments;
            if (ornaments && ornaments.length) {
                this._portals[portal.options.guid] = ornaments.map(function (ornament) {
                    var layer = this._layer;
                    if (ornament.startsWith('pe')) {
                        layer = ornament === 'peFRACK'
                            ? this._frackers
                        : this._beacons;
                    }
                    if (ornament.startsWith('ap')) {
                        layer = ornament === 'ap2'
                            ? this._ap2
                        : this._beacons;
                    }
                    if (ornament.startsWith('sc')) {
                        layer = ornament === 'sc5_p'
                            ? this._sc
                        : this._beacons;
                    }
                    var size = window.ornaments.OVERLAY_SIZE*1.2;
                    return L.marker(portal.getLatLng(), {
                        icon: L.icon({
                            iconUrl: '//commondatastorage.googleapis.com/ingress.com/img/map_icons/marker_images/' + ornament + '.png',
                            iconSize: [size, size],
                            iconAnchor: [size/2, size/2] // https://github.com/IITC-CE/Leaflet.Canvas-Markers/issues/4
                        }),
                        interactive: false,
                        keyboard: false,
                        opacity: window.ornaments.OVERLAY_OPACITY,
                        layer: layer
                    }).addTo(layer);
                }, this);
            }
        }
    };

    var setup = window.plugin.ornamentsLayerEdit.setup;

    // PLUGIN END //////////////////////////////////////////////////////////

    setup.info = plugin_info; //add the script info data to the function as a property
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end


    var script = document.createElement('script');
    var info = {};
    if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
    script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
    (document.body || document.head || document.documentElement).appendChild(script);
