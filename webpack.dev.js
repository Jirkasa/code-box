const path = require("path");
const { default: merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

module.exports = merge(commonConfig, {
    entry: {
        dev: {
            import: "./dev/ts/main.ts",
            filename: "dev.js"
        },
        devStyle: "./dev/less/main.less",
        icons: "./dev/icons/index.js"
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
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename: "static/icon-sprite.svg"
                        }
                    },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [
                                {
                                    name: 'removeAttrs',
                                    params: {
                                        attrs: ['*:fill:(none|black)', '*:stroke:(none|black)']
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "dev", "pages", "index.ejs"),
            chunks: ["style", "main", "devStyle", "dev"],
            inject: true
        }),
        new SpriteLoaderPlugin()
    ],
    devtool: 'inline-source-map',
    devServer: {
        static: "./dist",
        port: 3000
    }
});