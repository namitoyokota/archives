const path = require("path");
const fs = require("fs");
// const CopyWebpackPlugin = require("copy-webpack-plugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const terserConfig = require('./terser.config');
// const SampleSupport = require("./SampleSupport");

const sourceDir = path.resolve(__dirname);

module.exports = function(config, options, targetOptions) {
  const realPath = (modulePath) => {
    const fullPath = path.join(sourceDir, modulePath);
    return fs.existsSync(fullPath) && fs.realpathSync(fullPath);
  };

  // make sure the _real_ filepath (disregarding symlinks) is used in webpack config includes / excludes.
  // webpack uses the _real_ filepath for its modules (it follows symlinks and then uses the final path)

  const realRiaDir = realPath('node_modules/@luciad/ria');
  const realPhotonDir = realPath('node_modules/@luciad/ria/gen/photon/photon_painter.js'); // not necessary in a release, but photon has different realpath in development

  // RIA modules are already minified and optimized, so little need to optimize them again.
  // Especially Photon (photon_painter.js) takes a long time be processed by TerserPlugin.
  // Put all RIA modules in a separate chunk and exclude that chunk from TerserPlugin.
  // This makes production webpack builds a lot faster (10-20 sec for a sample, instead of 2 minutes+)
  const isRIAModule = (module) => {
    if (!module || !module.resource) {
      return false;
    }
    const filename = module.resource;
    const isInRia = realRiaDir && filename.indexOf(realRiaDir) >= 0;
    const isPhoton = realPhotonDir && filename.indexOf(realPhotonDir) >= 0;
    return isInRia || isPhoton;
  };
  config.optimization = {
        minimizer: [new TerserPlugin({
        parallel: true,
        terserOptions: terserConfig,
        exclude: [/ria-modules/]
        })],
        splitChunks: {
            cacheGroups: {
                "ria-modules": {
                    test: isRIAModule,
                    name: 'ria-modules',
                    enforce: true,
                    chunks: 'all'
                }
            }
        }
    }; 

    return(config);
}
