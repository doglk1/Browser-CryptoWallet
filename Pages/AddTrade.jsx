import React, { useState, useEffect } from "react";
import { Trade } from "@/entities/Trade";
import { InvokeLLM } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Calculator, TrendingUp, Zap, Target, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CRYPTOCURRENCIES = [
  { symbol: "BTC", name: "Bitcoin", color: "bg-orange-500", gradient: "from-orange-400 to-orange-600" },
  { symbol: "ETH", name: "Ethereum", color: "bg-blue-500", gradient: "from-blue-400 to-blue-600" },
  { symbol: "SOL", name: "Solana", color: "bg-purple-500", gradient: "from-purple-400 to-purple-600" },
  { symbol: "ADA", name: "Cardano", color: "bg-green-500", gradient: "from-green-400 to-green-600" },
  { symbol: "DOT", name: "Polkadot", color: "bg-pink-500", gradient: "from-pink-400 to-pink-600" },
  { symbol: "AVAX", name: "Avalanche", color: "bg-red-500", gradient: "from-red-400 to-red-600" },
  { symbol: "LINK", name: "Chainlink", color: "bg-blue-600", gradient: "from-blue-500 to-blue-700" },
  { symbol: "MATIC", name: "Polygon", color: "bg-indigo-500", gradient: "from-indigo-400 to-indigo-600" }
];

