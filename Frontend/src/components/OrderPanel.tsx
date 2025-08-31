import React, { useState } from "react";
import axios from 'axios';

interface OrderPanelProps {
  selectedAsset?: string;
  currentPrice?: { bid: number; ask: number };
  onOrderPlaced?: () => void; // Callback to trigger order history refresh
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  selectedAsset,
  currentPrice,
  onOrderPlaced,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!selectedAsset || !currentPrice || quantity <= 0) {
      setError("Please select an asset and enter a valid quantity");
      return;
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please sign in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderResult(null);

    try {
      const orderData = {
        symbol: selectedAsset.toLowerCase(), // Convert to lowercase to match backend expectation
        type: side.charAt(0).toUpperCase() + side.slice(1), // Capitalize first letter: "buy" -> "Buy"
        quantity: quantity,
        leverage: leverage
      };

      console.log("📤 Sending order request:", orderData);

      const response = await axios.post('http://localhost:3000/order/open', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Order placed successfully:", response.data);
      setOrderResult(response.data);
      
      // Reset form
      setQuantity(0);
      setLeverage(1);
      
      // Trigger order history refresh
      if (onOrderPlaced) {
        onOrderPlaced();
      }
      
    } catch (error: any) {
      console.error("❌ Error placing order:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError("Authentication failed. Please sign in again.");
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || "Invalid order data");
      } else {
        setError(error.response?.data?.error || "Failed to place order");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Order Panel</h2>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            Asset Information
          </h3>

          {selectedAsset ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white font-semibold">
                  {selectedAsset}
                </span>
              </div>

              {currentPrice ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Buy:</span>
                    <span className="text-green-400 font-mono">
                      $
                      {currentPrice.ask.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sell:</span>
                    <span className="text-red-400 font-mono">
                      $
                      {currentPrice.bid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-500 text-sm">
                    Waiting for price data...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Select an asset to view details
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Order Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`py-2 px-4 rounded-md font-medium ${
                  side === "buy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                onClick={() => setSide("buy")}
              >
                Buy
              </button>
              <button
                className={`py-2 px-4 rounded-md font-medium ${
                  side === "sell"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                onClick={() => setSide("sell")}
              >
                Sell
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="Enter quantity"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Leverage
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="Enter leverage (1-100)"
            />
          </div>

                     <button 
             onClick={handlePlaceOrder}
             disabled={isLoading || !selectedAsset || !currentPrice || quantity <= 0}
             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
           >
             {isLoading ? "Placing Order..." : `Place ${side.toUpperCase()} Order`}
           </button>

           {/* Error Display */}
           {error && (
             <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
               <div className="flex items-center space-x-2">
                 <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <span className="text-red-400 text-sm">{error}</span>
               </div>
             </div>
           )}

           {/* Success Display */}
           {orderResult && (
             <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
               <div className="flex items-center space-x-2 mb-2">
                 <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 <span className="text-green-400 text-sm font-semibold">Order Placed Successfully!</span>
               </div>
               <div className="text-green-300 text-xs">
                 <div>Symbol: {orderResult.order.symbol}</div>
                 <div>Type: {orderResult.order.type}</div>
                 <div>Quantity: {orderResult.order.quantity}</div>
                 <div>Price: ${orderResult.order.openPrice}</div>
                 <div>Margin: ${orderResult.order.margin}</div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
