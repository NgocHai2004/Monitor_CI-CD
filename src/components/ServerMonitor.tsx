"use client";

import { useEffect, useState, useTransition } from "react";
import { ProductNetworkMap } from "./ProductNetworkMap";

interface SystemStats {
  timestamp: number;
  cpu: {
    usage: number;
    model: string;
    cores: number;
  };
  gpu: {
    usage: number;
    name: string;
    vram: string;
  };
  ram: {
    usage: number;
    totalGB: string;
    usedGB: string;
  };
  battery: {
    percent: number;
    isCharging: boolean;
    status: string;
  };
  system: {
    hostname: string;
    platform: string;
    arch: string;
    uptime: string;
  };
}

const DEFAULT_STATS: SystemStats = {
  timestamp: Date.now(),
  cpu: { usage: 28, model: "Intel Core i5", cores: 12 },
  gpu: { usage: 16, name: "Intel Iris Xe Graphics", vram: "Shared 2.0 GB" },
  ram: { usage: 62, totalGB: "15.7", usedGB: "9.8" },
  battery: { percent: 98, isCharging: true, status: "Đang cắm sạc (AC)" },
  system: {
    hostname: "DESKTOP-U1TBKNF",
    platform: "Windows Server / Desktop",
    arch: "x64",
    uptime: "17h 30m",
  },
};

function getBarColor(usage: number) {
  if (usage >= 85) return "bg-rose-500";
  if (usage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export function ServerMonitor() {
  const [stats, setStats] = useState<SystemStats>(DEFAULT_STATS);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/system-stats");
        if (res.ok) {
          const data: SystemStats = await res.json();
          startTransition(() => {
            setStats(data);
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải thông số server:", err);
      }
    };

    fetchStats();
    timer = setInterval(fetchStats, 2000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-full flex-1 flex-col gap-2 min-h-0 overflow-hidden">
      {/* 4 CARD PHẦN CỨNG GỌN GÀNG CĂN ĐỀU 4 CỘT (FIT VỪA MÀN HÌNH KHÔNG CUỘN) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 shrink-0">
        {/* 1. CPU */}
        <div className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-2.5 px-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-zinc-800">CPU</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              {stats.cpu.usage}%
            </span>
          </div>

          <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(stats.cpu.usage)}`}
              style={{ width: `${Math.min(100, Math.max(5, stats.cpu.usage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-none">
            <span>{stats.cpu.cores} Nhân</span>
            <span className="max-w-[110px] truncate text-right font-medium text-zinc-600" title={stats.cpu.model}>
              {stats.cpu.model}
            </span>
          </div>
        </div>

        {/* 2. GPU */}
        <div className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-2.5 px-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="8" cy="12" r="2" />
                  <circle cx="16" cy="12" r="2" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-zinc-800">GPU</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              {stats.gpu.usage}%
            </span>
          </div>

          <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(stats.gpu.usage)}`}
              style={{ width: `${Math.min(100, Math.max(5, stats.gpu.usage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-none">
            <span>{stats.gpu.vram}</span>
            <span className="max-w-[110px] truncate text-right font-medium text-zinc-600" title={stats.gpu.name}>
              {stats.gpu.name}
            </span>
          </div>
        </div>

        {/* 3. PIN / NGUỒN */}
        <div className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-2.5 px-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="16" height="10" rx="2" />
                  <path d="M18 10h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-zinc-800">PIN / NGUỒN</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              {stats.battery.percent}%
            </span>
          </div>

          <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full transition-all duration-500 ${
                stats.battery.percent < 20 ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, stats.battery.percent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-none">
            <span>Trạng thái</span>
            <span className="font-medium text-zinc-600 truncate">{stats.battery.status}</span>
          </div>
        </div>

        {/* 4. RAM */}
        <div className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-2.5 px-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-50 text-purple-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-zinc-800">RAM</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              {stats.ram.usage}%
            </span>
          </div>

          <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(stats.ram.usage)}`}
              style={{ width: `${Math.min(100, Math.max(5, stats.ram.usage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-none">
            <span>Đã dùng</span>
            <span className="font-medium text-zinc-600">
              {stats.ram.usedGB} / {stats.ram.totalGB} GB
            </span>
          </div>
        </div>
      </div>

      {/* BẢN ĐỒ MẠNG LƯỚI SẢN PHẨM & NODE (TỰ ĐỘNG GIÃN ĐẦY KHÔNG GIAN CÒN LẠI) */}
      <ProductNetworkMap />

      {/* THANH TRẠNG THÁI MÁY CHỦ SIÊU GỌN Ở ĐÁY (1 DÒNG KHÔNG GÂY SCROLL) */}
      <div className="flex h-5 shrink-0 items-center justify-between text-[11px] text-zinc-500 px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
          <span>•</span>
          <span>Host: {stats.system.hostname}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">OS: {stats.system.platform} ({stats.system.arch})</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Uptime: {stats.system.uptime}</span>
          <span>•</span>
          <span className="text-zinc-400">Đồng bộ: 2s</span>
        </div>
      </div>
    </div>
  );
}
