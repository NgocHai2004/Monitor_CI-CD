"use client";

import { useState, useEffect, useRef } from "react";
import type { SshServerMetrics } from "@/app/api/ssh-monitor/route";

interface TimelinePoint {
  time: string;
  cpu: number;
  gpu: number;
  ram: number;
  disk: number;
}

interface ServerSlot {
  id: number;
  name: string;
  defaultHost: string;
  defaultPort: number;
  defaultUser: string;
  host: string;
  port: string;
  user: string;
  pass: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  data: SshServerMetrics | null;
  history: TimelinePoint[];
}

const INITIAL_SLOTS: ServerSlot[] = [
  {
    id: 0,
    name: "Máy chủ AI & GPU Cluster (Node #1)",
    defaultHost: "192.168.1.101",
    defaultPort: 22,
    defaultUser: "root",
    host: "",
    port: "22",
    user: "root",
    pass: "••••••••••••",
    isConnected: false,
    isConnecting: false,
    error: null,
    data: null,
    history: [],
  },
  {
    id: 1,
    name: "Máy chủ Web & API Gateway (Node #2)",
    defaultHost: "10.0.0.15",
    defaultPort: 2222,
    defaultUser: "deploy",
    host: "",
    port: "2222",
    user: "deploy",
    pass: "••••••••••••",
    isConnected: false,
    isConnecting: false,
    error: null,
    data: null,
    history: [],
  },
  {
    id: 2,
    name: "Máy chủ Cơ sở dữ liệu Primary DB (Node #3)",
    defaultHost: "172.16.0.8",
    defaultPort: 22,
    defaultUser: "postgres",
    host: "",
    port: "22",
    user: "postgres",
    pass: "••••••••••••",
    isConnected: false,
    isConnecting: false,
    error: null,
    data: null,
    history: [],
  },
  {
    id: 3,
    name: "Máy chủ CI/CD & Build Runner (Node #4)",
    defaultHost: "192.168.2.80",
    defaultPort: 2200,
    defaultUser: "runner",
    host: "",
    port: "2200",
    user: "runner",
    pass: "••••••••••••",
    isConnected: false,
    isConnecting: false,
    error: null,
    data: null,
    history: [],
  },
];

