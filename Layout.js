import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Plus, BarChart3, List, Bitcoin, Moon, Sun, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
    description: "Übersicht & Charts",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Trade hinzufügen",
    url: createPageUrl("AddTrade"),
    icon: Plus,
    description: "Neuen Handel erfassen",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    title: "Alle Trades",
    url: createPageUrl("TradesList"),
    icon: List,
    description: "Handelshistorie",
    gradient: "from-orange-500 to-red-600"
  }
];

export default function Layout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 222.2 47.4% 11.2%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222.2 84% 4.9%;
            --radius: 0.75rem;
          }

          .dark {
            --background: 222 47% 8%;
            --foreground: 210 40% 98%;
            --card: 222 47% 11%;
            --card-foreground: 210 40% 98%;
            --popover: 222 47% 11%;
            --popover-foreground: 210 40% 98%;
            --primary: 210 40% 98%;
            --primary-foreground: 222 47% 11%;
            --secondary: 217 32% 15%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217 32% 15%;
            --muted-foreground: 215 20% 65%;
            --accent: 217 32% 17%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 63% 31%;
            --destructive-foreground: 210 40% 98%;
            --border: 217 32% 17%;
            --input: 217 32% 17%;
            --ring: 216 12% 84%;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-950/30">
        <Sidebar className="border-r border-border/40 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 shadow-2xl">
          <SidebarHeader className="border-b border-border/40 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <Bitcoin className="w-6 h-6 text-white drop-shadow-lg" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CryptoTracker
                </h2>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <p className="text-xs text-muted-foreground font-medium">Premium Portfolio</p>
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-6">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-3">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group relative overflow-hidden rounded-2xl p-0 transition-all duration-500 hover:scale-105 ${
                            isActive 
                              ? 'shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/10' 
                              : 'hover:shadow-xl hover:shadow-black/5'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-4 w-full p-4">
                            {/* Background gradients */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${
                              isActive 
                                ? 'from-blue-500 to-purple-600 opacity-100' 
                                : 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 opacity-60 group-hover:opacity-100'
                            } transition-all duration-500`} />
                            
                            {/* Shimmer effect for active item */}
                            {isActive && (
                              <div className="absolute inset-0 shimmer" />
                            )}
                            
                            {/* Icon container */}
                            <div className={`relative z-10 p-3 rounded-xl transition-all duration-300 ${
                              isActive 
                                ? 'bg-white/20 text-white shadow-lg' 
                                : 'bg-white/80 dark:bg-slate-700/80 group-hover:bg-white dark:group-hover:bg-slate-600 text-foreground shadow-md'
                            }`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            
                            {/* Text content */}
                            <div className="relative z-10 flex-1">
                              <div className={`font-bold text-sm transition-colors ${
                                isActive ? 'text-white' : 'text-foreground'
                              }`}>
                                {item.title}
                              </div>
                              <div className={`text-xs transition-colors ${
                                isActive 
                                  ? 'text-white/90' 
                                  : 'text-muted-foreground'
                              }`}>
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Status Card */}
            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Live Portfolio
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kurse werden automatisch über CoinGecko API aktualisiert
              </p>
              <div className="mt-3 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40 p-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-blue-900/50">
            <Button 
              variant="ghost" 
              onClick={toggleTheme} 
              className="w-full justify-start gap-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 group-hover:from-amber-500 group-hover:to-orange-600 transition-all duration-300">
                {theme === "light" ? 
                  <Moon className="w-4 h-4 text-white" /> : 
                  <Sun className="w-4 h-4 text-white" />
                }
              </div>
              <span className="font-medium">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-border/40 px-6 py-4 md:hidden shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-accent/60 p-2 rounded-xl transition-colors backdrop-blur-sm" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bitcoin className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CryptoTracker
                  </h1>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
