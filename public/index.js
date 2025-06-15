const socket = io();
const canvas = document.getElementById('place');
const ctx = canvas.getContext('2d');
const size = 50;
let minutos = 5;
let intervalo = null;
const contador = document.querySelector('.timeout');

const user = {
    id: getCookie('socketId'),
    ready: true
}

for (let x = 0; x < canvas.width; x += size) {
    for (let y = 0; y < canvas.height; y += size) {
        ctx.strokeRect(x, y, size, size);
    }
}


canvas.addEventListener('click', (event) => {

    if (!user.ready) {
        console.log("Usuário não está pronto para clicar. Aguardando...");
        return;
    }

    // 5 minutos = 300000 milissegundos
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const gridX = Math.floor(mouseX / size) * size;
    const gridY = Math.floor(mouseY / size) * size;

    const posX = gridX;
    const posY = gridY;

    console.log(`Quadrado clicado: linha ${gridY}, coluna ${gridX}`);
    console.log(`Posição no canvas: x=${posX}, y=${posY}`);

    let colorInput = document.getElementById('color-picker');

    colorInput.addEventListener('input', (e) => {
        ctx.fillStyle = colorInput.value;
    })

    ctx.fillRect(posX, posY, size, size);
    user.ready = false;
    socket.emit('message', JSON.stringify({
        x: posX,
        y: posY,
        color: colorInput.value
    }))

    user.ready = false;
    minutos = 5;
    contador.textContent = `Faltam ${minutos} minutos...`;

    if (intervalo) clearInterval(intervalo);

    intervalo = setInterval(() => {
        minutos--;
        if (minutos > 0) {
            contador.textContent = `Faltam ${minutos} minutos...`;
        } else {
            clearInterval(intervalo);
            contador.textContent = `Pronto para pintar`;
            user.ready = true;
            console.log("Usuário está pronto novamente:", user.id);
        }
    }, 60000);

})

socket.emit("get-initial-map");

socket.on("initial-map", (mapa) => {
    mapa.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    });
});


socket.on("connect", () => {
    const existingId = getCookie('socketId');
    if (!existingId) {
        document.cookie = `socketId=${socket.id}; path=/; max-age=31536000`; // 1 ano
        console.log("ID salvo:", socket.id);
    } else {
        console.log("ID já existente:", existingId);
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


socket.on("message", (data) => {
    console.log(data);
    const { x, y, color, id } = JSON.parse(data);
    window.localStorage.setItem('socketId', id);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
})