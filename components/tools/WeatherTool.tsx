import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer, Sun, Cloud, CloudRain, CloudLightning, Moon, CloudFog, Loader2, Navigation, CloudSnow, CloudDrizzle } from 'lucide-react';

interface WeatherData {
  current: any;
  hourly: any;
  daily: any;
  cityName: string;
}

// WMO Weather Codes Mapping to Lucide Icons & Descriptions
const getWeatherInfo = (code: number, isDay: number) => {
    // 0: Clear
    if (code === 0) return { 
        icon: isDay ? Sun : Moon, 
        desc: 'Ciel dégagé', 
        bg: isDay ? 'from-[#ffd08a] to-[#ff9a8b]' : 'from-[#232526] to-[#414345]' 
    };
    // 1-3: Cloudy
    if (code >= 1 && code <= 3) return { 
        icon: isDay ? CloudSun : Cloud, 
        desc: 'Nuageux', 
        bg: isDay ? 'from-[#bdc3c7] to-[#9aa2a8]' : 'from-[#485461] to-[#28313b]' 
    };
    // 45, 48: Fog
    if (code === 45 || code === 48) return { 
        icon: CloudFog, 
        desc: 'Brouillard', 
        bg: isDay ? 'from-[#bdc3c7] to-[#9aa2a8]' : 'from-[#485461] to-[#28313b]' 
    };
    // 51-57: Drizzle
    if (code >= 51 && code <= 57) return { 
        icon: CloudDrizzle, 
        desc: 'Bruine', 
        bg: isDay ? 'from-[#6a85b6] to-[#bac8e0]' : 'from-[#3a506b] to-[#1c2541]' 
    };
    // 61-67, 80-82: Rain
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { 
        icon: CloudRain, 
        desc: 'Pluie', 
        bg: isDay ? 'from-[#6a85b6] to-[#bac8e0]' : 'from-[#3a506b] to-[#1c2541]' 
    };
    // 71-77, 85-86: Snow
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { 
        icon: CloudSnow, 
        desc: 'Neige', 
        bg: isDay ? 'from-[#83a4d4] to-[#b6fbff]' : 'from-[#2c3e50] to-[#4ca1af]' 
    };
    // 95-99: Thunderstorm
    if (code >= 95) return { 
        icon: CloudLightning, 
        desc: 'Orage', 
        bg: 'from-[#141E30] to-[#243B55]' 
    };

    return { icon: Cloud, desc: 'Inconnu', bg: 'from-zinc-800 to-zinc-900' };
};

// Fallback component for CloudSun since it might be missing in some lucide versions or custom logic
const CloudSun = ({ size, className }: { size?: number, className?: string }) => (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Cloud size={size} className="absolute inset-0" />
        <Sun size={size ? size * 0.6 : 12} className="absolute -top-1 -right-1 text-amber-400" />
    </div>
);