export default function AddTrade() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_time: new Date().toTimeString().slice(0, 5),
    cryptocurrency: "",
    amount: "",
    historical_price: "",
    leverage: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.historical_price) {
      setPriceError("Bitte lade erst den historischen Preis");
      return;
    }

    setIsSubmitting(true);
    try {
      const purchaseDateTime = new Date(`${formData.purchase_date}T${formData.purchase_time}:00`);
      
      const tradeData = {
        purchase_datetime: purchaseDateTime.toISOString(),
        cryptocurrency: formData.cryptocurrency,
        amount: parseFloat(formData.amount),
        historical_price: parseFloat(formData.historical_price),
        leverage: parseFloat(formData.leverage),
        total_investment: parseFloat(formData.amount) * parseFloat(formData.historical_price) * parseFloat(formData.leverage)
      };

      await Trade.create(tradeData);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Fehler beim Erstellen des Trades:", error);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset price when date, time, or crypto changes
    if (field === 'purchase_date' || field === 'purchase_time' || field === 'cryptocurrency') {
      setFormData(prev => ({ ...prev, historical_price: "" }));
      setPriceError(null);
    }
  };

  const handleSliderChange = (value) => {
    setFormData(prev => ({ ...prev, leverage: value[0] }));
  };

  const fetchHistoricalPrice = async () => {
    if (!formData.cryptocurrency || !formData.purchase_date || !formData.purchase_time) {
      setPriceError("Bitte wähle zuerst Kryptowährung, Datum und Uhrzeit aus");
      return;
    }

    setIsLoadingPrice(true);
    setPriceError(null);

    try {
      const purchaseDateTime = new Date(`${formData.purchase_date}T${formData.purchase_time}:00`);
      const now = new Date();
      
      // Check if date is in the future
      if (purchaseDateTime > now) {
        setPriceError("Das Datum darf nicht in der Zukunft liegen");
        setIsLoadingPrice(false);
        return;
      }

      const dateString = purchaseDateTime.toISOString().split('T')[0];
      const timeString = purchaseDateTime.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      });

      const response = await InvokeLLM({
        prompt: `Hole den historischen Kryptowährungskurs für ${formData.cryptocurrency} am ${dateString} um ${timeString} UTC. 
        Wenn der exakte Zeitpunkt nicht verfügbar ist, verwende den nächstmöglichen verfügbaren Kurs von diesem Tag.
        Gib den Preis in USD zurück.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            price: { type: "number" },
            timestamp: { type: "string" },
            currency: { type: "string" }
          }
        }
      });
      
      if (response.price && response.price > 0) {
        setFormData(prev => ({ 
          ...prev, 
          historical_price: response.price.toString()
        }));
      } else {
        throw new Error("Kein gültiger Preis erhalten");
      }
    } catch (error) {
      console.error("Fehler beim Laden des historischen Preises:", error);
      setPriceError("Fehler beim Laden des historischen Preises. Bitte versuche es erneut oder gib den Preis manuell ein.");
    }
    setIsLoadingPrice(false);
  };

  const calculateTotalInvestment = () => {
    const amount = parseFloat(formData.amount) || 0;
    const price = parseFloat(formData.historical_price) || 0;
    const leverage = parseFloat(formData.leverage) || 1;
    return amount * price * leverage;
  };

  const selectedCrypto = CRYPTOCURRENCIES.find(c => c.symbol === formData.cryptocurrency);

  const getLeverageColor = (leverage) => {
    if (leverage <= 5) return "from-green-500 to-emerald-600";
    if (leverage <= 20) return "from-yellow-500 to-orange-600";
    if (leverage <= 50) return "from-orange-500 to-red-600";
    return "from-red-500 to-rose-700";
  };

  const getLeverageRisk = (leverage) => {
    if (leverage <= 5) return { text: "Niedrig", color: "text-green-600" };
    if (leverage <= 20) return { text: "Mittel", color: "text-yellow-600" };
    if (leverage <= 50) return { text: "Hoch", color: "text-orange-600" };
    return { text: "Sehr Hoch", color: "text-red-600" };
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-950/30 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center gap-6 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="shrink-0 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Neuen Trade hinzufügen
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Erfasse deine Kryptowährung-Käufe mit historischen Marktpreisen
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-3xl transition-all duration-500">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b border-border/30">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Trade Details
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Datum und Uhrzeit */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <Label className="text-lg font-bold text-foreground">Kaufzeitpunkt</Label>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="purchase_date" className="text-base font-semibold text-foreground">
                      Datum
                    </Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="bg-muted/50 border-2 border-border/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-lg py-3 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="purchase_time" className="text-base font-semibold text-foreground">
                      Uhrzeit (UTC)
                    </Label>
                    <Input
                      id="purchase_time"
                      type="time"
                      value={formData.purchase_time}
                      onChange={(e) => handleInputChange('purchase_time', e.target.value)}
                      required
                      className="bg-muted/50 border-2 border-border/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-lg py-3 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Kryptowährung */}
              <div className="space-y-3">
                <Label className="text-base font-bold text-foreground">
                  Kryptowährung
                </Label>
                <Select 
                  value={formData.cryptocurrency} 
                  onValueChange={(value) => handleInputChange('cryptocurrency', value)}
                >
                  <SelectTrigger className="bg-muted/50 border-2 border-border/50 focus:border-blue-500 rounded-xl text-lg py-3 transition-all duration-300">
                    <SelectValue placeholder="Kryptowährung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRYPTOCURRENCIES.map((crypto) => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        <div className="flex items-center gap-3 py-1">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${crypto.gradient} shadow-lg`} />
                          <span className="font-bold">{crypto.symbol}</span>
                          <span className="text-muted-foreground">- {crypto.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCrypto && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`bg-gradient-to-r ${selectedCrypto.gradient} text-white border-0 font-bold px-4 py-2`}>
                      <div className={`w-3 h-3 rounded-full bg-white/30 mr-2`} />
                      {selectedCrypto.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Historischer Preis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Historischer Marktpreis
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchHistoricalPrice}
                    disabled={isLoadingPrice || !formData.cryptocurrency || !formData.purchase_date || !formData.purchase_time}
                    className="hover:bg-blue-500/10 hover:border-blue-500/50"
                  >
                    {isLoadingPrice ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                        Lade Preis...
                      </>
                    ) : (
                      "Preis laden"
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.historical_price}
                      onChange={(e) => handleInputChange('historical_price', e.target.value)}
                      placeholder="Wird automatisch geladen..."
                      required
                      className="bg-muted/50 border-2 border-border/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-lg py-3 transition-all duration-300"
                      readOnly={isLoadingPrice}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="amount" className="text-base font-bold text-foreground">
                      Kaufmenge
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="z.B. 0.5"
                      required
                      className="bg-muted/50 border-2 border-border/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-lg py-3 transition-all duration-300"
                    />
                  </div>
                </div>

                {priceError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{priceError}</AlertDescription>
                  </Alert>
                )}

                {formData.historical_price && !isLoadingPrice && (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      Historischer Preis erfolgreich geladen: ${parseFloat(formData.historical_price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Enhanced Hebel Slider */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label htmlFor="leverage" className="text-base font-bold text-foreground">
                    Hebel (Leverage)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-2xl font-bold px-4 py-2 bg-gradient-to-r ${getLeverageColor(formData.leverage)} text-white border-0 shadow-lg`}>
                      {formData.leverage}x
                    </Badge>
                    <Badge variant="outline" className={`px-3 py-1 ${getLeverageRisk(formData.leverage).color} border-current`}>
                      Risiko: {getLeverageRisk(formData.leverage).text}
                    </Badge>
                  </div>
                </div>
                
                <div className="px-4 py-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl border border-blue-500/20">
                  <Slider
                    id="leverage"
                    min={1}
                    max={125}
                    step={1}
                    value={[formData.leverage]}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-4 px-2">
                    <span>1x (Sicher)</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>100x</span>
                    <span>125x (Extrem)</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Berechnungszusammenfassung */}
              {formData.amount && formData.historical_price && (
                <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-blue-500/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                        <Calculator className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Investitionszusammenfassung
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-muted-foreground font-medium">Historischer Preis:</span>
                        <span className="font-bold text-lg text-foreground">
                          ${parseFloat(formData.historical_price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-muted-foreground font-medium">Grundinvestition:</span>
                        <span className="font-bold text-lg text-foreground">
                          ${(parseFloat(formData.amount) * parseFloat(formData.historical_price)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-muted-foreground font-medium">Hebel:</span>
                        <Badge className={`bg-gradient-to-r ${getLeverageColor(formData.leverage)} text-white font-bold text-lg px-4 py-1`}>
                          {formData.leverage}x
                        </Badge>
                      </div>
                      <div className="h-px bg-gradient-to-r from-blue-500/20 via-purple-500/40 to-blue-500/20" />
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                        <span className="font-bold text-xl text-foreground">Gesamtinvestition:</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${calculateTotalInvestment().toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.historical_price}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 shadow-2xl hover:shadow-blue-500/25 text-white font-bold py-4 text-lg rounded-2xl transition-all duration-500 hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white mr-3" />
                    Trade wird gespeichert...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Trade hinzufügen
                    <Zap className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
