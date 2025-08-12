
import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Coins, 
  Plus,
  RefreshCw,
  BarChart3,
  Sparkles,
  Zap
} from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import AssetAllocation from "../components/dashboard/AssetAllocation";
import RecentTrades from "../components/dashboard/RecentTrades";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tradesData = await Trade.list("-created_date");
      setTrades(tradesData);
      await fetchCryptoPrices();
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
    }
    setIsLoading(false);
  };

  const fetchCryptoPrices = async () => {
    setPricesLoading(true);
    try {
      const response = await InvokeLLM({
        prompt: `Hole die aktuellen Kryptowährungskurse in USD für: BTC, ETH, SOL, ADA, DOT, AVAX, LINK, MATIC. 
        Gib die Daten als JSON zurück mit dem Symbol als Schlüssel und dem aktuellen Preis als Wert.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prices: {
              type: "object",
              properties: {
                "BTC": { type: "number" },
                "ETH": { type: "number" },
                "SOL": { type: "number" },
                "ADA": { type: "number" },
                "DOT": { type: "number" },
                "AVAX": { type: "number" },
                "LINK": { type: "number" },
                "MATIC": { type: "number" }
              }
            }
          }
        }
      });
      
      if (response.prices) {
        setCryptoPrices(response.prices);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Kurse:", error);
    }
    setPricesLoading(false);
  };

  const calculatePortfolioMetrics = () => {
    let totalInvestment = 0;
    let currentValue = 0;
    let totalPnL = 0;

    const enrichedTrades = trades.map(trade => {
      // Change made here: using trade.historical_price instead of trade.purchase_price
      const investment = trade.amount * trade.historical_price;
      const currentPrice = cryptoPrices[trade.cryptocurrency] || trade.historical_price;
      const currentTradeValue = trade.amount * currentPrice * trade.leverage;
      const pnl = (currentTradeValue - investment * trade.leverage);
      
      totalInvestment += investment * trade.leverage;
      currentValue += currentTradeValue;
      totalPnL += pnl;

      return {
        ...trade,
        currentPrice,
        currentValue: currentTradeValue,
        pnl,
        pnlPercentage: investment > 0 ? (pnl / (investment * trade.leverage)) * 100 : 0
      };
    });

    return {
      totalInvestment,
      currentValue,
      totalPnL,
      totalPnLPercentage: totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0,
      enrichedTrades
    };
  };

  const metrics = calculatePortfolioMetrics();

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-950/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Portfolio Dashboard
              </h1>
              <div className="flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold">
                  LIVE
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Übersicht deiner Krypto-Trades und Performance in Echtzeit
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={fetchCryptoPrices}
              disabled={pricesLoading}
              className="flex-1 md:flex-none border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${pricesLoading ? 'animate-spin' : ''}`} />
              {pricesLoading ? 'Aktualisiere...' : 'Kurse laden'}
            </Button>
            <Link to={createPageUrl("AddTrade")} className="flex-1 md:flex-none">
              <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-bold">Neuer Trade</span>
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Gesamtinvestition"
            value={`$${metrics.totalInvestment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            gradient="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Portfolio Wert"
            value={`$${metrics.currentValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Coins}
            gradient="from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Gewinn/Verlust"
            value={`$${metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={metrics.totalPnL >= 0 ? TrendingUp : TrendingDown}
            gradient={metrics.totalPnL >= 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600"}
            trend={`${metrics.totalPnLPercentage >= 0 ? '+' : ''}${metrics.totalPnLPercentage.toFixed(2)}%`}
          />
          <StatsCard
            title="Aktive Positionen"
            value={trades.length.toString()}
            icon={BarChart3}
            gradient="from-orange-500 to-amber-600"
          />
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PortfolioChart 
              trades={metrics.enrichedTrades} 
              cryptoPrices={cryptoPrices}
              isLoading={isLoading}
            />
          </div>
          <AssetAllocation 
            trades={metrics.enrichedTrades} 
            isLoading={isLoading}
          />
        </div>

        {/* Enhanced Recent Trades */}
        <RecentTrades 
          trades={metrics.enrichedTrades.slice(0, 5)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
