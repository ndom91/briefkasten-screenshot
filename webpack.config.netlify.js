const nodeExternals = require('webpack-node-externals')
const dotenv = require('dotenv-safe')
const webpack = require('webpack')

const env = process.env.NODE_ENV || 'production'
const dev = env === 'development'

if (dev) {
  dotenv.config({ allowEmptyValues: true })
}

module.exports = {
  mode: env,
  devtool: dev ? 'eval-source-map' : 'none',
  externals: [nodeExternals()],
  devServer: {
    proxy: {
      '/.netlify': {
        target: 'http://localhost:9000',
        pathRewrite: { '^/.netlify/functions': '' },
      },
    },
  },
  module: {
    rules: [],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_ROOT_PATH': JSON.stringify('/'),
      'process.env.NETLIFY_ENV': true,
      'process.env.CONTEXT': env,
    }),
  ],
}
