import { WebSocketServer } from "ws";
import type { Server as HttpServer } from "http";
import { registerWebSocketClient, unregisterWebSocketClient } from "./execution/executor";

/**
 * Setup WebSocket server for real-time run log streaming
 */
export async function setupWebSocketServer(httpServer: HttpServer): Promise<void> {
  const wss = new WebSocketServer({
    noServer: true,
    path: "/ws/runs",
  });

  httpServer.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url || "", "http://localhost");
    if (url.pathname !== "/ws/runs") {
      if (process.env.NODE_ENV === "production") {
        socket.destroy();
      }
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `ws://localhost`);
    const runId = parseInt(url.searchParams.get("runId") || "0");

    if (!runId) {
      ws.close(1008, "Run ID required");
      return;
    }

    console.log(`[WebSocket] Client connected for run ${runId}`);

    // Register client for updates
    registerWebSocketClient(runId, ws);

    ws.on("close", () => {
      console.log(`[WebSocket] Client disconnected from run ${runId}`);
      unregisterWebSocketClient(runId, ws);
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Error on run ${runId}:`, error);
      unregisterWebSocketClient(runId, ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({ 
      type: "connected", 
      data: { runId, message: "Connected to run log stream" } 
    }));
  });

  console.log("[WebSocket] Server initialized on /ws/runs");
}
