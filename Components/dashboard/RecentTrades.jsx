
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { List, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const CRYPTO_COLORS = {
  BTC: "bg-orange-500",
  ETH: "bg-blue-500", 
  SOL: "bg-purple-500",
  ADA: "bg-green-500",
  DOT: "bg-pink-500",
  AVAX: "bg-red-500",
  LINK: "bg-blue-600",
  MATIC: "bg-indigo-500"
};

export default function RecentTrades({ trades, isLoading }) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5 text-slate-600" />
          Neueste Trades
        </CardTitle>
        <Link to={createPageUrl("TradesList")}>
          <Button variant="outline" size="sm">
            Alle anzeigen
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full" />
                  <div>
                    <div className="h-4 w-20 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">Noch keine Trades vorhanden</p>
            <Link to={createPageUrl("AddTrade")}>
              <Button>Ersten Trade hinzufügen</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${CRYPTO_COLORS[trade.cryptocurrency] || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-xs`}>
                    {trade.cryptocurrency}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {trade.amount} {trade.cryptocurrency}
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(trade.purchase_datetime || trade.purchase_date), "dd.MM.yyyy HH:mm")} • 
                      ${(trade.historical_price || trade.purchase_price).toFixed(2)} • 
                      {trade.leverage}x
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-sm text-slate-900 mb-1">
                    ${(trade.currentValue || 0).toFixed(2)}
                  </div>
                  <Badge 
                    variant={trade.pnl >= 0 ? "default" : "destructive"}
                    className={`${
                      trade.pnl >= 0 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    } text-xs`}
                  >
                    {trade.pnl >= 0 ? (
                      <TrendingUp className="w-2 h-2 mr-1" />
                    ) : (
                      <TrendingDown className="w-2 h-2 mr-1" />
                    )}
                    {Math.abs(trade.pnlPercentage || 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
