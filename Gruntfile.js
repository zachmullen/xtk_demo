/**
 * Copyright 2014 Kitware Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt) {
    var target = 'clients/web/static/built/plugins/xtk_demo/plugin.min.js';
    var jsFiles = grunt.config.get('uglify.plugin_xtk_demo.files');

    jsFiles[target] = [
        'plugins/xtk_demo/commonjs-shim.js',
        'plugins/xtk_demo/node_modules/dat-gui/vendor/dat.gui.js'
    ].concat(jsFiles[target]);
    grunt.config.set('uglify.plugin_xtk_demo.files', jsFiles);
};
