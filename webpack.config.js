const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: '/'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"]
    },
    //target: "es5",
    module: {
        rules: [
            {
                test: /\.tsx$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.webpack.json"
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].css"
                        }
                    },
                    "sass-loader"
                ]
            }
        ]
    },
    devtool: "source-map",
    devServer: {
        historyApiFallback: true,
        contentBase: path.join(__dirname, 'dist'),
        proxy: {
            '/getDiagram': 'http://localhost:3000',
            '/getNodes': 'http://localhost:3000',
            '/setNodes': 'http://localhost:3000',
            '/setDiagram': 'http://localhost:3000',
            '/updateDiagram': 'http://localhost:3000',
            '/deleteDiagram': 'http://localhost:3000',
            '/updateTags': 'http://localhost:3000',
            '/login': 'http://localhost:3000',
            '/signup': 'http://localhost:3000'
        }
    },
    plugins: [
        new HTMLWebpackPlugin({
            inject: 'body',
            template: 'index.html',
            filename: 'index.html'
        })
    ]
}