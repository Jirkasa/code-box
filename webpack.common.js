const path = require("path");
const fs = require("fs")
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

function createHtmlWebpackPluginsForPagesInFolder(folderName, version) {
    const htmlPlugins = [];
    fs.readdirSync(`./pages/${folderName}`).forEach(pageName => {

        const chunks = ["style", "common"];

        if (version) {
            if (fs.existsSync(`./js/${version}/documentation/${pageName}/main.js`)) {
                chunks.push("documentation-" + pageName + "-v" + version.replace(/\./g, ""));
            }
        } else {
            if (fs.existsSync(`./js/documentation/${pageName}/main.js`)) {
                chunks.push("documentation-" + pageName);
            }
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
const documentationV12xPages = createHtmlWebpackPluginsForPagesInFolder("1.2.x/documentation", "1.2.x");
const documentationV11xPages = createHtmlWebpackPluginsForPagesInFolder("1.1.x/documentation", "1.1.x");
const documentationV10xPages = createHtmlWebpackPluginsForPagesInFolder("1.0.x/documentation", "1.0.x");

module.exports = {
    entry: {
        style: "./less/main.less",
        icons: './icons/main.js',
        common: "./ts/common/main.ts",
        home: "./js/home-page/main.js",
        examples: "./js/examples/main.js",
        "documentation-getting-started": "./js/documentation/getting-started/main.js",
        "documentation-styling": "./js/documentation/styling/main.js",
        "documentation-code-view": "./js/documentation/code-view/main.js",
        "documentation-code-box": "./js/documentation/code-box/main.js",
        "documentation-tab-code-box": "./js/documentation/tab-code-box/main.js",
        "documentation-project-code-box": "./js/documentation/project-code-box/main.js",
        "documentation-virtual-code-box": "./js/documentation/virtual-code-box/main.js",
        "documentation-creators": "./js/documentation/creators/main.js",
        "documentation-other-components": "./js/documentation/other-components/main.js",
        // VERSION 1.2.x
        "examples-v12x": "./js/1.2.x/examples/main.js",
        "documentation-getting-started-v12x": "./js/1.2.x/documentation/getting-started/main.js",
        "documentation-styling-v12x": "./js/1.2.x/documentation/styling/main.js",
        "documentation-code-view-v12x": "./js/1.2.x/documentation/code-view/main.js",
        "documentation-code-box-v12x": "./js/1.2.x/documentation/code-box/main.js",
        "documentation-tab-code-box-v12x": "./js/1.2.x/documentation/tab-code-box/main.js",
        "documentation-project-code-box-v12x": "./js/1.2.x/documentation/project-code-box/main.js",
        "documentation-virtual-code-box-v12x": "./js/1.2.x/documentation/virtual-code-box/main.js",
        "documentation-creators-v12x": "./js/1.2.x/documentation/creators/main.js",
        "documentation-other-components-v12x": "./js/1.2.x/documentation/other-components/main.js",
        // VERSION 1.1.x
        "examples-v11x": "./js/1.1.x/examples/main.js",
        "documentation-getting-started-v11x": "./js/1.1.x/documentation/getting-started/main.js",
        "documentation-styling-v11x": "./js/1.1.x/documentation/styling/main.js",
        "documentation-code-view-v11x": "./js/1.1.x/documentation/code-view/main.js",
        "documentation-code-box-v11x": "./js/1.1.x/documentation/code-box/main.js",
        "documentation-tab-code-box-v11x": "./js/1.1.x/documentation/tab-code-box/main.js",
        "documentation-project-code-box-v11x": "./js/1.1.x/documentation/project-code-box/main.js",
        "documentation-virtual-code-box-v11x": "./js/1.1.x/documentation/virtual-code-box/main.js",
        "documentation-creators-v11x": "./js/1.1.x/documentation/creators/main.js",
        "documentation-other-components-v11x": "./js/1.1.x/documentation/other-components/main.js",
        // VERSION 1.0.x
        "examples-v10x": "./js/1.0.x/examples/main.js",
        "documentation-getting-started-v10x": "./js/1.0.x/documentation/getting-started/main.js",
        "documentation-styling-v10x": "./js/1.0.x/documentation/styling/main.js",
        "documentation-code-view-v10x": "./js/1.0.x/documentation/code-view/main.js",
        "documentation-code-box-v10x": "./js/1.0.x/documentation/code-box/main.js",
        "documentation-tab-code-box-v10x": "./js/1.0.x/documentation/tab-code-box/main.js",
        "documentation-project-code-box-v10x": "./js/1.0.x/documentation/project-code-box/main.js",
        "documentation-virtual-code-box-v10x": "./js/1.0.x/documentation/virtual-code-box/main.js",
        "documentation-creators-v10x": "./js/1.0.x/documentation/creators/main.js",
        "documentation-other-components-v10x": "./js/1.0.x/documentation/other-components/main.js"
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
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "index.ejs"),
            chunks: ["style", "common", "home"],
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "examples", "index.ejs"),
            chunks: ["style", "common", "examples"],
            filename: `examples/index.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "1.2.x", "examples", "index.ejs"),
            chunks: ["style", "common", "examples-v12x"],
            filename: `1.2.x/examples/index.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "1.1.x", "examples", "index.ejs"),
            chunks: ["style", "common", "examples-v11x"],
            filename: `1.1.x/examples/index.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "pages", "1.0.x", "examples", "index.ejs"),
            chunks: ["style", "common", "examples-v10x"],
            filename: `1.0.x/examples/index.html`,
            inject: true
        }),
        ...documentationPages,
        ...documentationV12xPages,
        ...documentationV11xPages,
        ...documentationV10xPages,
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