import React from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App";
const container = document.getElementById("root");
const root = createRoot(container);
var Config = require("Config");

// 配置环境变量
window["env"] = Config;

root.render(
  <BrowserRouter>
    <ConfigProvider theme={{ token: { colorPrimary: "#00b96b" } }}>
      <App />
    </ConfigProvider>
  </BrowserRouter>
);
