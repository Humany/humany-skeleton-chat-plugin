const path = require('path');

module.exports = {
  entry: {
    "index": __dirname + '/src/main.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
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
              ['@babel/preset-env', { 'modules': false }],
            ],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@humany/widget-core': path.resolve('./.yalc/@humany/widget-core'),
      '@humany/widget-ui': path.resolve('./.yalc/@humany/widget-ui'),
      '@humany/widget-chat': path.resolve('./.yalc/@humany/widget-chat'),
      '@humany/widget-plugins': path.resolve('./.yalc/@humany/widget-plugins'),
      '@webprovisions/platform': path.resolve('./.yalc/@webprovisions/platform')
    }
  },
  mode: 'development'
}
