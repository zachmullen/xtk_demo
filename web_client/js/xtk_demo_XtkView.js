girder.views.xtk_demo_XtkView = girder.View.extend({
    initialize: function (settings) {
        this.files = settings.files;
        this.item = settings.item;
    },

    render: function () {
        this.renderer = new X.renderer3D();
        //this.renderer = new X.renderer2D();
        //this.renderer.orientation = 'x';
        this.renderer.container = this.$el[0];
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
            mesh.file = file.downloadUrl() + '/' + file.name();
            mesh.opacity = Number(info.opacity) || 1.0;
            return mesh;
        } else if (type === 'dicom') {
            var volume = new X.volume();
            volume.file = _.map(this.files.models, function (file) {
                return file.downloadUrl() + '/' + file.name();
            });

            this.renderer.onShowtime = function () {
                volume.minColor = info.minColor || [0, 0, 0];
                volume.maxColor = info.maxColor || [1, 1, 1];

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
            };
            return volume;
        } else {
            girder.events.trigger('g:alert', {
                text: 'Unsupported XTK type: ' + type,
                type: 'danger',
                icon: 'cancel'
            });
        }
    }
});
