import { useEffect, useState, useRef } from "react";

interface PriceData {
  bid: number;
  ask: number;
  lastUpdate?: number;
}

interface BidAskMap {
  [symbol: string]: PriceData;
}

interface WebSocketMessage {
  symbol: string;
  bid: number;
  ask: number;
}

interface BidAskTickerProps {
  onAssetSelect?: (asset: string) => void;
  selectedAsset?: string;
  onPriceUpdate?: (price: { bid: number; ask: number }) => void;
}

function BidAskTicker({ onAssetSelect, selectedAsset, onPriceUpdate }: BidAskTickerProps) {
  const [bidAskMap, setBidAskMap] = useState<BidAskMap>({});
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Update parent with current price when selectedAsset changes
  useEffect(() => {
    if (selectedAsset && bidAskMap[selectedAsset] && onPriceUpdate) {
      onPriceUpdate({
        bid: bidAskMap[selectedAsset].bid,
        ask: bidAskMap[selectedAsset].ask
      });
    }
  }, [selectedAsset, bidAskMap, onPriceUpdate]);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:7070/");
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            setIsConnected(true);
            setError(null);
            setIsLoading(false);
            console.log("WebSocket connected");
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
              
              // Update parent component with current price if this is the selected asset
              if (selectedAsset === data.symbol && onPriceUpdate) {
                onPriceUpdate({ bid: data.bid, ask: data.ask });
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
            console.log("WebSocket disconnected:", event.code, event.reason);
            setIsConnected(false);

            // Attempt to reconnect after 3 seconds
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                console.log("Attempting to reconnect...");
                connectWebSocket();
              }
            }, 3000);
          }
        };
      } catch (error) {
        if (isMounted) {
          console.error("Failed to create WebSocket connection:", error);
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
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  const getPriceChangeColor = (bid: number, ask: number) => {
    const spread = ask - bid;
    const spreadPercentage = (spread / bid) * 100;

    if (spreadPercentage < 0.1) return "text-green-400";
    if (spreadPercentage < 0.5) return "text-yellow-400";
    return "text-red-400";
  };

  const getSpreadPercentage = (bid: number, ask: number) => {
    return (((ask - bid) / bid) * 100).toFixed(3);
  };

  const getConnectionStatusColor = () => {
    return isConnected ? "bg-green-400" : "bg-red-400";
  };

  const getConnectionStatusText = () => {
    return isConnected ? "CONNECTED" : "DISCONNECTED";
  };

  const getAssetIcon = (symbol: string) => {
    const firstChar = symbol.charAt(0);
    const colors = {
      'B': 'bg-orange-500',
      'E': 'bg-blue-500',
      'S': 'bg-purple-500',
      'A': 'bg-green-500',
      'D': 'bg-red-500',
      'L': 'bg-yellow-500',
      'X': 'bg-indigo-500',
      'C': 'bg-pink-500'
    };
    return colors[firstChar as keyof typeof colors] || 'bg-gray-500';
  };

  const handleAssetClick = (symbol: string) => {
    if (onAssetSelect) {
      onAssetSelect(symbol);
    }
    
    // Immediately update the parent with current price data for the selected asset
    if (onPriceUpdate && bidAskMap[symbol]) {
      onPriceUpdate({
        bid: bidAskMap[symbol].bid,
        ask: bidAskMap[symbol].ask
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Live Prices</h3>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Market Prices</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${isConnected ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {getConnectionStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="m-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Price List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {Object.entries(bidAskMap).map(([symbol, priceData]) => (
            <div
              key={symbol}
              className={`bg-gray-800 rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                selectedAsset === symbol 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-blue-500'
              }`}
              onClick={() => handleAssetClick(symbol)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full ${getAssetIcon(symbol)} flex items-center justify-center mr-2`}>
                    <span className="text-xs font-bold text-white">
                      {symbol.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold">{symbol}</h3>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getPriceChangeColor(priceData.bid, priceData.ask)} bg-white/10`}>
                  {getSpreadPercentage(priceData.bid, priceData.ask)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Bid</div>
                  <div className="text-green-400 font-mono text-sm font-semibold">
                    {priceData.bid?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Ask</div>
                  <div className="text-red-400 font-mono text-sm font-semibold">
                    {priceData.ask?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </div>
                </div>
              </div>

              {/* Spread */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Spread:</span>
                  <span className={`font-mono ${getPriceChangeColor(priceData.bid, priceData.ask)}`}>
                    {formatPrice(priceData.ask - priceData.bid)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {Object.keys(bidAskMap).length === 0 && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">
              {isConnected ? 'Waiting for price data...' : 'No price data available'}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {isConnected ? 'Real-time WebSocket feed' : 'Connection lost - attempting to reconnect...'}
        </div>
      </div>
    </div>
  );
}

export default BidAskTicker;
