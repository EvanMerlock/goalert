/* eslint @typescript-eslint/no-var-requires: 0 */
// Folder ops
const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

// Constants
const APP = path.join(__dirname, 'app')
const BUILD = path.join(__dirname, 'build')
const PORT = process.env.PORT || 3032

module.exports = (env = { GOALERT_VERSION: 'dev' }) => ({
  mode: 'development',
  // Paths and extensions
  entry: {
    app: APP,
  },
  output: {
    path: BUILD,
    filename: 'static/[name].js',
    hotUpdateChunkFilename: 'build/hot-update.js',
    hotUpdateMainFilename: 'build/hot-update.json',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  // Loaders for processing different file types
  module: {
    rules: [
      {
        test: /modernizr.config.js$/,
        use: ['modernizr-loader'],
      },
      {
        test: /\.(t|j)sx?$/,
        use: [
          'react-hot-loader/webpack',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          { loader: 'ifdef-loader', options: { HMR: true } },
        ],
        exclude: [/node_modules/],
        include: [APP],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
      {
        test: /\.(gif|png|jpe?g|svg|ico|webp)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/[hash].[ext]',
            },
          },
        ],
      },
    ],
  },

  // Source maps used for debugging information
  devtool: 'inline-source-map',
  // webpack-dev-server configuration
  devServer: {
    disableHostCheck: true,
    hot: true,

    stats: 'errors-only',

    // host: HOST,
    port: PORT,

    writeToDisk: true,
  },

  // Webpack plugins
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'), // eslint-disable-line quote-props
        GOALERT_VERSION: JSON.stringify(env.GOALERT_VERSION), // eslint-disable-line quote-props
      },
    }),
    new webpack.DllReferencePlugin({
      manifest: path.join(__dirname, 'build/vendorPackages.json'), // generated by webpack.dll.config.js
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin(
      [16, 32, 64, 192].map((size) => ({
        from: path.resolve(APP, `./public/favicon-${size}.png`),
        to: path.resolve(BUILD, `./static/favicon-${size}.png`),
      })),
    ),
  ],
})
