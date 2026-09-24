const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
  new HtmlWebpackPlugin({ template: './public/index.html' }),
  ...(isProd
    ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })]
    : []),
],
   devServer: {
  static: {
    directory: path.join(__dirname, 'public'),
  },
  port: 8090,
  hot: true,
  open: true,
  historyApiFallback: true,
},
    devtool: isProd ? false : 'source-map',
  };
};