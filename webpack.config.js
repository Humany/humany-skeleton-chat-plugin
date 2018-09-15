const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: [
    __dirname + '/src/polyfills.js',
    __dirname + '/src/index.js',
  ],
  output: {
    filename: 'skeleton-chat-plugin.js',
    path: __dirname + '/dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/public/index.html',
    }),
  ],
  resolve: {
    alias: {
      '@humany/widget-chat': path.resolve(__dirname, './.yalc/@humany/widget-chat'),
      '@humany/widget-adapters': path.resolve(__dirname, './.yalc/@humany/widget-adapters'),
      '@humany/widget-forms': path.resolve(__dirname, './.yalc/@humany/widget-forms'),
      '@humany/widget-data': path.resolve(__dirname, './.yalc/@humany/widget-data'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }]
            ]
          }
        }
      }
    ]
  },
}
