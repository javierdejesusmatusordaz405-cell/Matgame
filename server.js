const express = require("express");
const http = require("http");
const path = require("path");
const os = require("os");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const ROOT_DIR = __dirname;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const players = new Map();

function broadcastPlayers() {
  const list = Array.from(players.entries()).map(([id, player]) => ({ id, name: player.name }));
  io.emit("players:update", list);
}

function getLocalAddresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();

  for (const details of Object.values(interfaces)) {
    for (const item of details || []) {
      if (item.family === "IPv4" && !item.internal) {
        addresses.push(item.address);
      }
    }
  }

  return addresses;
}

app.use(express.json());
app.use(express.static(ROOT_DIR));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Servidor Express + Socket.IO listo" });
});

app.get("/api/players", (req, res) => {
  const list = Array.from(players.entries()).map(([id, player]) => ({ id, name: player.name }));
  res.json({ players: list });
});

app.post("/api/players", (req, res) => {
  const name = String(req.body?.name || "").trim();

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  const id = req.body?.id || `player-${Date.now()}`;
  players.set(id, { name, socketId: id });
  broadcastPlayers();
  return res.json({ ok: true, id, name });
});

app.delete("/api/players", (req, res) => {
  players.clear();
  broadcastPlayers();
  res.json({ ok: true, message: "Lista reiniciada" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "indiex.html"));
});

io.on("connection", (socket) => {
  socket.emit("players:update", Array.from(players.entries()).map(([id, player]) => ({ id, name: player.name })));

  socket.on("player:register", (payload) => {
    const name = String(payload?.name || "").trim() || "Jugador";
    players.set(socket.id, { name, socketId: socket.id });
    broadcastPlayers();
  });

  socket.on("challenge:create", (payload) => {
    const { opponentId, challengerName, opponentName, modules, time } = payload || {};
    if (!opponentId) {
      return;
    }

    io.to(opponentId).emit("challenge:incoming", {
      challengerId: socket.id,
      challengerName,
      opponentName,
      modules,
      time
    });
  });

  socket.on("challenge:accept", (payload) => {
    const { challengerId, modules, time, challengerName, opponentName } = payload || {};
    if (!challengerId) {
      return;
    }

    io.to(challengerId).emit("challenge:start", {
      opponentId: socket.id,
      opponentName,
      modules,
      time
    });

    socket.emit("challenge:start", {
      opponentId: challengerId,
      opponentName: challengerName || "Rival",
      modules,
      time
    });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    broadcastPlayers();
  });
});

server.listen(PORT, HOST, () => {
  const ips = getLocalAddresses();
  console.log(`Servidor Express + Socket.IO listo en http://localhost:${PORT}`);

  if (ips.length > 0) {
    console.log("Accesible desde tu red LAN en:");
    ips.forEach((ip) => console.log(`- http://${ip}:${PORT}`));
  } else {
    console.log("No se detectaron IPs de red local.");
  }
});
