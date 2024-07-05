const path = require("path");
const { default: merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
    entry: {
        dev: {
            import: "./dev/ts/main.ts",
            filename: "dev.js"
        },
        devStyle: "./dev/less/main.less"
    },
    module: {
        rules: [
            {
                test: /\.ejs$/i,
                use: [{
                    loader: 'html-loader',
                    options: {
                        sources: false
                    }
                }, 'template-ejs-loader']
            },
            {
                test: /\.less$/,
                use: ["style-loader", "css-loader", "less-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "dev", "pages", "index.ejs"),
            chunks: ["style", "main", "devStyle", "dev"],
            inject: true
        })
    ],
    devtool: 'inline-source-map',
    devServer: {
        static: "./dist",
        port: 3000
    }
});