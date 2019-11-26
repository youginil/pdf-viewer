const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  return {
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
        {test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"]}
      ]
    },
    devServer: {
      contentBase: path.resolve(__dirname, ''),
      port: 9000,
      disableHostCheck: true,
      filename: 'viewer.js',
      // host: '10.10.24.248'
    },
    watchOptions: {
      ignored: ['node_modules']
    },
    plugins: [
      new webpack.DefinePlugin({
        IS_DEV: JSON.stringify(env.production === 'false')
      })
    ]
  };
};
