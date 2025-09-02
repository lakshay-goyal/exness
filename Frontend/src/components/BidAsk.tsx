import React from "react";
import { type BidAskMap } from "../utils/BidAskValue.ts";

interface BidAskProps {
  bidAskMap: BidAskMap;
  isConnected: boolean;
  error: string | null;
  selectedAsset: string | null;
  onSelectAsset: (symbol: string) => void;
}

const BidAsk: React.FC<BidAskProps> = ({ bidAskMap, isConnected, error, selectedAsset, onSelectAsset }) => {
  const getConnectionStatusColor = () => {
    return isConnected ? "bg-green-400" : "bg-red-400";
  };

  const getConnectionStatusText = () => {
    return isConnected ? "Connected" : "Disconnected";
  };

  const handleAssetClick = (symbol: string) => {
    onSelectAsset(symbol);
  };

  const getAssetIcon = (symbol: string) => {
    // Simple color hash by symbol initial
    const key = symbol.charCodeAt(0) % 5;
    switch (key) {
      case 0:
        return "bg-indigo-600";
      case 1:
        return "bg-rose-600";
      case 2:
        return "bg-emerald-600";
      case 3:
        return "bg-amber-600";
      default:
        return "bg-sky-600";
    }
  };

  const getPriceChangeColor = (bid?: number, ask?: number) => {
    if (bid == null || ask == null) return "text-gray-300";
    const spread = ask - bid;
    return spread >= 0 ? "text-green-400" : "text-red-400";
  };

  const getSpreadPercentage = (bid?: number, ask?: number) => {
    if (!bid || !ask) return 0;
    const spread = ask - bid;
    if (bid === 0) return 0;
    return Number(((spread / bid) * 100).toFixed(3));
  };

  const formatPrice = (value?: number) => {
    if (value == null || Number.isNaN(value)) return "-";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  return (
    <div className="bg-gray-900 border-r border-gray-700 h-full overflow-hidden flex flex-col">
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

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
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

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {isConnected ? 'Real-time WebSocket feed' : 'Connection lost - attempting to reconnect...'}
        </div>
      </div>
    </div>
  );
};

export default BidAsk;


