const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (function () {
  const config = {};

  config.mode = 'development'

  config.entry = [__dirname + '/src/polyfills.js', __dirname + '/src/index.js'];

  config.output = {
    filename: 'humany.js',
    chunkFilename: 'humany-[name].js',
    path: __dirname + '/dist',
  };

  config.plugins = [
    new HtmlWebpackPlugin({
      template: __dirname + '/public/index.html',
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ];

  config.module = {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: [
              'babel-plugin-syntax-dynamic-import',
              'babel-plugin-transform-class-properties',
              'babel-plugin-transform-async-to-generator',
            ],
          },
        },
      },
    ],
  };

  return config;
})();
