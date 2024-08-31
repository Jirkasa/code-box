const path = require("path");
const fs = require("fs")
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

function createHtmlWebpackPluginsForPagesInFolder(folderName) {
    const htmlPlugins = [];
    fs.readdirSync(`./pages/${folderName}`).forEach(pageName => {

        const chunks = ["style", "common"];

        if (fs.existsSync(`./js/documentation/${pageName}/main.js`)) {
            chunks.push("documentation-" + pageName);
        }

        const htmlPlugin = new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", folderName, pageName, "index.ejs"),
            filename: `${folderName}/${pageName}/index.html`,
            chunks: chunks,
            inject: true
        });
    
        htmlPlugins.push(htmlPlugin);
    });
    return htmlPlugins;
}

const documentationPages = createHtmlWebpackPluginsForPagesInFolder("documentation");

module.exports = {
    entry: {
        style: "./less/main.less",
        icons: './icons/main.js',
        common: "./ts/common/main.ts",
        "documentation-getting-started": "./js/documentation/getting-started/main.js",
        "documentation-styling": "./js/documentation/styling/main.js",
        "documentation-code-view": "./js/documentation/code-view/main.js",
        "documentation-code-box": "./js/documentation/code-box/main.js",
        "documentation-tab-code-box": "./js/documentation/tab-code-box/main.js",
        "documentation-project-code-box": "./js/documentation/project-code-box/main.js",
        "documentation-virtual-code-box": "./js/documentation/virtual-code-box/main.js",
        "documentation-creators": "./js/documentation/creators/main.js"
    },
    output: {
        clean: true
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
                test: /(\.ts|\.d.ts)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.svg$/,
                exclude: /css-images/,
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
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "index.ejs"),
            chunks: ["style", "common"],
            inject: true
        }),
        ...documentationPages,
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "static").replace(/\\/g, "/"),
                    to: path.resolve(__dirname, "dist", "static"),
                    noErrorOnMissing: true
                }
            ]
        }),
        new RemoveEmptyScriptsPlugin(),
        new SpriteLoaderPlugin()
    ]
}