function getBarColor(usage: number) {
  if (usage >= 85) return "bg-rose-500";
  if (usage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export function SshServerMonitor() {
  const [slots, setSlots] = useState<ServerSlot[]>(INITIAL_SLOTS);
  const [maximizedSlot, setMaximizedSlot] = useState<number | null>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  // Real-time polling for connected servers
  useEffect(() => {
    const timer = setInterval(() => {
      slotsRef.current.forEach(async (slot, idx) => {
        if (!slot.isConnected) return;
        try {
          const res = await fetch(
            `/api/ssh-monitor?host=${encodeURIComponent(slot.host)}&port=${slot.port}&user=${encodeURIComponent(
              slot.user
            )}&slot=${idx}`
          );
          if (res.ok) {
            const json: SshServerMetrics = await res.json();
            setSlots((prev) =>
              prev.map((s, i) => {
                if (i !== idx) return s;
                const nowStr = new Date().toLocaleTimeString();
                const newPoint: TimelinePoint = {
                  time: nowStr,
                  cpu: json.metrics.cpu.usage,
                  gpu: json.metrics.gpu.usage,
                  ram: json.metrics.ram.usage,
                  disk: json.metrics.disk.usage,
                };
                const newHistory = [...s.history, newPoint].slice(-24);
                return {
                  ...s,
                  data: json,
                  history: newHistory,
                };
              })
            );
          }
        } catch {
          // ignore network glitch
        }
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Update input fields for a specific slot
  const updateSlotField = (id: number, field: "host" | "port" | "user" | "pass", value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value, error: null } : s))
    );
  };

  // Quick fill preset credentials into slot
  const applyPreset = (id: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              host: s.defaultHost,
              port: String(s.defaultPort),
              user: s.defaultUser,
              error: null,
            }
          : s
      )
    );
  };

  // Connect a single SSH server
  const handleConnectSlot = async (id: number) => {
    const slot = slotsRef.current.find((s) => s.id === id);
    if (!slot) return;

    const trimmedHost = slot.host.trim();
    if (!trimmedHost || trimmedHost.length < 3) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, error: "Vui lòng nhập địa chỉ Host/IP hợp lệ (ví dụ: 192.168.1.100 hoặc domain)" }
            : s
        )
      );
      return;
    }

    const portNum = Number(slot.port);
    if (!portNum || portNum < 1 || portNum > 65535) {
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, error: "Cổng Port phải nằm trong khoảng 1 - 65535" } : s))
      );
      return;
    }

    if (!slot.user.trim()) {
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, error: "Vui lòng nhập tên tài khoản SSH (User)" } : s))
      );
      return;
    }

    // Set loading
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isConnecting: true, error: null } : s))
    );

    try {
      const res = await fetch("/api/ssh-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: trimmedHost,
          port: portNum,
          user: slot.user.trim(),
          slot: id,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        const metricData: SshServerMetrics = result.data;
        const nowStr = new Date().toLocaleTimeString();
        const initialPoint: TimelinePoint = {
          time: nowStr,
          cpu: metricData.metrics.cpu.usage,
          gpu: metricData.metrics.gpu.usage,
          ram: metricData.metrics.ram.usage,
          disk: metricData.metrics.disk.usage,
        };

        setSlots((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  isConnected: true,
                  isConnecting: false,
                  data: metricData,
                  history: [initialPoint],
                  error: null,
                }
              : s
          )
        );
      } else {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  isConnecting: false,
                  error: result.error || "Không thể kết nối SSH tới máy chủ này.",
                }
              : s
          )
        );
      }
    } catch {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, isConnecting: false, error: "Lỗi kết nối máy chủ hoặc mạng không phản hồi." }
            : s
        )
      );
    }
  };

  // Disconnect a slot and return to SSH form
  const handleDisconnectSlot = (id: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              isConnected: false,
              isConnecting: false,
              data: null,
              history: [],
              error: null,
            }
          : s
      )
    );
  };

  // Connect all preset slots at once for rapid demonstration
  const handleConnectAllPresets = async () => {
    for (const slot of INITIAL_SLOTS) {
      applyPreset(slot.id);
    }
    // Give state brief moment then connect
    setTimeout(() => {
      INITIAL_SLOTS.forEach(async (slot) => {
        try {
          const res = await fetch("/api/ssh-monitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              host: slot.defaultHost,
              port: slot.defaultPort,
              user: slot.defaultUser,
              slot: slot.id,
            }),
          });
          const result = await res.json();
          if (res.ok && result.success) {
            const metricData: SshServerMetrics = result.data;
            const nowStr = new Date().toLocaleTimeString();
            const initialPoint: TimelinePoint = {
              time: nowStr,
              cpu: metricData.metrics.cpu.usage,
              gpu: metricData.metrics.gpu.usage,
              ram: metricData.metrics.ram.usage,
              disk: metricData.metrics.disk.usage,
            };
            setSlots((prev) =>
              prev.map((s) =>
                s.id === slot.id
                  ? {
                      ...s,
                      host: slot.defaultHost,
                      port: String(slot.defaultPort),
                      user: slot.defaultUser,
                      isConnected: true,
                      isConnecting: false,
                      data: metricData,
                      history: [initialPoint],
                      error: null,
                    }
                  : s
              )
            );
          }
        } catch {
          // ignore
        }
      });
    }, 100);
  };

  // Disconnect all
  const handleDisconnectAll = () => {
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        isConnected: false,
        isConnecting: false,
        data: null,
        history: [],
        error: null,
      }))
    );
  };

  const connectedCount = slots.filter((s) => s.isConnected).length;
  const visibleSlots = maximizedSlot !== null ? slots.filter((s) => s.id === maximizedSlot) : slots;

  return (
    <div className="flex flex-1 flex-col gap-2 h-full w-full min-h-0 overflow-hidden select-none">
      {/* THANH ĐIỀU KHIỂN TRÊN CÙNG (GỌN GÀNG, KHÔNG CUỘN) */}
      <div className="flex shrink-0 items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-1.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white font-bold text-xs">
            4
          </span>
          <div>
            <h2 className="text-xs font-bold text-zinc-900 leading-tight">
              Lưới Giám sát 4 Cụm Máy chủ SSH (Multi-Host 2x2 Grid)
            </h2>
            <p className="text-[11px] text-zinc-500 leading-none mt-0.5">
              Nhập thông tin SSH chuẩn ở từng bảng để kích hoạt biểu đồ thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700">
            <span
              className={`h-2 w-2 rounded-full ${
                connectedCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
              }`}
            />
            {connectedCount} / 4 máy chủ đang kết nối
          </span>

          {maximizedSlot !== null && (
            <button
              type="button"
              onClick={() => setMaximizedSlot(null)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              ⤢ Trở về lưới 4 bảng
            </button>
          )}

          <button
            type="button"
            onClick={handleConnectAllPresets}
            className="rounded-md bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs transition"
          >
            ⚡ Kết nối tất cả mẫu
          </button>

          {connectedCount > 0 && (
            <button
              type="button"
              onClick={handleDisconnectAll}
              className="rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 transition"
            >
              ✕ Ngắt kết nối tất cả
            </button>
          )}
        </div>
      </div>

      {/* LƯỚI 4 BẢNG (2 CỘT x 2 HÀNG) FIT 100% KHUNG HÌNH (ZERO SCROLL) */}
      <div
        className={`flex-1 min-h-0 w-full gap-2 overflow-hidden ${
          maximizedSlot !== null
            ? "flex flex-col"
            : "grid grid-cols-1 md:grid-cols-2 grid-rows-2"
        }`}
      >
        {visibleSlots.map((slot) => {
          const isMax = maximizedSlot === slot.id;

          return (
            <div
              key={slot.id}
              className="flex flex-col h-full w-full min-h-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-2.5 shadow-2xs transition-all"
            >
              {/* TRƯỜNG HỢP 1: CHƯA KẾT NỐI SSH -> HIỆN FORM NHẬP THÔNG TIN (KHÔNG CÓ BIỂU ĐỒ GIẢ) */}
              {!slot.isConnected ? (
                <div className="flex flex-col h-full w-full min-h-0 justify-between">
                  {/* TIÊU ĐỀ BẢNG SSH */}
                  <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                        #{slot.id + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-800">{slot.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      Chưa kết nối SSH
                    </span>
                  </div>

                  {/* FORM NHẬP THÔNG TIN SSH */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConnectSlot(slot.id);
                    }}
                    className="flex flex-1 flex-col justify-between py-1.5 min-h-0"
                  >
                    <div className="space-y-1.5">
                      {/* Dòng 1: Host & Port */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                            Địa chỉ Host / IP <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={slot.defaultHost}
                            value={slot.host}
                            onChange={(e) => updateSlotField(slot.id, "host", e.target.value)}
                            required
                            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                            Port
                          </label>
                          <input
                            type="number"
                            placeholder={String(slot.defaultPort)}
                            value={slot.port}
                            onChange={(e) => updateSlotField(slot.id, "port", e.target.value)}
                            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Dòng 2: User & Password */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                            Username SSH <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={slot.defaultUser}
                            value={slot.user}
                            onChange={(e) => updateSlotField(slot.id, "user", e.target.value)}
                            required
                            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                            Mật khẩu / SSH Key
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={slot.pass}
                            onChange={(e) => updateSlotField(slot.id, "pass", e.target.value)}
                            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-900 focus:border-blue-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Thông báo lỗi nếu nhập sai */}
                      {slot.error && (
                        <div className="rounded bg-rose-50 border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-700">
                          ⚠️ {slot.error}
                        </div>
                      )}
                    </div>

                    {/* Dòng nút bấm và gợi ý mẫu */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => applyPreset(slot.id)}
                        className="rounded bg-zinc-100 hover:bg-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-700 transition"
                      >
                        Nạp mẫu gợi ý: {slot.defaultHost}
                      </button>

                      <button
                        type="submit"
                        disabled={slot.isConnecting}
                        className="flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-2xs transition disabled:opacity-50"
                      >
                        {slot.isConnecting ? "Đang kết nối..." : "⚡ Kết nối & Mở Biểu đồ"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* TRƯỜNG HỢP 2: ĐÃ KẾT NỐI SSH THÀNH CÔNG -> HIỆN BIỂU ĐỒ THỜI GIAN THỰC & CHỈ SỐ */
                <div className="flex flex-col h-full w-full min-h-0 justify-between">
                  {/* HEADER MÁY CHỦ CONNECTED */}
                  <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 pb-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        SSH LIVE
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {slot.user}@{slot.host}:{slot.port}
                      </span>
                      <span className="text-[10px] text-zinc-400 hidden xl:inline">
                        • {slot.data?.serverInfo.os} ({slot.data?.metrics.pingMs}ms)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMaximizedSlot(isMax ? null : slot.id)}
                        title={isMax ? "Thu nhỏ về lưới" : "Phóng to toàn màn hình"}
                        className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-50"
                      >
                        {isMax ? "⤡ Thu nhỏ" : "⤢ Phóng to"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnectSlot(slot.id)}
                        className="rounded border border-zinc-200 bg-white hover:bg-rose-50 hover:text-rose-600 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 transition"
                      >
                        Đổi / Ngắt SSH
                      </button>
                    </div>
                  </div>

                  {/* 4 THẺ CHỈ SỐ MINI (CPU, GPU, RAM, DISK) */}
                  {slot.data && (
                    <div className="grid grid-cols-4 gap-1.5 shrink-0 mb-1">
                      {/* CPU Mini */}
                      <div className="rounded border border-zinc-100 bg-zinc-50/70 px-2 py-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-tight">
                          <span className="font-bold text-blue-600">CPU</span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            {slot.data.metrics.cpu.usage}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full transition-all duration-500 ${getBarColor(
                              slot.data.metrics.cpu.usage
                            )}`}
                            style={{ width: `${Math.min(100, slot.data.metrics.cpu.usage)}%` }}
                          />
                        </div>
                      </div>

                      {/* GPU Mini */}
                      <div className="rounded border border-zinc-100 bg-zinc-50/70 px-2 py-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-tight">
                          <span className="font-bold text-emerald-600">GPU</span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            {slot.data.metrics.gpu.usage}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full transition-all duration-500 ${getBarColor(
                              slot.data.metrics.gpu.usage
                            )}`}
                            style={{ width: `${Math.min(100, slot.data.metrics.gpu.usage)}%` }}
                          />
                        </div>
                      </div>

                      {/* RAM Mini */}
                      <div className="rounded border border-zinc-100 bg-zinc-50/70 px-2 py-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-tight">
                          <span className="font-bold text-purple-600">RAM</span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            {slot.data.metrics.ram.usage}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full transition-all duration-500 ${getBarColor(
                              slot.data.metrics.ram.usage
                            )}`}
                            style={{ width: `${Math.min(100, slot.data.metrics.ram.usage)}%` }}
                          />
                        </div>
                      </div>

                      {/* DISK Mini */}
                      <div className="rounded border border-zinc-100 bg-zinc-50/70 px-2 py-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 leading-tight">
                          <span className="font-bold text-amber-600">DISK</span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            {slot.data.metrics.disk.usage}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full transition-all duration-500 ${getBarColor(
                              slot.data.metrics.disk.usage
                            )}`}
                            style={{ width: `${Math.min(100, slot.data.metrics.disk.usage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BIỂU ĐỒ SVG THỜI GIAN THỰC ĐỘC LẬP CHO MÁY CHỦ NÀY */}
                  <div className="relative flex-1 min-h-0 w-full rounded border border-zinc-100 bg-zinc-50/40 p-1 flex flex-col justify-between overflow-hidden">
                    {/* Chú giải thông số ngay trên biểu đồ */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 border-b border-zinc-100/80 pb-0.5">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>CPU: {slot.data?.metrics.cpu.usage}%</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>GPU: {slot.data?.metrics.gpu.usage}%</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          <span>RAM: {slot.data?.metrics.ram.usage}%</span>
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400">Tần suất: 2s</span>
                    </div>

                    {/* Vùng vẽ đường SVG */}
                    <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col justify-end pt-1">
                      {/* Lưới ngang */}
                      <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-zinc-300 pointer-events-none select-none">
                        <div className="border-b border-dashed border-zinc-200/60 pb-0.5">100%</div>
                        <div className="border-b border-dashed border-zinc-200/60 pb-0.5">50%</div>
                        <div className="border-b border-zinc-200 pb-0.5">0%</div>
                      </div>

                      <svg
                        className="relative h-full w-full overflow-visible"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                      >
                        {/* Đường CPU (Xanh dương) */}
                        {slot.history.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={slot.history
                              .map((pt, i) => {
                                const x = (i / (slot.history.length - 1)) * 100;
                                const y = 100 - pt.cpu;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}

                        {/* Đường GPU (Xanh lá) */}
                        {slot.history.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={slot.history
                              .map((pt, i) => {
                                const x = (i / (slot.history.length - 1)) * 100;
                                const y = 100 - pt.gpu;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}

                        {/* Đường RAM (Tím) */}
                        {slot.history.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={slot.history
                              .map((pt, i) => {
                                const x = (i / (slot.history.length - 1)) * 100;
                                const y = 100 - pt.ram;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}
                      </svg>
                    </div>

                    {/* Mốc thời gian đáy biểu đồ */}
                    <div className="flex shrink-0 items-center justify-between text-[9px] text-zinc-400 px-1 pt-0.5">
                      <span>48s trước</span>
                      <span>24s trước</span>
                      <span>Live ({slot.history[slot.history.length - 1]?.time || "00:00"})</span>
                    </div>
                  </div>

                  {/* THÔNG SỐ PHẦN CỨNG CHI TIẾT DƯỚI ĐÁY */}
                  {slot.data && (
                    <div className="flex shrink-0 items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-100 mt-1">
                      <div className="truncate max-w-[260px]">
                        <strong className="text-zinc-700">{slot.data.serverInfo.cpuModel.split(" ")[0]}</strong> •{" "}
                        {slot.data.serverInfo.gpuModel.split(" ")[1]} ({slot.data.metrics.gpu.temperature}°C)
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-zinc-600 font-mono text-[9px]">
                        <span>↓ {slot.data.metrics.network.rxKBps} KB/s</span>
                        <span>↑ {slot.data.metrics.network.txKBps} KB/s</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
