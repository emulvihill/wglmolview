const webpack = require("webpack");
const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const DashboardPlugin = require("webpack-dashboard/plugin");
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

var config = {
    devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
    context: path.resolve("./src"),
    entry: {
        app: "Main.ts"
    },
    output: {
        path: path.resolve("./www/dist"),
        filename: "wglmolview.bundle.js",
        sourceMapFilename: "wglmolview.map",
        devtoolModuleFilenameTemplate: function (info) {
            return "file:///" + info.absoluteResourcePath;
        }
    },
    module: {
        rules: [
            { enforce: "pre", test: /\.ts$/, exclude: ["node_modules"], loader: "ts-loader" },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                enforce: "pre",
                test: /\.tsx?$/,
                use: "source-map-loader"
            },
            { test: /\.html$/, loader: "html" },
            { test: /\.css$/, loaders: ["style", "css"] }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        modules: [path.resolve("./src"), "node_modules"]
    },
    devtool: "inline-source-map",
    plugins: [
        new webpack.DefinePlugin({
            "process.env": { // eslint-disable-line quote-props
                NODE_ENV: JSON.stringify(nodeEnv)
            }
        }),
/*        new HtmlWebpackPlugin({
            title: "Typescript Webpack Starter",
            template: "!!ejs-loader!src/index.html"
        }),*/
/*        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: Infinity,
            filename: "vendor.bundle.js"
        }),*/
/*        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            output: { comments: false },
            sourceMap: false
        }),*/
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ]
};

module.exports = config;
