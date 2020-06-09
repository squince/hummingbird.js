const path = require('path');

module.exports = {
  entry: './src/hummingbird.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: __dirname,
    compress: false,
    port: 8100
  }
};
