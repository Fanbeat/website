const fs = require('fs');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const mediaQueryPacker = require('css-mqpacker');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const browsers = require('./browsers.json');

const isProduction = 'production' === process.env.NODE_ENV;

const cssFileExtension = isProduction ? '.min.css' : '.css';
const jsFileExtension = isProduction ? '.min.js' : '.js';

const extractCSS = new ExtractTextPlugin('css/[name]' + cssFileExtension);

const config = {
    entry: {
        'style': [
          './scss/style.scss'
        ],
    },
    output: {
        path: __dirname,
        filename: 'css/[name]' + jsFileExtension
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: extractCSS.extract(['css?-url', 'postcss'])
            },
            {
                test: /\.(scss|sass)$/,
                loader: extractCSS.extract(['css?sourceMap&-url', 'postcss', 'sass?sourceMap'])
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf)$/,
                loader: 'file'
            }
        ]
    },
    postcss: [
        autoprefixer({browsers: browsers}),
        mediaQueryPacker()
    ],
    plugins: [
        extractCSS,
        function () {
            this.plugin('run', function (watching, callback) {
                console.log('Begin compile at ' + new Date());
                callback();
            });
            this.plugin('watch-run', function (watching, callback) {
                console.log('Begin compile at ' + new Date());
                callback();
            });
            this.plugin('done', function () {
                // Remove unused JS files for the following builds
                [
                    'style',
                ].forEach(function (site) {
                    let rootPath = __dirname + '/css/' + site;
                    ['.js', '.js.map', '.min.js', '.min.js.map'].forEach(function (ext) {
                        if (fs.existsSync(rootPath + ext)) {
                            fs.unlink(rootPath + ext);
                        }
                    });
                });
            });
        }
    ],
    devtool: 'source-map'
};

if ('1' === process.env.SERVE) {
    config.plugins.push(
        new BrowserSyncPlugin({
            proxy: 'fanbeat-site.local',
            tunnel: 'test',
            minify: false,
            reloadDebounce: 2000,
        })
    );
}

module.exports = config;
