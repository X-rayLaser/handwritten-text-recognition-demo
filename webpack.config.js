const path = require('path');
const webpack = require("webpack");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },

  mode: 'development',

  module: {
    defaultRules: [
      {
        type: "javascript/auto",
        resolve: {}
      }
    ],
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
      }, {
        test: /token_passing\.js$/,
        loader: "exports-loader"
      }, {
        test: /token_passing\.wasm$/,
        loader: "file-loader",
        options: {
          publicPath: "public/"
        }
      }, {
        test: /token_passing\.data$/,
        loader: "file-loader",
        options: {
          publicPath: "public/"
        }
      }
    ]
  }
};