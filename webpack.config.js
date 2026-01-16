// __dirname是node.js中的一个全局变量，它指向当前执行脚本所在的目录
// path是node.js中提供的处理文件路径的小工具。 (http://www.runoob.com/nodejs/nodejs-path-module.html)
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const version = new Date().getTime();
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  // 项目入口，webpack从此处开始构建
  entry: {
    main: path.join(__dirname, "src/index.jsx"), // 指定入口，可以指定多个。参考webpack文档
  },
  output: {
    publicPath: process.env.NODE_ENV === "development" ? "/" : "/",
    path: path.join(__dirname, "server/dist"), // bundle生成(emit)到哪里
    filename: "bundle" + version + "[name].js", // bundle生成文件的名称
    chunkFilename: "[id].[chunkhash].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", //指定模板路径
      filename: "index.html", //指定文件名
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/recorder-core.js"),
          to: path.resolve(__dirname, "server/dist"),
        },
        {
          from: path.resolve(__dirname, "public/wav.js"),
          to: path.resolve(__dirname, "server/dist"),
        },
        {
          from: path.resolve(__dirname, "public/pcm.js"),
          to: path.resolve(__dirname, "server/dist"),
        },
        {
          from: path.resolve(__dirname, "public/wsconnecter.js"),
          to: path.resolve(__dirname, "server/dist"),
        },
        {
          from: path.resolve(__dirname, "public/main.js"),
          to: path.resolve(__dirname, "server/dist"),
        },
      ],
    }),
  ],
  devServer: {
    client: {
      overlay: false, // 关闭错误叠加层
    },
    historyApiFallback: true,
    static: "./exeassui",
    port: 8305
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: "pre",
        resolve: {
          extensions: [".js", ".jsx"],
        },
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.(css)$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader", // 将 CSS 注入到 DOM
          "css-loader", // 处理 CSS 文件中的 @import 和 url()
          "less-loader", // 将 Less 编译为 CSS
        ],
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 25000,
          },
        },
      },
    ],
  },
  externals: {
    Config: JSON.stringify(
      process.env.NODE_ENV === "development"
        ? require("./config.dev.json")
        : require("./config.prod.json")
    ),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint) => `manifest.${entrypoint.name}`,
    },
  },
};
