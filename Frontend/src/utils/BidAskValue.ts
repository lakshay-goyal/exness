import { useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
  symbol: string;
  bid: number;
  ask: number;
}

export interface BidAsk {
  bid: number;
  ask: number;
}

export interface BidAskWithMeta extends BidAsk {
  lastUpdate: number;
}

export type BidAskMap = Record<string, BidAskWithMeta>;

interface UseBidAskValueOptions {
  selectedAsset?: string;
  onPriceUpdate?: (price: BidAsk) => void;
  onBidAskUpdate?: (symbol: string, price: BidAsk) => void;
  url?: string;
}

export function useBidAskValue(options?: UseBidAskValueOptions) {
  const { selectedAsset, onPriceUpdate, onBidAskUpdate, url = "ws://localhost:7070/" } = options || {};

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bidAskMap, setBidAskMap] = useState<BidAskMap>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            setIsConnected(true);
            setError(null);
            setIsLoading(false);
            // console.log("WebSocket connected");
          }
        };

        ws.onmessage = (event) => {
          if (isMounted) {
            try {
              const data: WebSocketMessage = JSON.parse(event.data);
              setBidAskMap((prev) => ({
                ...prev,
                [data.symbol]: {
                  bid: data.bid,
                  ask: data.ask,
                  lastUpdate: Date.now(),
                },
              }));

              if (selectedAsset === data.symbol && onPriceUpdate) {
                onPriceUpdate({ bid: data.bid, ask: data.ask });
              }

              if (onBidAskUpdate) {
                // console.log("Sending bid-ask data to parent:", data.symbol, { bid: data.bid, ask: data.ask });
                onBidAskUpdate(data.symbol, { bid: data.bid, ask: data.ask });
              }
            } catch (parseError) {
              console.error("Error parsing WebSocket message:", parseError);
            }
          }
        };

        ws.onerror = (event) => {
          if (isMounted) {
            console.error("WebSocket error:", event);
            setError("Connection error");
            setIsConnected(false);
          }
        };

        ws.onclose = (event) => {
          if (isMounted) {
            // console.log("WebSocket disconnected:", event.code, event.reason);
            setIsConnected(false);

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                // console.log("Attempting to reconnect...");
                connectWebSocket();
              }
            }, 3000);
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error("Failed to create WebSocket connection:", err);
          setError("Failed to connect to price feed");
          setIsLoading(false);
          setIsConnected(false);
        }
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [selectedAsset, onPriceUpdate, onBidAskUpdate, url]);

  return { bidAskMap, isConnected, isLoading, error };
}

export default useBidAskValue;

