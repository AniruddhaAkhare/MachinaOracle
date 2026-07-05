"use client";
/**
 * useWebSocket.ts
 * Manages a WebSocket connection that streams fleet snapshots.
 * Reconnects automatically on disconnect with exponential backoff.
 */
import { useEffect, useRef, useCallback, useState } from "react";

export type WSStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseWSOptions {
  url: string;
  onMessage: (data: any) => void;
  onStatusChange?: (status: WSStatus) => void;
}

export function useWebSocket({ url, onMessage, onStatusChange }: UseWSOptions) {
  const wsRef        = useRef<WebSocket | null>(null);
  const retryRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount   = useRef(0);
  const mountedRef   = useRef(true);
  const [status, setStatus] = useState<WSStatus>("connecting");

  const setS = useCallback((s: WSStatus) => {
    setStatus(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current && wsRef.current.readyState < 2) return; // already open/connecting

    setS("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryCount.current = 0;
      setS("connected");
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onMessage(data);
      } catch (e) {
        console.warn("[WS] Parse error:", e);
      }
    };

    ws.onerror = () => setS("error");

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setS("disconnected");
      // Exponential backoff: 1s, 2s, 4s, 8s … max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current++;
      retryRef.current = setTimeout(connect, delay);
    };
  }, [url, onMessage, setS]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    mountedRef.current = false;
    if (retryRef.current) clearTimeout(retryRef.current);
    wsRef.current?.close();
  }, []);

  return { status, disconnect, reconnect: connect };
}
