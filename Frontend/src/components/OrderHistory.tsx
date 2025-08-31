import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  leverage: number;
  openprice: number;
  openTime: string;
  margin: number;
  status: 'open' | 'closed';
  closeTime?: string;
  closeprice?: number;
  pnl?: number;
}

interface OrderHistoryProps {
  selectedAsset?: string;
  refreshTrigger?: number; // Add this to trigger refresh when new orders are placed
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ selectedAsset, refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual API calls
  const mockOrders: Order[] = [
    {
      id: '1',
      symbol: 'BTCUSDT',
      type: 'buy',
      quantity: 0.1,
      leverage: 10,
      openprice: 45000.50,
      openTime: '2024-01-15T10:30:00Z',
      margin: 450.05,
      status: 'open'
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      type: 'sell',
      quantity: 0.5,
      leverage: 5,
      openprice: 2800.25,
      openTime: '2024-01-15T09:15:00Z',
      margin: 280.03,
      status: 'open'
    },
    {
      id: '3',
      symbol: 'SOLUSDT',
      type: 'buy',
      quantity: 2.0,
      leverage: 20,
      openprice: 95.75,
      openTime: '2024-01-14T14:20:00Z',
      closeTime: '2024-01-15T11:45:00Z',
      closeprice: 98.25,
      margin: 9.58,
      pnl: 5.0,
      status: 'closed'
    },
    {
      id: '4',
      symbol: 'ADAUSDT',
      type: 'sell',
      quantity: 100,
      leverage: 15,
      openprice: 0.485,
      openTime: '2024-01-13T16:30:00Z',
      closeTime: '2024-01-14T10:15:00Z',
      closeprice: 0.472,
      margin: 3.23,
      pnl: -2.7,
      status: 'closed'
    }
  ];

  useEffect(() => {
    // In a real app, fetch orders from API
    setOrders(mockOrders);
  }, [refreshTrigger]); // Refresh when refreshTrigger changes

  const openOrders = orders.filter(order => order.status === 'open');
  const closedOrders = orders.filter(order => order.status === 'closed');

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const getPnlColor = (pnl?: number) => {
    if (!pnl) return 'text-gray-400';
    return pnl >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderOrderRow = (order: Order) => (
    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">{order.symbol}</span>
          {selectedAsset === order.symbol && (
            <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded-full">Active</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`font-semibold ${getTypeColor(order.type)}`}>
          {order.type.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-white">
        {order.quantity}
      </td>
      <td className="px-4 py-3 text-sm text-white">
        {order.leverage}x
      </td>
      <td className="px-4 py-3 text-sm text-white">
        ${formatPrice(order.openprice)}
      </td>
      {order.status === 'closed' && order.closeprice && (
        <td className="px-4 py-3 text-sm text-white">
          ${formatPrice(order.closeprice)}
        </td>
      )}
      <td className="px-4 py-3 text-sm text-white">
        {formatCurrency(order.margin)}
      </td>
      {order.status === 'closed' && (
        <td className="px-4 py-3 text-sm">
          <span className={`font-semibold ${getPnlColor(order.pnl)}`}>
            {order.pnl ? `${order.pnl > 0 ? '+' : ''}${order.pnl.toFixed(2)}%` : '-'}
          </span>
        </td>
      )}
      <td className="px-4 py-3 text-sm text-gray-400">
        {formatDate(order.openTime)}
      </td>
      {order.status === 'closed' && order.closeTime && (
        <td className="px-4 py-3 text-sm text-gray-400">
          {formatDate(order.closeTime)}
        </td>
      )}
      <td className="px-4 py-3 text-sm">
        {order.status === 'open' ? (
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors">
            Close
          </button>
        ) : (
          <span className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md">
            Closed
          </span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Order History</h3>
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'open'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('open')}
            >
              Open Orders ({openOrders.length})
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'closed'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('closed')}
            >
              Closed Orders ({closedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Loading orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Leverage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Open Price
                </th>
                {activeTab === 'closed' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Close Price
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Margin
                </th>
                {activeTab === 'closed' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    P&L %
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Open Time
                </th>
                {activeTab === 'closed' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Close Time
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {activeTab === 'open' ? (
                openOrders.length > 0 ? (
                  openOrders.map(renderOrderRow)
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No open orders</p>
                        <p className="text-sm">Your open orders will appear here</p>
                      </div>
                    </td>
                  </tr>
                )
              ) : (
                closedOrders.length > 0 ? (
                  closedOrders.map(renderOrderRow)
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No closed orders</p>
                        <p className="text-sm">Your closed orders will appear here</p>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Total Orders: {orders.length}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
