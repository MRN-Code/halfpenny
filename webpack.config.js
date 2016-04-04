const webpack = require('webpack');
module.exports = {
  entry: [
    './src/index.js',
  ],
  output: {
    filename: 'dist/halfpenny.global.browser.min.js',
    library: 'halfpenny',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel', query: { presets: ['es2015'], compact: false } },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ sourceMap: false }),
  ]
};
