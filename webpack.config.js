const path = require('path');

module.exports = {
  entry: './src/hummingbird.js',
  output: {
    filename: 'hummingbird.js',
    path: path.resolve(__dirname),
  },
  devServer: {
    contentBase: __dirname,
    compress: false,
    port: 8100
  }
};
