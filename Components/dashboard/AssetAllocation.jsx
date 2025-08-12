import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Coins } from "lucide-react";

const COLORS = {
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#9945ff", 
  ADA: "#0d1421",
  DOT: "#e6007a",
  AVAX: "#e84142",
  LINK: "#2a5ada",
  MATIC: "#8247e5"
};

export default function AssetAllocation({ trades, isLoading }) {
  const generateAllocationData = () => {
    if (!trades.length) return [];

    const allocation = {};
    
    trades.forEach(trade => {
      if (!allocation[trade.cryptocurrency]) {
        allocation[trade.cryptocurrency] = 0;
      }
      allocation[trade.cryptocurrency] += trade.currentValue || (trade.amount * trade.purchase_price * trade.leverage);
    });

    return Object.entries(allocation).map(([crypto, value]) => ({
      name: crypto,
      value: value,
      color: COLORS[crypto] || "#64748b"
    }));
  };

  const allocationData = generateAllocationData();
  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{data.payload.name}</p>
          <p className="text-slate-600">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-600" />
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : allocationData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-slate-600">
            Noch keine Assets vorhanden
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              {allocationData.map((asset) => {
                const percentage = totalValue > 0 ? ((asset.value / totalValue) * 100).toFixed(1) : 0;
                return (
                  <div key={asset.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="font-medium text-sm text-slate-700">
                        {asset.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">
                        ${asset.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
