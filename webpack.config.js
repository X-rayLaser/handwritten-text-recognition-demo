const path = require('path');
const webpack = require("webpack");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './'),
  },

  mode: 'development',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }, {
        test: /\.css$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader'
        }]
      },
      {
        test: /workers.*\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
};