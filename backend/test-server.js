const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Recebida requisição:", req.url);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, time: new Date().toISOString() }));
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Servidor de teste rodando em http://127.0.0.1:3000");
  console.log("Tente acessar no navegador ou use:");
  console.log("curl http://127.0.0.1:3000");
});
