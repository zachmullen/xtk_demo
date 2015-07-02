girder.views.xtk_demo_XtkView = girder.View.extend({
    initialize: function (settings) {
        this.files = settings.files;
        this.item = settings.item;
        this.bgColor = '#000000';
    },

    render: function () {
        this.$el.html(girder.templates.xtk_demo_viewer());
        this.renderer = new X.renderer3D();
        //this.renderer = new X.renderer2D();
        //this.renderer.orientation = 'x';
        this.renderer.container = this.$('.g-render-target')[0];
        this.renderer.init();

        var obj = this._instantiateObject();

        if (obj) {
            this.renderer.add(obj);
            this.renderer.camera.position = [0, 400, 0];
            this.renderer.render();
        }
    },

    destroy: function () {
        // We must manually destroy the renderer.
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        girder.View.prototype.destroy.call(this);
    },

    _instantiateObject: function () {
        var info = this.item.get('meta').XTK;
        var type = (info.type || 'mesh').toLowerCase();

        if (type === 'mesh') {
            var mesh = new X.mesh();
            var file = this.files.models[0];
            var customProps = {
                color: this._colorRangeUp(mesh.color)
            };
            mesh.file = file.downloadUrl() + '/' + file.name();
            mesh.opacity = Number(info.opacity) || 1.0;

            this._initGui();
            var meshGui = this.gui.addFolder('Mesh display');
            meshGui.add(mesh, 'opacity', 0, 1).name('Opacity');

            meshGui.addColor(customProps, 'color').name('Color').onChange(_.bind(function (val) {
                mesh.color = this._colorRangeDown(val);
            }, this));
            meshGui.open();
            this.$('.hue-field').width(10); //hack to fix dat.gui colors in chrome

            return mesh;
        } else if (type === 'volume') {
            var volume = new X.volume();
            volume.file = _.map(this.files.models, function (file) {
                return file.downloadUrl() + '/' + file.name();
            });

            this.renderer.onShowtime = _.bind(function () {
                volume.minColor = info.minColor || [0.0, 0.0, 0.0];
                volume.maxColor = info.maxColor || [1.0, 1.0, 1.0];

                if (_.has(info, 'opacity')) {
                    volume.opacity = info.opacity;
                }
                if (_.has(info, 'window')) {
                    volume.windowLower = info.window[0];
                    volume.windowHigh = info.window[1];
                }

                volume.lowerThreshold = info.lowerThreshold || 0;

                if (info.volumeRender) {
                    volume.volumeRendering = true;
                }

                this._initGui();
                var volumeGui = this.gui.addFolder('Volume display');
                var customProps = {
                    minColor: this._colorRangeUp(volume.minColor),
                    maxColor: this._colorRangeUp(volume.maxColor)
                };

                volumeGui.add(volume, 'volumeRendering').name('Volume rendering');
                volumeGui.add(volume, 'opacity', 0, 1).name('Opacity');
                volumeGui.add(volume, 'lowerThreshold', volume.min, volume.max).name('Threshold min');
                volumeGui.add(volume, 'upperThreshold', volume.min, volume.max).name('Threshold max');
                volumeGui.add(volume, 'windowLow', volume.min, volume.max).name('Window min');
                volumeGui.add(volume, 'windowHigh', volume.min, volume.max).name('Window max');
                volumeGui.add(volume, 'indexX', 0, volume.range[0] - 1).name('X slice');
                volumeGui.add(volume, 'indexY', 0, volume.range[1] - 1).name('Y slice');
                volumeGui.add(volume, 'indexZ', 0, volume.range[2] - 1).name('Z slice');

                // Dat.gui does not have built-in support for [0, 1] color ranges
                volumeGui.addColor(customProps, 'minColor').name('Color min').onChange(_.bind(function (val) {
                    volume.minColor = this._colorRangeDown(val);
                }, this));
                volumeGui.addColor(customProps, 'maxColor').name('Color max').onChange(_.bind(function (val) {
                    volume.maxColor = this._colorRangeDown(val);
                }, this));

                volumeGui.open();
                this.$('.hue-field').width(10); //hack to fix dat.gui colors in chrome

            }, this);
            return volume;
        } else {
            girder.events.trigger('g:alert', {
                text: 'Unsupported XTK type: ' + type,
                type: 'danger',
                icon: 'cancel'
            });
        }
    },

    // [0, 1] -> [0, 255]
    _colorRangeUp: function (color) {
        return _.map(color, function (v) {
            return v * 255;
        });
    },

    // [0, 255] -> [0, 1]
    _colorRangeDown: function (color) {
        return _.map(color, function (v) {
            return v / 255;
        });
    },

    _initGui: function () {
        this.gui = new dat.GUI({autoPlace: false});
        this.$('.g-gui-container').append(this.gui.domElement);
        this.generalGui = this.gui.addFolder('General');
        this.generalGui.addColor(this, 'bgColor').name('Background color').onChange(_.bind(function (value) {
            this.$('.g-render-target').css('backgroundColor', value);
        }, this));
    }
});
