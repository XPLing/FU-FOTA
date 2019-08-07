// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {},
    "postcss-sprites": {
      spritePath: 'dist/static/img/sprites',
      retina: true,
      filterBy: (image) => {
        if (/sprites.png$/.test(image.url)) {
          return Promise.resolve();
        }
        return Promise.reject();
      }
    }
  }
}
