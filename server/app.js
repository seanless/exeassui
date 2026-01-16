const express = require("express");
const fs = require("fs");
const path = require("path");
const history = require("connect-history-api-fallback");
const http = require("http"); // 必须保留，用于创建兼容 WebSocket 的服务器
const cors = require("cors");
const axios = require("axios");
const https = require('https');
// 引入代理中间件（新增）
const { createProxyMiddleware } = require("http-proxy-middleware");

class NodeServer {
  constructor(SERVER_PORT) {
    this.SERVER_PORT = SERVER_PORT;

    this.nodeApp = express();
    this.nodeApp.use(cors());
    this.nodeApp.use(express.json({ limit: "100mb" }));
    this.nodeApp.use(express.urlencoded({ limit: "100mb", extended: false }));
    this.nodeApp.use(express.static(path.join(__dirname, "./uploads")));

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // 关键：不验证证书有效性（包括过期、自签名等）
      secureOptions: require('constants').SSL_OP_NO_TLSv1_2 // 可选：兼容旧 TLS 版本（如果目标服务用了旧协议）
    });

    this.nodeApp.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type,request-origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-control-max-age", 1000);
      next();
    });

    // 健康检查、环境变量接口（保持不变）
    this.nodeApp.get("/healthz", (req, res) => {
      res.status(200).send("ok");
    });
    this.nodeApp.get("/healthy", (req, res) => {
      res.status(200).send("ok");
    });
  }

  staticStart() {
    let _this = this;
    const staticFileMiddleware = express.static(
      path.join(__dirname, "./dist/")
    );
    this.nodeApp.use(staticFileMiddleware);
    this.nodeApp.use(
      history({
        disableDotRule: true,
        verbose: true,
      })
    );
    this.nodeApp.use(staticFileMiddleware);

    this.nodeApp.get("/", function (req, res) {
      // 修复：用 sendFile 替代 render（避免依赖模板引擎）
      res.sendFile(path.join(__dirname, "./dist/index.html"));
    });

    // ===== 修复：用 http.createServer 启动服务器（兼容 WebSocket）=====
    // 替代原有的 this.nodeApp.listen(...)
    http.createServer(this.nodeApp).listen(this.SERVER_PORT, () => {
      console.log(`App 运行在端口 ${_this.SERVER_PORT}`);
    });
  }
}

module.exports = NodeServer;