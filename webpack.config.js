const path = require('path')
const webpack = require('webpack')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (env) => {
    const isProd = undefined !== env && env.mode.startsWith('prod')

    const fileName = isProd ? 'assets/[title].[hash].js' : 'assets/[title].js'

    const backend = isProd ? '..' : 'http://127.0.0.1:8000'

    const config = {
        mode: isProd ? 'production' : 'development',
        entry: {
            bundle: './src/index.tsx'
        },
        output: {
            filename: fileName,
            publicPath: '',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
        },
        module: {
            rules: [
                {
                    test: /\.(tsx|ts)$/,
                    exclude: /node_modules/,
                    use: [ { loader: 'ts-loader' } ]
                },
                {
                    test: /\.jsx?$/,         // Match both .js and .jsx files
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [ '@babel/preset-env', '@babel/preset-react' ]
                        }
                    }
                },
                {
                    test: /\.css$/i,
                    use: [ 'style-loader', 'css-loader' ],
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                }
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new HtmlWebpackPlugin({
                template: 'public/index.html'
            }),
            new CopyPlugin([
                { from: 'public/assets', to: 'assets' },
            ]),
        ],
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            writeToDisk: false,
            hot: true,
            overlay: true,
            historyApiFallback: true,
            // host: '127.0.0.1',
            host: '0.0.0.0',
            port: 9988
        },
        devtool: 'source-map',
    }

    if (isProd) {
        config.externals = {
            'react': 'React',
            'react-dom': 'ReactDOM',
        }
    }

    return config
}