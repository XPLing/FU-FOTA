'use strict';
const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const env = process.env.NODE_ENV === 'production_testing'
  ? require('../config/prod.test.env')
  : require('../config/prod.env');
const isPro = process.env.NODE_ENV === 'production';
var entrise = [];
// Object.keys(baseWebpackConfig.entry).forEach(function (name) {
//   if (name.indexOf('lib/vendor') < 0 && name.indexOf('lib/vendorStyle') < 0 && name.indexOf('vendor') < 0) {
//     entrise.push(name); //过滤后报错，js排列顺序出错
//   }
// });
const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js')
    // chunkFilename: utils.assetsPath('js/[id].[chunkhash].js') // chunkFilename 影响到filename 设置chunkFilename后会覆盖掉filename，直接用chunkFilename形式命名
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          compress: {
            drop_debugger: true,
            drop_console: isPro
          },
          sourceMap: config.build.productionSourceMap,
          parallel: true
        }
      }),
      new OptimizeCSSPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: config.build.productionSourceMap
          ? { safe: true, map: { inline: false } }
          : { safe: true }
      })
    ],
    splitChunks: {
      name: true,
      chunks: 'all',
      minSize: 0,
      minChunks: 2,
      cacheGroups: {
        vendors: {
          chunks: 'all',
          name: 'vendors',
          enforce: true,
          test: /[\\/]node_modules[\\/]|assets[\\/]lib/,
          priority: -10
        },
        default: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': require('../config/prod.env')
    }),

    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: false
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    // new OptimizeCSSPlugin({
    //   cssProcessorOptions: config.build.productionSourceMap
    //     ? {safe: true, map: {inline: false}}
    //     : {safe: true}
    // }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   filename: process.env.NODE_ENV === 'testing'
    //     ? 'index.html'
    //     : config.build.index,
    //   template: 'index.html',
    //   inject: true,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true
    //     // more options:
    //     // https://github.com/kangax/html-minifier#options-quick-reference
    //   },
    //   // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //   chunksSortMode: 'dependency'
    // }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    // new webpack.optimize.ModuleConcatenationPlugin(),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ].concat(utils.htmlPlugins())
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
