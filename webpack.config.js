const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = env => {
  return {
    entry: './src/viewer.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'pv',
      libraryTarget: 'umd'
    },
    mode: 'development',
    devtool: "source-map",
    node: {
      fs: 'empty',
      module: 'empty'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    module: {
      rules: [
        {test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/},
        {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]}
      ]
    },
    devServer: {
      contentBase: path.resolve(__dirname, ''),
    },
    watchOptions: {
      ignored: ['node_modules']
    },
    plugins: [
      new CleanWebpackPlugin()
    ]
  };
};
