const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { URL } = require("url");

const isDev = process.env.NODE_ENV === "development";

function contentTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    case ".eot":
      return "application/vnd.ms-fontobject";
    default:
      return "application/octet-stream";
  }
}

function createStaticServer(buildPath) {
  const indexPath = path.join(buildPath, "index.html");

  const server = http.createServer((req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const pathname = decodeURIComponent(requestUrl.pathname || "/");

      // Normalize to the build directory.
      const safePath = pathname.replace(/^\/+/, ""); // strip leading slashes
      const resolved = path.resolve(buildPath, safePath || "index.html");
      const resolvedIndex = path.resolve(indexPath);

      // Serve files if they exist; otherwise fallback to SPA index.html.
      let fileToServe = resolved;
      if (path.basename(resolved) === "") fileToServe = resolvedIndex;

      if (!resolved.startsWith(path.resolve(buildPath))) {
        // Prevent directory traversal.
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (fs.existsSync(fileToServe) && fs.statSync(fileToServe).isFile()) {
        res.writeHead(200, { "Content-Type": contentTypeForPath(fileToServe) });
        fs.createReadStream(fileToServe).pipe(res);
        return;
      }

      // SPA fallback: always return index.html for non-existent routes/assets.
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(resolvedIndex).pipe(res);
    } catch (e) {
      res.writeHead(500);
      res.end("Server error");
    }
  });

  return server;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    return;
  }

  const buildPath = path.join(__dirname, "..", "build");
  const server = createStaticServer(buildPath);

  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    // Load from HTTP (not file://) so refresh/history routing and asset paths behave correctly.
    win.loadURL(`http://127.0.0.1:${port}/`);
  });

  win.on("closed", () => {
    try {
      server.close();
    } catch (_) {}
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});