export const WeatherTool: React.FC = () => {
  const [city, setCity] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
      setLoading(true);
      setError(null);
      try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
          const res = await fetch(url);
          const weather = await res.json();
          setData({ ...weather, cityName: name });
      } catch (e) {
          setError("Erreur météo");
      } finally {
          setLoading(false);
      }
  };

  const handleSearch = async () => {
      if (!city) return;
      setLoading(true);
      setError(null);
      try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`);
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
              const { latitude, longitude, name } = geoData.results[0];
              await fetchWeather(latitude, longitude, name);
          } else {
              setError("Ville introuvable");
              setLoading(false);
          }
      } catch (e) {
          setError("Erreur recherche");
          setLoading(false);
      }
  };

  const handleGeolocation = () => {
      if (navigator.geolocation) {
          setLoading(true);
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  fetchWeather(pos.coords.latitude, pos.coords.longitude, "Ma Position");
              },
              () => {
                  setError("Géolocalisation refusée");
                  setLoading(false);
              }
          );
      } else {
          setError("Non supporté");
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
  };

  // Render logic variables
  const weatherInfo = data ? getWeatherInfo(data.current.weather_code, data.current.is_day) : null;
  const CurrentIcon = weatherInfo ? weatherInfo.icon : Cloud;

  return (
    <div className={`w-full h-full flex flex-col p-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${weatherInfo ? weatherInfo.bg : 'from-zinc-900 to-black'}`}>
      
      {/* Header / Search */}
      <div className="p-3 flex gap-2 items-center bg-black/20 backdrop-blur-md z-10 shrink-0 border-b border-white/5">
         <div className="flex-1 relative">
             <input 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ville..."
                className="w-full bg-white/10 border border-white/10 rounded-full py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none transition-colors"
             />
             <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/70" />
         </div>
         <button onClick={handleSearch} disabled={loading} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors disabled:opacity-50">
             {loading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14} />}
         </button>
         <button onClick={handleGeolocation} disabled={loading} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors disabled:opacity-50" title="Utiliser ma position">
             <Navigation size={14} />
         </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
          {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 p-4 text-center">
                  <span className="text-red-300 text-xs font-bold bg-red-900/50 px-3 py-1 rounded-full border border-red-500/30">{error}</span>
              </div>
          )}

          {!data && !loading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-white/50 gap-2">
                  <CloudSun size={48} className="opacity-50" />
                  <span className="text-xs font-medium">Recherchez une ville</span>
              </div>
          )}

          {data && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                  {/* Current Weather - Hero */}
                  <div className="flex flex-col items-center justify-center pt-4 pb-2 text-white drop-shadow-md">
                      <CurrentIcon size={64} className="mb-2 text-white drop-shadow-lg" />
                      <div className="text-5xl font-bold tracking-tighter leading-none mb-1">
                          {Math.round(data.current.temperature_2m)}°
                      </div>
                      <div className="text-sm font-medium opacity-90">{weatherInfo?.desc}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1 flex items-center gap-1">
                          <MapPin size={10} /> {data.cityName}
                      </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-3 gap-2 px-3 py-2">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center border border-white/10">
                          <Wind size={14} className="text-white/70 mb-1" />
                          <span className="text-xs font-bold text-white">{Math.round(data.current.wind_speed_10m)}</span>
                          <span className="text-[8px] uppercase text-white/60">km/h</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center border border-white/10">
                          <Droplets size={14} className="text-white/70 mb-1" />
                          <span className="text-xs font-bold text-white">{data.current.relative_humidity_2m}%</span>
                          <span className="text-[8px] uppercase text-white/60">Hum.</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center border border-white/10">
                          <Thermometer size={14} className="text-white/70 mb-1" />
                          <span className="text-xs font-bold text-white">
                              {Math.round(data.daily.temperature_2m_max[0])}°/{Math.round(data.daily.temperature_2m_min[0])}°
                          </span>
                          <span className="text-[8px] uppercase text-white/60">H/L</span>
                      </div>
                  </div>

                  {/* Hourly Scroll */}
                  <div className="mt-auto mb-2 pl-3">
                      <div className="text-[9px] font-bold text-white/70 uppercase mb-1">Prévisions (12h)</div>
                      <div className="flex gap-3 overflow-x-auto pb-2 pr-3 custom-scrollbar">
                          {data.hourly.time.slice(new Date().getHours(), new Date().getHours() + 12).map((t: string, i: number) => {
                              const time = new Date(t);
                              // We need to map index correctly to data arrays, assuming API returns continuous hourly data from 00:00
                              // The slice above slices the time array, but we need the index relative to the full array to get correct weather code & temp
                              const realIndex = data.hourly.time.indexOf(t);
                              const code = data.hourly.weather_code[realIndex];
                              const temp = data.hourly.temperature_2m[realIndex];
                              const isDay = (time.getHours() >= 6 && time.getHours() <= 20) ? 1 : 0; // Approx logic or use API is_day array if available
                              const info = getWeatherInfo(code, isDay);
                              const Icon = info.icon;

                              return (
                                  <div key={t} className="flex flex-col items-center gap-1 min-w-[36px] bg-white/5 rounded-lg p-1.5 border border-white/5">
                                      <span className="text-[9px] text-white/70 font-mono">{time.getHours()}h</span>
                                      <Icon size={16} className="text-white my-0.5" />
                                      <span className="text-[10px] font-bold text-white">{Math.round(temp)}°</span>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};