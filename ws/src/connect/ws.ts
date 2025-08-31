import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 7070 });

export {wss};