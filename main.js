const { app, BrowserWindow, Menu, Tray } = require("electron");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const app1 = require("express")();
const path = require("path");
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 200,
    resizable: false,
    autoHideMenuBar: true,
    skipTaskbar: true,
    icon: path.join(__dirname, "./favicon.ico"),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
  //实现点击关闭按钮让应用保存在托盘里面 ，双击托盘打开应用
  win.on("close", (e) => {
    if (!win.isFocused()) {
      win = null;
    } else {
      e.preventDefault(); //阻止窗口的关闭事件
      win.hide();
    }
  });
}
let tray = null;
function createTray() {
  tray = new Tray(path.join(__dirname, "./favicon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click: function () {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Chrome浏览器插件");
  tray.setContextMenu(contextMenu);
  //监听任务栏图标的点击事件
  tray.on("double-click", function () {
    win.show();
  });
}
app
  .whenReady()
  .then(createWindow)
  .then(createTray)
  .catch((err) => {
    console.log(err);
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app1.use(cors());

const proxy = {
  target: "http://0.0.0.0:19196",
  port: 62351,
};

app1.all(
  "/*",
  createProxyMiddleware({
    target: proxy.target,
    changeOrigin: true,
  })
);

app1.listen(proxy.port, () => {
  console.log("listen http://0.0.0.0:" + proxy.port);
});
