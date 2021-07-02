const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
let clients = {};

app.get('/', (req, res) => {
    return res.status(200).send(Object.keys(clients));
});

io.on("connection", (socket) => {

    socket.on("signin", (id) => {
        for (const [clientID, socket] of Object.entries(clients)) {
            socket.emit("userOnline", id);
        }
        clients[id] = socket;
    });

    socket.on("getOnlineUsers", (id) => {
        for (const [clientID, _] of Object.entries(clients)) {
            if (id != clientID) {
                clients[id].emit("userOnline", clientID);
            }
        }
    });

    socket.on("message", (msg) => {
        const jsonMessage = JSON.parse(msg);
        const targetId = jsonMessage.target;
        const message = jsonMessage.message;
        if (clients[targetId]) {
            clients[targetId].emit("message", message);
        }
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log("server started");
});