import express from "express";
import url from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import configurarSockets from './socket-back.js';
import cookieParser from "cookie-parser";
import * as dotenv from 'dotenv'
import * as cookie from 'cookie';

dotenv.config()

const app = express();
const porta = process.env.PORT || 3000;


const caminhoAtual = url.fileURLToPath(import.meta.url);
const diretorioPublico = path.join(caminhoAtual, "../..", "public");
app.use(express.static(diretorioPublico));
app.use(cookieParser())

const servidorHttp = http.createServer(app);
const io = new Server(servidorHttp);

configurarSockets(io, cookie);

servidorHttp.listen(porta, () =>
  console.log(`Servidor escutando na porta ${porta}`)
);

export default io;