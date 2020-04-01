'use strict';
const path = require('path');
const utils = require('./utils');
const config = require('../config');

function resolve (dir) {
  return path.join(__dirname, '..', dir);
}

const createLintingRule = () => ({
  test: /\.(js)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  exclude: [resolve('src/assets/lib')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
});
let entries = utils.getEntry('./src/view/**/*.js', true);
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: entries,
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production_testing'
                ? config.build.assetsPublicPath
                : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.json', '.scss'],
    alias: {
      'src': resolve('src'),
      'assets': resolve('src/assets'),
      'api': resolve('src/api'),
      'easyui': resolve('src/assets/lib/jquery-easyui/index'),
      'jquery-easyui': resolve('src/assets/lib/jquery-easyui/jquery.easyui.min'),
      '1i8n': resolve('src/assets/lib/jquery-i18n/jquery.i18n.properties')
    }
  },
  externals: {},
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.pug$/,
        use:  ['html-loader','pug-html-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: Object.keys(entries).map(e=>resolve(entries[e])),
        use: [
          {
            loader: 'imports-loader',
            options: {
              $: 'jquery',
              jquery: 'jquery',
              jQuery: 'jquery',
            }
          }
        ]
      },
      {
        test: /jquery-.*\.js$/,
        include: [resolve('src/assets/lib')],
        use: [
          {
            loader: 'imports-loader',
            options: {
              $: 'jquery',
              jquery: 'jquery',
              jQuery: 'jquery',
            }
          }
        ]
      }
    ]
  }
};
