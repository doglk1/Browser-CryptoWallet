import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StatsCard({ title, value, icon: Icon, gradient, trend }) {
  return (
    <Card className="group relative overflow-hidden shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-all duration-500`} />
      
      {/* Decorative elements */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700`} />
      <div className={`absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr ${gradient} opacity-3 rounded-full transform -translate-x-4 translate-y-4`} />
      
      <CardHeader className="relative z-10 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-foreground break-all leading-tight">
              {value}
            </p>
            {trend && (
              <div className="mt-4">
                <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-600 dark:text-green-400">
                  {trend}
                </Badge>
              </div>
            )}
          </div>
          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110`}>
            <Icon className="w-6 h-6 text-white drop-shadow-lg" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
