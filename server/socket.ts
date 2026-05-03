import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

export class SocketManager {
  private static instance: SocketManager;
  private wss: WebSocketServer | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      this.wss?.handleUpgrade(request, socket, head, (ws) => {
        this.wss?.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket client connected');
      ws.on('close', () => console.log('🔌 Client disconnected'));
    });
  }

  public broadcast(type: string, data: any) {
    const payload = JSON.stringify({ type, data, timestamp: new Date() });
    this.wss?.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}
