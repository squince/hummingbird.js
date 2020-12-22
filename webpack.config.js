const path = require('path');

module.exports = {
  entry: './wip/hummingbird.js',
  output: {
    filename: 'hummingbird-wip.js',
    path: path.resolve(__dirname),
  },
  devServer: {
    contentBase: __dirname,
    compress: false,
    port: 8100
  }
};
