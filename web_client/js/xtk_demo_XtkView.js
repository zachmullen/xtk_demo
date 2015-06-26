girder.views.xtk_demo_XtkView = girder.View.extend({
    initialize: function (settings) {
        this.files = settings.files;
        this.item = settings.item;
    },

    render: function () {
        this.renderer = new X.renderer3D();
        this.renderer.container = this.$el[0];
        this.renderer.init();

        var obj = this._instantiateObject();

        if (obj) {
            this.renderer.add(obj);
            this.renderer.camera.position = [0, 400, 0];
            this.renderer.render();
        }
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
                volume.volumeRendering = true;
                //volume.lowerThreshold = 80;
                //volume.windowLower = 115;
                //volume.windowHigh = 360;
                //volume.minColor = [0, 0.06666666666666667, 1];
                //volume.maxColor = [0.5843137254901961, 1, 0];
                //volume.opacity = 0.2;
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
