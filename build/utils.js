'use strict';
const path = require('path');
const config = require('../config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const packageConfig = require('../package.json');
const glob = require('glob');
const merge = require('webpack-merge');

function getEntryWithFold (globPath) {
  var entries = {},
    basename;
  glob.sync(globPath).forEach(function (entry) {

    basename = path.basename(entry, path.extname(entry));
    entries[basename] = entry;
  });
  return entries;
}

function getEntry (globPath, noFolder) {
  var entries = {},
    filesname, filesPath, entryName;
  glob.sync(globPath).forEach(function (entry) {
    let ext = path.extname(entry);
    filesname = path.basename(entry, path.extname(entry));
    if (noFolder) {
      // filesPath = path.dirname(entry).replace('./src/view/', '');
      entryName = filesname;
    } else {
      filesPath = path.dirname(entry).replace('./src/', '');
      entryName = filesPath + '/' + filesname;
    }
    entries[entryName] = entry;
  });
  return entries;
}

// 获取所有入口文件(不带目录结构)
exports.getEntryWithFold = getEntryWithFold;
// 获取所有入口文件(带目录结构)
exports.getEntry = getEntry;

exports.htmlPlugins = function () {
  var pages = getEntry('./src/view/**/*.pug');
  var arr = [];
  for (var pathname in pages) {
    // 配置生成的html文件，定义路径等
    let chunks = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production_testing' ? ['runtime', 'vendors', 'common', pathname.replace(/^(view\/).*\/(.*)/, '$2')] : [pathname.replace(/^(view\/).*\/(.*)/, '$2')];
    var filename = pathname.replace(/^(view\/).*\/(.*)/, '$2');
    var conf = {
      filename: filename + '.html',
      template: pages[pathname], // 模板路径
      inject: true, // js插入位置
      chunks: chunks,
      // chunksSortMode: 'manual', //手动
      data: {
        processEnv: process.env.NODE_ENV
      },
      minify: {
        removeComments: true
      }
    };
    if (/index.pug/.test(pages[pathname])) {
      conf.filename = 'index.html';
    }
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production_testing') {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: process.env.NODE_ENV === 'production',
          removeAttributeQuotes: false // 移除属性的引号
        }
      });
    }
    arr.push(new HtmlWebpackPlugin(conf));
  }
  return arr;
};

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production_testing'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory;

  return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = function (options) {
  options = options || {};

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap,
      plugins: [
        require('postcss-sprites')({
          spritePath: 'dist/static/img/sprites',
          retina: true,
          filterBy: function (image) {
            const filter = ['jquery-easyui'];
            const dirname = path.posix.resolve(image.path);
            const res = filter.filter(val => {
              return dirname.indexOf(val) !== -1
            });
            if (res.length>0) {
              return Promise.reject();
            }
            return Promise.resolve();
          }
        })
      ]
    }
  };
  const stleResourceLoader = {
    loader: 'style-resources-loader',
    options: {
      patterns: [
        path.join(__dirname, '../', 'src/assets/style/compile.scss'),
      ]
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader];

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      }, stleResourceLoader);
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      let extractLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      };
      return [extractLoader].concat(loaders);
      // return ExtractTextPlugin.extract({
      //   use: loaders,
      //   fallback: 'style-loader'
      // });
    } else {
      return ['style-loader'].concat(loaders);
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = [];
  const loaders = exports.cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    });
  }
  return output;
};

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier');

  return (severity, errors) => {
    if (severity !== 'error') return;

    const error = errors[0];
    const filename = error.file && error.file.split('!').pop();

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    });
  };
};
