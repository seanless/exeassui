const NodeApp = require("./app.js");

const defaultPorts = {
  "serve": 8035,
  "serve:dev": 8035,
  "serve:prod112": 30066,
  "serve:prod212": 30066,
};

const scriptName = process.argv[2];
// 获取用户指定的端口（如果有）
const userPort = process.argv[3] ? parseInt(process.argv[3], 10) : null;
// 最终端口：用户指定 → 默认端口
const serverPort = userPort || defaultPorts[scriptName];

const App = new NodeApp(serverPort);

console.log(`当前执行的脚本名称：${scriptName}`);
console.log(`服务端口：${serverPort}`);

// if( scriptName!=="serve:local" ){
  App.staticStart();
// }

