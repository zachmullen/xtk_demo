import events from 'girder/events';
import { wrap } from 'girder/utilities/PluginUtils';
import ItemView from 'girder/views/body/ItemView';
import XtkView from './XtkView';

let _xtkLoaded = false;
/**
 * Ensures that the XTK javascript is loaded into the page context. When done,
 * triggers "g:xtkLoaded" event. This is a lazy loader -- after the javascript
 * has been loaded once, this will be a no-op but will still trigger the event.
 */
const ensureXtkLoaded = function () {
    if (_xtkLoaded) {
        events.trigger('g:xtkLoaded', X);
    } else {
        $.getScript('//get.goXTK.com/xtk_edge.js', function () {
            _xtkLoaded = true;
            events.trigger('g:xtkLoaded', X);
        });
    }
};


wrap(ItemView, 'initialize', function (initialize, settings) {
    initialize.call(this, settings);
    this.on('g:rendered', function () {
        var meta = this.model.get('meta') || {};

        if (_.has(meta, 'XTK')) {
            var el = $('<div>', {
                class: 'g-xtk-demo-container'
            }).prependTo(this.$('.g-item-info'));

            events.once('g:xtkLoaded', function () {
                new XtkView({
                    parentView: this,
                    item: this.model,
                    files: this.fileListWidget.collection,
                    el: el
                }).render();
            }, this);
            ensureXtkLoaded();
        }
    }, this);
});



