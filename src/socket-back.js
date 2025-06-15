let mapa = [];

export default function configurarSockets(io, cookie) {
    io.on("connection", (socket) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        const cookieSocketId = cookies.socketId;

        console.log("Usuário conectado:", socket.id);
        console.log("Socket ID vindo do cookie:", cookieSocketId);

        socket.on("message", async (data) => {
            const parsedData = JSON.parse(data);
            parsedData.id = cookieSocketId
            mapa.push(parsedData);
            io.emit("message", JSON.stringify(parsedData));
        });

        socket.on("get-initial-map", () => {
            socket.emit("initial-map", mapa);
        });
    });
}