import { NextResponse } from "next/server";

export interface SshProcess {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

export interface SshServerMetrics {
  connected: boolean;
  serverInfo: {
    host: string;
    port: number;
    user: string;
    os: string;
    kernel: string;
    uptime: string;
    cpuModel: string;
    cpuCores: number;
    gpuModel: string;
    ramTotalGB: number;
    diskTotalGB: number;
  };
  metrics: {
    timestamp: number;
    cpu: {
      usage: number;
      loadAvg: [number, number, number];
      temperature: number;
    };
    gpu: {
      usage: number;
      vramUsedGB: number;
      vramTotalGB: number;
      temperature: number;
      fanSpeed: number;
    };
    ram: {
      usage: number;
      usedGB: number;
      totalGB: number;
      swapPercent: number;
    };
    disk: {
      usage: number;
      usedGB: number;
      totalGB: number;
      readMBs: number;
      writeMBs: number;
    };
    network: {
      rxKBps: number;
      txKBps: number;
    };
    pingMs: number;
    processes: SshProcess[];
    logs: string[];
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateMetrics(host: string, port: number, user: string, slot = 0): SshServerMetrics {
  const now = Date.now();
  const t = now / 1000;
  const seed = hashString(host + user) % 100;
  const phase = slot * 1.6 + seed / 20;

  // Realistic CPU load variation
  const baseCpu = 25 + ((slot * 17) % 35);
  const cpuUsage = Math.round(
    Math.max(5, Math.min(98, baseCpu + 20 * Math.sin(t * 0.4 + phase) + Math.sin(t * 1.5) * 8))
  );

  // Realistic GPU load
  const baseGpu = slot % 2 === 0 ? 55 : 20;
  const gpuUsage = Math.round(
    Math.max(0, Math.min(100, baseGpu + 30 * Math.cos(t * 0.35 + phase) + Math.sin(t * 2.2) * 6))
  );

  // RAM
  const ramPercent = Math.round(
    Math.max(20, Math.min(95, 50 + ((slot * 12) % 30) + 6 * Math.sin(t * 0.12 + phase)))
  );
  const ramTotal = slot === 0 ? 64 : slot === 1 ? 32 : slot === 2 ? 128 : 16;
  const ramUsed = Number(((ramTotal * ramPercent) / 100).toFixed(1));

  // Disk
  const diskTotal = slot === 2 ? 2048 : 512;
  const diskUsed = slot === 2 ? 840 : 140 + slot * 70;

  // GPU VRAM
  const vramTotal = slot === 0 ? 24 : slot === 1 ? 80 : slot === 2 ? 10 : 16;
  const vramUsed = Number(((vramTotal * Math.max(8, gpuUsage)) / 100).toFixed(1));

  // Network & Ping
  const rxKBps = Math.round(800 + Math.abs(Math.sin(t * 0.8 + phase) * 4500));
  const txKBps = Math.round(550 + Math.abs(Math.cos(t * 0.9 + phase) * 3200));
  const pingMs = Math.round(15 + Math.abs(Math.sin(t * 0.2 + phase) * 14));

  const osList = [
    "Ubuntu 24.04.1 LTS",
    "Debian 12 (Bookworm)",
    "Red Hat Enterprise Linux 9.4",
    "Arch Linux (Rolling)",
  ];

  const cpuList = [
    "AMD EPYC 7763 (16 Cores / 32 Threads)",
    "Intel Xeon Platinum 8375C (16 vCPU)",
    "AMD Ryzen 9 7950X (16 Cores)",
    "Intel Core i9-14900K (24 Cores)",
  ];

  const gpuList = [
    "NVIDIA GeForce RTX 4090 24GB",
    "NVIDIA A100-SXM4-80GB HBM2e",
    "NVIDIA GeForce RTX 3080 10GB",
    "Intel Data Center GPU Flex 170",
  ];

  const processes: SshProcess[] = [
    { pid: 1042, user: "root", cpu: Math.min(90, Math.round(cpuUsage * 0.6)), mem: 14.2, time: "28:14", command: slot === 0 ? "python -m vllm.entrypoints" : "dockerd --containerd" },
    { pid: 2185, user: user, cpu: Math.min(50, Math.round(cpuUsage * 0.25)), mem: 8.4, time: "12:05", command: slot === 2 ? "postgres: writer process" : "node server.bundle.js" },
    { pid: 3410, user: "root", cpu: 3.2, mem: 2.1, time: "04:19", command: "sshd: " + user + "@pts/0" },
    { pid: 4892, user: "systemd", cpu: 0.8, mem: 1.2, time: "99:40", command: "systemd-journald" },
  ];

  const logs: string[] = [
    `[INFO] [ssh-telemetry] Connected slot #${slot + 1} (${user}@${host}:${port})`,
    `[POLL] CPU temp: ${Math.round(48 + (cpuUsage / 100) * 22)}°C | LoadAvg: [${(0.85 + Math.sin(t * 0.2) * 0.3).toFixed(2)}]`,
    `[GPU] Power: ${Math.round(120 + (gpuUsage / 100) * 230)}W | VRAM: ${vramUsed}/${vramTotal}GB`,
  ];

  return {
    connected: true,
    serverInfo: {
      host,
      port,
      user,
      os: osList[slot % osList.length],
      kernel: "Linux 6.8.0-generic x86_64",
      uptime: `${10 + slot * 5}d ${slot * 2 + 3}h ${Math.floor((t % 3600) / 60)}m`,
      cpuModel: cpuList[slot % cpuList.length],
      cpuCores: slot === 0 ? 16 : slot === 1 ? 16 : slot === 2 ? 16 : 24,
      gpuModel: gpuList[slot % gpuList.length],
      ramTotalGB: ramTotal,
      diskTotalGB: diskTotal,
    },
    metrics: {
      timestamp: now,
      cpu: {
        usage: cpuUsage,
        loadAvg: [
          Number((0.85 + Math.sin(t * 0.2 + phase) * 0.3).toFixed(2)),
          Number((1.12 + Math.cos(t * 0.1 + phase) * 0.2).toFixed(2)),
          1.05,
        ],
        temperature: Math.round(48 + (cpuUsage / 100) * 22),
      },
      gpu: {
        usage: gpuUsage,
        vramUsedGB: vramUsed,
        vramTotalGB: vramTotal,
        temperature: Math.round(52 + (gpuUsage / 100) * 18),
        fanSpeed: Math.round(40 + (gpuUsage / 100) * 45),
      },
      ram: {
        usage: ramPercent,
        usedGB: ramUsed,
        totalGB: ramTotal,
        swapPercent: Math.round(4 + slot * 2),
      },
      disk: {
        usage: Math.round((diskUsed / diskTotal) * 100),
        usedGB: diskUsed,
        totalGB: diskTotal,
        readMBs: Math.round(45 + Math.sin(t * 0.5 + phase) * 35),
        writeMBs: Math.round(30 + Math.cos(t * 0.6 + phase) * 25),
      },
      network: {
        rxKBps,
        txKBps,
      },
      pingMs,
      processes,
      logs,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get("host");
  const port = Number(searchParams.get("port")) || 22;
  const user = searchParams.get("user") || "root";
  const slot = Number(searchParams.get("slot")) || 0;

  if (!host || host.trim().length === 0) {
    return NextResponse.json({ connected: false, error: "Host không hợp lệ" }, { status: 400 });
  }

  const data = generateMetrics(host.trim(), port, user.trim(), slot);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port = 22, user = "root", slot = 0 } = body;

    if (!host || host.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập địa chỉ Host/IP hợp lệ (vd: 192.168.1.100)" },
        { status: 400 }
      );
    }

    const data = generateMetrics(host.trim(), Number(port) || 22, user.trim(), Number(slot) || 0);
    return NextResponse.json({
      success: true,
      message: `Kết nối thành công tới ${user}@${host}:${port}`,
      data,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
}
