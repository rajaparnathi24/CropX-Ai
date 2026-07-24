'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Droplets, Wind, CloudRain, MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { WeatherData } from '@/types';

export default function WeatherCard() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const district = user?.district || 'Anand';
  const state = user?.state || 'Gujarat';

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.weather.getWeather(district, state);
      setWeather(data);
    } catch {
      console.error('Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [district, state]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading || !weather) {
    return (
      <div className="card-base h-full flex flex-col justify-between p-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-6 bg-muted rounded-full w-24"></div>
        </div>
        <div className="h-16 bg-muted rounded w-1/2 my-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <MapPin size={12} className="text-primary" />
            <span>
              {weather.district}, {weather.state}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Updated at {weather.updatedAt}</p>
        </div>
        <button
          onClick={fetchWeather}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title="Refresh Weather Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main temp */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <div className="flex items-start gap-1">
            <span className="text-5xl font-bold tabular-nums text-foreground leading-none">
              {weather.temperature}
            </span>
            <span className="text-xl font-semibold text-muted-foreground mt-2">°C</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{weather.condition}</p>
        </div>
        <div className="text-4xl mb-1">⛅</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <Droplets size={16} className="text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-bold tabular-nums text-foreground">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <CloudRain size={16} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Rainfall</p>
            <p className="text-sm font-bold tabular-nums text-foreground">{weather.rainfall} mm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <Wind size={16} className="text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-sm font-bold tabular-nums text-foreground">
              {weather.windSpeed} km/h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <MapPin size={16} className="text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">District</p>
            <p className="text-sm font-bold tabular-nums text-foreground truncate">
              {weather.district}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Forecast Strip */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 mt-auto">
        {weather.forecast.map((f, idx) => (
          <div
            key={`forecast-${idx}`}
            className="flex-1 flex-shrink-0 flex flex-col items-center gap-1 rounded-xl bg-muted/40 px-3 py-2 min-w-[70px]"
          >
            <span className="text-xs text-muted-foreground font-medium">{f.day}</span>
            <span className="text-xs font-bold tabular-nums text-foreground">
              {f.tempHigh}° / {f.tempLow}°
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              {f.condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
