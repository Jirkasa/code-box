const path = require("path");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { default: merge } = require("webpack-merge");
const commonConfig = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BannerPlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(commonConfig, {
    output: {
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ["postcss-preset-env", {}]
                                ]
                            }
                        }
                    },
                    "less-loader"
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false
            }),
            new CssMinimizerPlugin()
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css"
        }),
        new BannerPlugin({
            banner: `Code Box
https://github.com/Jirkasa/code-box
Copyright (c) 2024 Jiří Satora
Licensed under the MIT license.`
        })
    ]
});