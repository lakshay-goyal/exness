import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";
import axios from "axios";

interface TradingViewChartProps {
  selectedAsset?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ selectedAsset = "BTCUSDT" }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [asset, setAsset] = React.useState(selectedAsset);
  const [time, setTime] = React.useState("1m");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const timeIntervals = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "30m", label: "30m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
    { value: "1M", label: "1M" },
  ];

  // Update asset when selectedAsset prop changes
  React.useEffect(() => {
    if (selectedAsset) {
      setAsset(selectedAsset);
    }
  }, [selectedAsset]);

  async function fetchCandles(asset: string, time: string) {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:3000/data/candles?symbol=${asset}&interval=${time}`
      );
      console.log(response.data);

      const formattedData = response.data.data.map((candle: any) => ({
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        time: Math.floor(new Date(candle.time).getTime() / 1000) as UTCTimestamp,
      }));
      console.log(formattedData);
      
      return formattedData;
    } catch (error) {
      console.error("Error fetching candles:", error);
      setError("Failed to fetch chart data");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        textColor: "#d1d5db",
        background: { type: ColorType.Solid, color: "#1f2937" },
      },
      width: chartRef.current.clientWidth,
      height: 500,
      grid: { 
        vertLines: { color: "#374151" }, 
        horzLines: { color: "#374151" }
      },
      timeScale: { 
        timeVisible: true, 
        secondsVisible: false,
        borderColor: "#374151"
      },
      rightPriceScale: {
        borderColor: "#374151",
        textColor: "#d1d5db"
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#3b82f6",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: "#3b82f6",
          width: 1,
          style: 3,
        },
      },
    });

    const candlestick = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const loadData = async () => {
      const candles = await fetchCandles(asset, time);
      if (candles) {
        candlestick.setData(candles);
        chart.timeScale().fitContent();
      }
    };

    loadData();

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [asset, time]);

  return (
    <div className="flex-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">

        {/* Time Interval Selector */}
        <div className="flex items-center space-x-1">
          {timeIntervals.map((interval) => (
            <button
              key={interval.value}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                time === interval.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setTime(interval.value)}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Loading chart...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={chartRef} className="w-full h-[500px] p-4" />
      </div>

      {/* Footer */}
      <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>TradingView Lightweight Charts</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;
