import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import useBidAskValue from "../utils/BidAskValue";
import BidAsk from "../components/BidAsk";
import TradingViewChart from "../components/TradingViewChart";
import OrderPanel from "../components/OrderPanel";
import OrderHistory from "../components/OrderHistory";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { bidAskMap, isConnected, error: wsError } = useBidAskValue();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const currentPrice = selectedAsset && bidAskMap[selectedAsset]
    ? { bid: bidAskMap[selectedAsset].bid, ask: bidAskMap[selectedAsset].ask }
    : undefined;

  const handleOrderPlaced = () => {
    setRefreshTrigger((v) => v + 1);
  };
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // If user data is corrupted, clear it and redirect to signin
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/signin");
      }
    } else {
      // If no user data, try to fetch it from the backend
      fetchUserData();
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user data:", error);
      // On error, clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  return (
    <>
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="text-white text-2xl font-bold">Exness</div>
        <div className="flex items-center space-x-4">
          <span className="text-white hidden md:block">
            Welcome, {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <div className="grid grid-cols-9 h-[calc(100vh-64px)] gap-0 overflow-y-auto">{/* 64px ~ nav height */}
        {/* Left 2/9: BidAsk Sidebar */}
        <div className="col-span-2 h-full">
          <BidAsk
            bidAskMap={bidAskMap}
            isConnected={isConnected}
            error={wsError}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
          />
        </div>

        {/* Center 5/9: Chart area (height = 50vh) + Order History below */}
        <div className="col-span-5 flex flex-col overflow-hidden">
          <div className="flex items-start justify-center h-[100vh] ">
            <TradingViewChart selectedAsset={selectedAsset ?? "BTCUSDT"} heightPx={Math.floor(window.innerHeight * 0.5)} />
          </div>
          <div className="">
            <OrderHistory
              refreshTrigger={refreshTrigger}
              bidAskData={Object.fromEntries(
                Object.entries(bidAskMap).map(([s, { bid, ask }]) => [s, { bid, ask }])
              )}
            />
          </div>
        </div>

        {/* Right 2/9: Order Panel */}
        <div className="col-span-2 text-white">
          <OrderPanel selectedAsset={selectedAsset ?? undefined} currentPrice={currentPrice} onOrderPlaced={handleOrderPlaced} />
        </div>
      </div>


      
    </>
  );
}

export default Dashboard;
