
import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CRYPTOCURRENCIES = ["Alle", "BTC", "ETH", "SOL", "ADA", "DOT", "AVAX", "LINK", "MATIC"];

export default function TradesList() {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("Alle");
  const [sortBy, setSortBy] = useState("date_desc");
  const [tradeToDelete, setTradeToDelete] = useState(null);

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    filterAndSortTrades();
  }, [trades, searchTerm, selectedCrypto, sortBy, cryptoPrices]);

  const loadTrades = async () => {
    setIsLoading(true);
    try {
      const tradesData = await Trade.list("-created_date");
      setTrades(tradesData);
      await fetchCryptoPrices();
    } catch (error) {
      console.error("Fehler beim Laden der Trades:", error);
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

  const filterAndSortTrades = () => {
    let filtered = trades;

    // Filter nach Suchbegriff
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.cryptocurrency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter nach Kryptowährung
    if (selectedCrypto !== "Alle") {
      filtered = filtered.filter(trade => trade.cryptocurrency === selectedCrypto);
    }

    // Sortieren
    const enrichedTrades = filtered.map(trade => {
      const currentPrice = cryptoPrices[trade.cryptocurrency] || trade.historical_price;
      const investment = trade.amount * trade.historical_price * trade.leverage;
      const currentValue = trade.amount * currentPrice * trade.leverage;
      const pnl = currentValue - investment;
      const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;

      return {
        ...trade,
        currentPrice,
        currentValue,
        pnl,
        pnlPercentage
      };
    });

    enrichedTrades.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.purchase_datetime || b.purchase_date) - new Date(a.purchase_datetime || a.purchase_date);
        case "date_asc":
          return new Date(a.purchase_datetime || a.purchase_date) - new Date(b.purchase_datetime || b.purchase_date);
        case "pnl_desc":
          return b.pnl - a.pnl;
        case "pnl_asc":
          return a.pnl - b.pnl;
        case "value_desc":
          return b.currentValue - a.currentValue;
        case "value_asc":
          return a.currentValue - b.currentValue;
        default:
          return 0;
      }
    });

    setFilteredTrades(enrichedTrades);
  };

  const handleDelete = async () => {
    if (!tradeToDelete) return;
    try {
      await Trade.delete(tradeToDelete);
      setTradeToDelete(null);
      await loadTrades();
    } catch (error) {
      console.error("Fehler beim Löschen des Trades:", error);
    }
  };

  const getCryptoColor = (symbol) => {
    const colors = {
      BTC: "bg-orange-500",
      ETH: "bg-blue-500",
      SOL: "bg-purple-500",
      ADA: "bg-green-500",
      DOT: "bg-pink-500",
      AVAX: "bg-red-500",
      LINK: "bg-blue-600",
      MATIC: "bg-indigo-500"
    };
    return colors[symbol] || "bg-gray-500";
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alle Trades</h1>
            <p className="text-muted-foreground mt-1">
              Vollständige Übersicht deiner Handelshistorie
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={fetchCryptoPrices}
              disabled={pricesLoading}
              className="flex-1 md:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${pricesLoading ? 'animate-spin' : ''}`} />
              Kurse aktualisieren
            </Button>
            <Link to={createPageUrl("AddTrade")} className="flex-1 md:flex-none">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                <Plus className="w-4 h-4 mr-2" />
                Neuer Trade
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Sortierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Kryptowährung" />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTOCURRENCIES.map((crypto) => (
                    <SelectItem key={crypto} value={crypto}>
                      {crypto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Neueste zuerst</SelectItem>
                  <SelectItem value="date_asc">Älteste zuerst</SelectItem>
                  <SelectItem value="pnl_desc">Höchster Gewinn</SelectItem>
                  <SelectItem value="pnl_asc">Höchster Verlust</SelectItem>
                  <SelectItem value="value_desc">Höchster Wert</SelectItem>
                  <SelectItem value="value_asc">Niedrigster Wert</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center">
                {filteredTrades.length} von {trades.length} Trades
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trades List */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Trades werden geladen...</p>
              </div>
            ) : filteredTrades.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Keine Trades gefunden.</p>
                <Link to={createPageUrl("AddTrade")}>
                  <Button>Ersten Trade hinzufügen</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTrades.map((trade) => (
                  <div key={trade.id} className="p-6 hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full ${getCryptoColor(trade.cryptocurrency)} flex items-center justify-center text-white font-bold text-sm`}>
                          {trade.cryptocurrency}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {trade.amount} {trade.cryptocurrency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(trade.purchase_datetime || trade.purchase_date), "dd.MM.yyyy HH:mm")} • 
                            ${(trade.historical_price || trade.purchase_price).toFixed(2)} • 
                            {trade.leverage}x Hebel
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            ${trade.currentValue.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Aktueller Wert
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge 
                            variant={trade.pnl >= 0 ? "default" : "destructive"}
                            className={`${
                              trade.pnl >= 0 
                                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            } font-semibold`}
                          >
                            {trade.pnl >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            ${Math.abs(trade.pnl).toFixed(2)} ({Math.abs(trade.pnlPercentage).toFixed(2)}%)
                          </Badge>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setTradeToDelete(trade.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Trade löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Dieser Vorgang kann nicht rückgängig gemacht werden. Der Trade wird dauerhaft aus deinem Portfolio entfernt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setTradeToDelete(null)}>
                                Abbrechen
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDelete} 
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
