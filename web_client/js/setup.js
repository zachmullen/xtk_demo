girder.wrap(girder.views.ItemView, 'initialize', function (initialize, settings) {
    initialize.call(this, settings);
    this.on('g:rendered', function () {
        var meta = this.model.get('meta') || {};

        if (_.has(meta, 'XTK')) {
            var el = $('<div>', {
                class: 'g-xtk-demo-container'
            }).prependTo(this.$('.g-item-info'));

            girder.events.once('g:xtkLoaded', function () {
                new girder.views.xtk_demo_XtkView({
                    parentView: this,
                    item: this.model,
                    files: this.fileListWidget.collection,
                    el: el
                }).render();
            }, this);
            girder.ensureXtkLoaded();
        }
    }, this);
});

girder._xtkLoaded = false;

/**
 * Ensures that the XTK javascript is loaded into the page context. When done,
 * triggers "g:xtkLoaded" event. This is a lazy loader -- after the javascript
 * has been loaded once, this will be a no-op but will still trigger the event.
 */
girder.ensureXtkLoaded = function () {
    if (girder._xtkLoaded) {
        girder.events.trigger('g:xtkLoaded', X);
    } else {
        $.getScript('//get.goXTK.com/xtk_edge.js', function () {
            girder._xtkLoaded = true;
            girder.events.trigger('g:xtkLoaded', X);
        });
    }
};
