const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = {
    entry: {
        main: {
            import: "./src/ts/index.ts",
            filename: "index.js"
        },
        style: "./src/less/main.less"
    },
    output: {
        clean: true,
        library: {
            name: 'CodeBox',
            type: 'umd'
        }
    },
    module: {
        rules: [
            {
                test: /(\.ts|\.d.ts)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    plugins: [
        new RemoveEmptyScriptsPlugin()
    ]
}