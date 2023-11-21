const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin, ModuleDependenciesPlugin } = require('aurelia-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
    condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const title = 'Venminder';
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const cssRules = [
    {
        loader: 'css-loader', options: { esModule: false }
    }
];

const sassRules = [
    {
        loader: "sass-loader",
        options: {
            // Prefer `dart-sass`
            implementation: require.resolve("sass"),
        },
    }
];

function getEnvironment(envSetting, production) {
    console.log("env = " + envSetting + "; production = " + production);

    let environment = 'development';
    let envExists = (envSetting != null && envSetting != "");

    if (envExists && envSetting == 'prod') {
        environment = 'production';
    }
    else if (envExists && envSetting != 'dev') {
        environment = envSetting;
    }
    else if (!envExists && production) {
        environment = 'production';
    }

    console.log("Using Environment: " + environment);
    return environment;
}


module.exports = ({ platform, production, server, extractCss, coverage, analyze, watch, isReleaseBuild, envSetting, hmr, port, host }) => ({
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [srcDir, 'node_modules'],

        alias: {
            // https://github.com/aurelia/dialog/issues/387
            // Uncomment next line if you had trouble to run aurelia-dialog on IE11
            // 'aurelia-dialog': path.resolve(__dirname, 'node_modules/aurelia-dialog/dist/umd/aurelia-dialog.js'),

            // https://github.com/aurelia/binding/issues/702
            // Enforce single aurelia-binding, to avoid v1/v2 duplication due to
            // out-of-date dependencies on 3rd party aurelia plugins
            'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding'),
            //'bootstrap-select': path.join(srcDir, 'shared-from-dcdev/', 'lib/bootstrap-select'),
            //'aurelia-bootstrap-select': path.join(srcDir, 'shared-from-dcdev/', 'lib/aurelia-bootstrap-select')

            // Forces tslib version 2.4.1 to RxJs 6.6.7
            'tslib': path.resolve(__dirname, 'node_modules/tslib'),
        }
    },
    entry: {
        app: [
            // Uncomment next line if you need to support IE11
            // 'promise-polyfill/src/polyfill',
            'aurelia-bootstrapper'
        ]
    },
    mode: production ? 'production' : 'development',
    output: {
        path: outDir,
        publicPath: baseUrl,
        filename: production ? '[name].[chunkhash].bundle.js' : '[name].[fullhash].bundle.js',
        chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[fullhash].chunk.js'
    },
    optimization: {
        runtimeChunk: true,  // separates the runtime chunk, required for long term cacheability
        // moduleIds is the replacement for HashedModuleIdsPlugin and NamedModulesPlugin deprecated in https://github.com/webpack/webpack/releases/tag/v4.16.0
        // changes module id's to use hashes be based on the relative path of the module, required for long term cacheability
        moduleIds: 'deterministic',
        // Use splitChunks to breakdown the App/Aurelia bundle down into smaller chunks
        // https://webpack.js.org/plugins/split-chunks-plugin/
        splitChunks: {
            hidePathInfo: true, // prevents the path from being used in the filename when using maxSize
            chunks: "initial",
            // sizes are compared against source before minification

            // This is the HTTP/1.1 optimized maxSize.
            maxSize: 200000, // splits chunks if bigger than 200k, adjust as required (maxSize added in webpack v4.15)
            /* This is the HTTP/2 optimized options.
            maxInitialRequests: Infinity, // Default is 3, make this unlimited if using HTTP/2
            maxAsyncRequests: Infinity, // Default is 5, make this unlimited if using HTTP/2
            minSize: 10000, // chunk is only created if it would be bigger than minSize, adjust as required
            maxSize: 40000, // splits chunks if bigger than 40k, adjust as required (maxSize added in webpack v4.15)
            */

            cacheGroups: {
                default: false, // Disable the built-in groups default & vendors (vendors is redefined below)
                // You can insert additional cacheGroup entries here if you want to split out specific modules
                // This is required in order to split out vendor css from the app css
                // For example to separate font-awesome and bootstrap:
                // fontawesome: { // separates font-awesome css from the app css (font-awesome is only css/fonts)
                //   name: 'vendor.font-awesome',
                //   test:  /[\\/]node_modules[\\/]font-awesome[\\/]/,
                //   priority: 100,
                //   enforce: true
                // },
                // bootstrap: { // separates bootstrap js from vendors and also bootstrap css from app css
                //   name: 'vendor.bootstrap',
                //   test:  /[\\/]node_modules[\\/]bootstrap[\\/]/,
                //   priority: 90,
                //   enforce: true
                // },

                // This is the HTTP/1.1 optimized cacheGroup configuration.
                vendors: { // picks up everything from node_modules as long as the sum of node modules is larger than minSize
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: 19,
                    enforce: true, // causes maxInitialRequests to be ignored, minSize still respected if specified in cacheGroup
                    minSize: 30000 // use the default minSize
                },
                vendorsAsync: { // vendors async chunk, remaining asynchronously used node modules as single chunk file
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors.async',
                    chunks: 'async',
                    priority: 9,
                    reuseExistingChunk: true,
                    minSize: 10000  // use smaller minSize to avoid too much potential bundle bloat due to module duplication.
                },
                commonsAsync: { // commons async chunk, remaining asynchronously used modules as single chunk file
                    name: 'commons.async',
                    minChunks: 2, // Minimum number of chunks that must share a module before splitting
                    chunks: 'async',
                    priority: 0,
                    reuseExistingChunk: true,
                    minSize: 10000  // use smaller minSize to avoid too much potential bundle bloat due to module duplication.
                }

                /* This is the HTTP/2 optimized cacheGroup configuration.
                // generic 'initial/sync' vendor node module splits: separates out larger modules
                vendorSplit: { // each node module as separate chunk file if module is bigger than minSize
                  test: /[\\/]node_modules[\\/]/,
                  name(module) {
                    // Extract the name of the package from the path segment after node_modules
                    const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                    return `vendor.${packageName.replace('@', '')}`;
                  },
                  priority: 20
                },
                vendors: { // picks up everything else being used from node_modules that is less than minSize
                  test: /[\\/]node_modules[\\/]/,
                  name: "vendors",
                  priority: 19,
                  enforce: true // create chunk regardless of the size of the chunk
                },
                // generic 'async' vendor node module splits: separates out larger modules
                vendorAsyncSplit: { // vendor async chunks, create each asynchronously used node module as separate chunk file if module is bigger than minSize
                  test: /[\\/]node_modules[\\/]/,
                  name(module) {
                    // Extract the name of the package from the path segment after node_modules
                    const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                    return `vendor.async.${packageName.replace('@', '')}`;
                  },
                  chunks: 'async',
                  priority: 10,
                  reuseExistingChunk: true,
                  minSize: 5000 // only create if 5k or larger
                },
                vendorsAsync: { // vendors async chunk, remaining asynchronously used node modules as single chunk file
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendors.async',
                  chunks: 'async',
                  priority: 9,
                  reuseExistingChunk: true,
                  enforce: true // create chunk regardless of the size of the chunk
                },
                // generic 'async' common module splits: separates out larger modules
                commonAsync: { // common async chunks, each asynchronously used module a separate chunk file if module is bigger than minSize
                  name(module) {
                    // Extract the name of the module from last path component. 'src/modulename/' results in 'modulename'
                    const moduleName = module.context.match(/[^\\/]+(?=\/$|$)/)[0];
                    return `common.async.${moduleName.replace('@', '')}`;
                  },
                  minChunks: 2, // Minimum number of chunks that must share a module before splitting
                  chunks: 'async',
                  priority: 1,
                  reuseExistingChunk: true,
                  minSize: 5000 // only create if 5k or larger
                },
                commonsAsync: { // commons async chunk, remaining asynchronously used modules as single chunk file
                  name: 'commons.async',
                  minChunks: 2, // Minimum number of chunks that must share a module before splitting
                  chunks: 'async',
                  priority: 0,
                  reuseExistingChunk: true,
                  enforce: true // create chunk regardless of the size of the chunk
                }
                */
            }
        }
    },
    performance: { hints: false },
    devServer: {
        // serve index.html for all 404 (required for push-state)
        historyApiFallback: true,
        open: project.platform.open,
        hot: hmr || project.platform.hmr,
        port: port || project.platform.port,
        host: host || project.platform.host,
        https: true
    },
    devtool: production ? undefined : 'cheap-module-source-map',
    module: {
        rules: [
            // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
            // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
            {
                test: /\.css$/i,
                issuer: { not: /\.html$/i },
                use: [
                    extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
                    ...cssRules
                ]
            },
            {
                test: /\.css$/i,
                issuer: /\.html$/i,
                // CSS required in templates cannot be extracted safely
                // because Aurelia would try to require it again in runtime
                use: [
                    ...cssRules
                ]
            },
            {
                test: /\.scss$/,
                issuer: /\.[tj]s$/i,
                use: [
                    extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
                    ...cssRules,
                    ...sassRules
                ],
            },
            {
                test: /\.scss$/,
                issuer: /\.html$/i,
                use: [
                    ...cssRules,
                    ...sassRules
                ],
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    esModule: false
                }
            },
            {
                test: /\.ts$/i,
                use: [{
                    loader: 'thread-loader',
                    options: {
                        workers: 3,
                        poolTimeout: watch ? Infinity : 500,
                    }
                }, {
                    loader: 'ts-loader',
                    options: {
                        happyPackMode: true,
                        configFile: 'tsconfig.json',
                        //configFile: getTsConfigFromPlatform(platform),
                    }
                }],
            },
            {
                test: /appsettings\.json$/i, // change this as per your file name
                use: [
                    { loader: "app-settings-loader", options: { env: getEnvironment(envSetting, production) } }
                ]
            },
            // use es6-promise or bluebird as the global Promise implementation:
            //{ test: /[\/\\]node_modules[\/\\]promise-polyfill[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
            // embed small images and fonts as Data Urls and larger ones as files:
            { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192, esModule: false } },
            { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2', esModule: false } },
            { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff', esModule: false } },
            // load these fonts normally, as files:
            { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader', options: { esModule: false } },
            ...when(coverage, {
                test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
                include: srcDir, exclude: [/\.{spec,test}\.[jt]s$/i],
                enforce: 'post', options: { esModules: true }
            })
        ]
    },
    plugins: [
        new DuplicatePackageCheckerPlugin(),
        new AureliaPlugin(),
        new webpack.ProvidePlugin({
            'Promise': ['promise-polyfill', 'default'],//platform === 'ie' ? 'es6-promise' : 'bluebird',
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
        }),
        //new ModuleDependenciesPlugin({
        //    'aurelia-bootstrap-select': [
        //        'aurelia-bootstrap-select/abp-select',
        //        'aurelia-bootstrap-select/abp-select.html'
        //    ]
        //}),
        new HtmlWebpackPlugin({
            template: 'index.ejs',
            metadata: {
                // available in index.ejs //
                title, baseUrl
            },
        }),
        //// ref: https://webpack.js.org/plugins/mini-css-extract-plugin/
        //new MiniCssExtractPlugin({ // updated to match the naming conventions for the js files
        //    filename: production ? '[name].[contenthash].bundle.css' : '[name].[fullhash].bundle.css',
        //    chunkFilename: production ? '[name].[contenthash].chunk.css' : '[name].[fullhash].chunk.css'
        //}),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/favicon.ico', to: 'favicon.ico' }
            ]
        }), // ignore dot (hidden) files
        ...when(extractCss, new MiniCssExtractPlugin()),
        ...when(analyze, new BundleAnalyzerPlugin()),
        /**
         * Note that the usage of following plugin cleans the webpack output directory before build.
         * In case you want to generate any file in the output path as a part of pre-build step, this plugin will likely
         * remove those before the webpack build. In that case consider disabling the plugin, and instead use something like
         * `del` (https://www.npmjs.com/package/del), or `rimraf` (https://www.npmjs.com/package/rimraf).
         */
        new CleanWebpackPlugin()
    ]
});
