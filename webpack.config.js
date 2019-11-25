const path = require('path');

module.exports = {
  entry: './src/viewer.ts',
  output: {
    filename: 'viewer.js',
    path: path.resolve(__dirname, 'build'),
    library: 'pv',
    libraryTarget: "umd"
  },
  mode: 'development',
  devtool: "source-map",
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/},
      {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]},
      // {test: /\.worker\.js$/, use: ["worker-loader"]}
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, ''),
    port: 9000,
    filename: 'editor.js'
  },
  watchOptions: {
    ignored: ['node_modules']
  }
};
