const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
  const prdPlugins = env.production ? [new CleanWebpackPlugin()] : [];
  return {
    entry: './src/viewer.ts',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'PDFViewer',
        type: 'umd',
        export: 'default',
      },
    },
    mode: 'development',
    devtool: 'source-map',
    node: {},
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: ['ts-loader'], exclude: /node_modules/ },
        { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      ],
    },
    devServer: {
      contentBase: path.resolve(__dirname, ''),
      port: 3000,
      injectClient: false,
    },
    watchOptions: {
      ignored: ['node_modules'],
    },
    plugins: [...prdPlugins],
  };
};
