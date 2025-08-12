
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { TrendingUp, BarChart } from "lucide-react";

export default function PortfolioChart({ trades, cryptoPrices, isLoading }) {
  const generateChartData = () => {
    if (!trades.length) return [];

    // Sort trades by purchase_datetime, falling back to purchase_date if datetime is not present
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.purchase_datetime || a.purchase_date) - new Date(b.purchase_datetime || b.purchase_date)
    );
    
    const chartData = [];
    let cumulativeInvestment = 0;
    let cumulativeValue = 0;

    sortedTrades.forEach((trade, index) => {
      // Use historical_price if available, otherwise fall back to purchase_price
      const effectivePrice = trade.historical_price || trade.purchase_price;

      cumulativeInvestment += trade.amount * effectivePrice * trade.leverage;
      cumulativeValue += trade.currentValue || (trade.amount * effectivePrice * trade.leverage);

      chartData.push({
        // Use purchase_datetime if available, otherwise fall back to purchase_date for formatting
        date: format(new Date(trade.purchase_datetime || trade.purchase_date), "dd.MM"),
        investment: cumulativeInvestment,
        currentValue: cumulativeValue,
        pnl: cumulativeValue - cumulativeInvestment,
        tradeNumber: index + 1
      });
    });

    return chartData;
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 border border-border/50 rounded-2xl shadow-2xl">
          <p className="font-bold text-foreground mb-3 text-lg">{`${label}`}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <p className="text-blue-600 dark:text-blue-400 font-semibold">
                {`Investition: $${payload[0].payload.investment.toFixed(2)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <p className="text-purple-600 dark:text-purple-400 font-semibold">
                {`Aktueller Wert: $${payload[0].payload.currentValue.toFixed(2)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${payload[0].payload.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className={`font-bold ${payload[0].payload.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {`P&L: $${payload[0].payload.pnl.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b border-border/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
            <BarChart className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Portfolio Performance
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-600" />
              <p className="text-muted-foreground font-medium">Chart wird geladen...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Noch keine Trades vorhanden</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Füge deinen ersten Trade hinzu</p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="currentColor"
                  opacity={0.7}
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="currentColor"
                  opacity={0.7}
                  fontSize={12}
                  fontWeight={500}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="investment"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#investmentGradient)"
                  name="Investition"
                />
                <Area
                  type="monotone"
                  dataKey="currentValue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#valueGradient)"
                  name="Aktueller Wert"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
