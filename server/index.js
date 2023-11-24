const express = require('express');
const http = require('http');
const cors = require('cors');
const socketServer = require("./src/socketServer");

const app = express();

const server = http.createServer(app)
socketServer.registerSocketServer(server);

app.use(cors());

app.get("/", (req, res) => {
    res.send("O Pai tá On")
} );

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Isso ai doidão, a parada deu certo na Porta ${PORT}`);
});