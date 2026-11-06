"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

export interface NodeItem {
  id: string;
  label: string;
  type: "core" | "service" | "controller" | "database" | "cicd";
  color: string;
  glow: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  radius: number;
  cluster: string;
  status: "healthy" | "building" | "warning";
  details: {
    version: string;
    repo: string;
    cicdStatus: "Passed" | "Running" | "Failed";
    branch: string;
    description: string;
    lastCommit: string;
  };
}

export interface LinkItem {
  source: string;
  target: string;
  color?: string;
}

const INITIAL_NODES: NodeItem[] = [
  // Cluster User (Blue)
  {
    id: "user",
    label: "User",
    type: "core",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.6)",
    x: 260,
    y: 220,
    radius: 34,
    cluster: "User",
    status: "healthy",
    details: {
      version: "v2.4.1",
      repo: "github.com/corp/user-core",
      cicdStatus: "Passed",
      branch: "main",
      description: "Dịch vụ xác thực và quản lý tài khoản người dùng tập trung.",
      lastCommit: "feat: add oauth2 provider (#84)",
    },
  },
  {
    id: "user-controller",
    label: "UserController",
    type: "controller",
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.5)",
    x: 230,
    y: 90,
    radius: 18,
    cluster: "User",
    status: "healthy",
    details: {
      version: "v2.4.1",
      repo: "github.com/corp/user-api",
      cicdStatus: "Passed",
      branch: "main",
      description: "REST API Endpoint xử lý yêu cầu hồ sơ người dùng.",
      lastCommit: "fix: sanitize user profile input",
    },
  },
  {
    id: "auth-controller",
    label: "AuthController",
    type: "controller",
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.5)",
    x: 130,
    y: 150,
    radius: 18,
    cluster: "User",
    status: "healthy",
    details: {
      version: "v2.1.0",
      repo: "github.com/corp/auth-service",
      cicdStatus: "Passed",
      branch: "main",
      description: "Xử lý đăng nhập, cấp phát JWT và SSO.",
      lastCommit: "chore: update token expiry to 24h",
    },
  },
  {
    id: "user-repo",
    label: "UserRepository",
    type: "service",
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.5)",
    x: 100,
    y: 240,
    radius: 17,
    cluster: "User",
    status: "healthy",
    details: {
      version: "v1.9.0",
      repo: "github.com/corp/user-repo",
      cicdStatus: "Passed",
      branch: "main",
      description: "Tầng truy vấn dữ liệu người dùng qua ORM.",
      lastCommit: "perf: cache user lookups in Redis",
    },
  },
  {
    id: "jwt-auth",
    label: "JWTAuth",
    type: "service",
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.5)",
    x: 120,
    y: 330,
    radius: 16,
    cluster: "User",
    status: "healthy",
    details: {
      version: "v1.2.0",
      repo: "github.com/corp/jwt-middleware",
      cicdStatus: "Passed",
      branch: "main",
      description: "Middleware xác thực chữ ký token mã hóa RSA-256.",
      lastCommit: "sec: key rotation verification",
    },
  },
  {
    id: "user-table",
    label: "UserTable",
    type: "database",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.6)",
    x: 80,
    y: 430,
    radius: 18,
    cluster: "User",
    status: "healthy",
    details: {
      version: "PostgreSQL 16",
      repo: "internal://db-cluster-01",
      cicdStatus: "Passed",
      branch: "production",
      description: "Cơ sở dữ liệu người dùng PostgreSQL có Read Replica.",
      lastCommit: "migration: add two_factor_secret column",
    },
  },

  // Cluster Order (Green)
  {
    id: "order",
    label: "Order",
    type: "core",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.6)",
    x: 520,
    y: 340,
    radius: 34,
    cluster: "Order",
    status: "building",
    details: {
      version: "v3.0.0-rc2",
      repo: "github.com/corp/order-service",
      cicdStatus: "Running",
      branch: "develop",
      description: "Sản phẩm xử lý đơn hàng, thanh toán và checkout.",
      lastCommit: "refactor: payment checkout flow with Stripe",
    },
  },
  {
    id: "order-service",
    label: "OrderService",
    type: "service",
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.5)",
    x: 600,
    y: 110,
    radius: 18,
    cluster: "Order",
    status: "healthy",
    details: {
      version: "v3.0.0",
      repo: "github.com/corp/order-worker",
      cicdStatus: "Passed",
      branch: "main",
      description: "Worker xử lý state machine đơn hàng bất đồng bộ.",
      lastCommit: "fix: retry failed webhook notifications",
    },
  },
  {
    id: "order-repo",
    label: "OrderRepo",
    type: "service",
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.5)",
    x: 710,
    y: 170,
    radius: 17,
    cluster: "Order",
    status: "healthy",
    details: {
      version: "v2.8.0",
      repo: "github.com/corp/order-db-layer",
      cicdStatus: "Passed",
      branch: "main",
      description: "Tầng truy vấn DB đơn đặt hàng phân tán.",
      lastCommit: "chore: index on customer_id & status",
    },
  },
  {
    id: "order-item",
    label: "OrderItem",
    type: "service",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    x: 480,
    y: 460,
    radius: 17,
    cluster: "Order",
    status: "healthy",
    details: {
      version: "v2.2.0",
      repo: "github.com/corp/order-item-model",
      cicdStatus: "Passed",
      branch: "main",
      description: "Chi tiết các mặt hàng trong giỏ và đơn.",
      lastCommit: "feat: support bundle product pricing",
    },
  },

  // Cluster Project (Amber)
  {
    id: "project",
    label: "Project",
    type: "core",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.6)",
    x: 740,
    y: 430,
    radius: 34,
    cluster: "Project",
    status: "healthy",
    details: {
      version: "v1.8.5",
      repo: "github.com/corp/project-mgmt",
      cicdStatus: "Passed",
      branch: "main",
      description: "Nền tảng quản lý dự án, sprint và backlog.",
      lastCommit: "feat: kanban drag-and-drop auto sync",
    },
  },
  {
    id: "project-api",
    label: "ProjectAPI",
    type: "controller",
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.5)",
    x: 870,
    y: 380,
    radius: 18,
    cluster: "Project",
    status: "healthy",
    details: {
      version: "v1.8.5",
      repo: "github.com/corp/project-api",
      cicdStatus: "Passed",
      branch: "main",
      description: "Gateway API xử lý nghiệp vụ dự án và công việc.",
      lastCommit: "docs: update openapi specification",
    },
  },
  {
    id: "task-worker",
    label: "TaskWorker",
    type: "service",
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.5)",
    x: 820,
    y: 530,
    radius: 17,
    cluster: "Project",
    status: "warning",
    details: {
      version: "v1.4.2",
      repo: "github.com/corp/task-queue",
      cicdStatus: "Failed",
      branch: "feature/cron-job",
      description: "Xử lý thông báo deadline và tính toán tiến độ.",
      lastCommit: "test: mock redis queue for notifications",
    },
  },
];

const INITIAL_LINKS: LinkItem[] = [
  // User cluster links
  { source: "user", target: "user-controller", color: "#60a5fa" },
  { source: "user", target: "auth-controller", color: "#60a5fa" },
  { source: "user", target: "user-repo", color: "#38bdf8" },
  { source: "user-repo", target: "jwt-auth", color: "#38bdf8" },
  { source: "user-repo", target: "user-table", color: "#a855f7" },
  { source: "auth-controller", target: "jwt-auth", color: "#60a5fa" },

  // Inter-cluster User -> Order
  { source: "user", target: "order", color: "#3b82f6" },

  // Order cluster links
  { source: "order", target: "order-service", color: "#34d399" },
  { source: "order-service", target: "order-repo", color: "#34d399" },
  { source: "order", target: "order-item", color: "#10b981" },
  { source: "user", target: "order-service", color: "#60a5fa" },

  // Inter-cluster Order -> Project
  { source: "order", target: "project", color: "#10b981" },

  // Project cluster links
  { source: "project", target: "project-api", color: "#fbbf24" },
  { source: "project", target: "task-worker", color: "#fbbf24" },
  { source: "order-repo", target: "project", color: "#34d399" },
];

export function ProductNetworkMap() {
  const [nodes, setNodes] = useState<NodeItem[]>(INITIAL_NODES);
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<NodeItem | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // New Node Form State
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<NodeItem["type"]>("core");
  const [newConnectTo, setNewConnectTo] = useState("user");
  const [newRepo, setNewRepo] = useState("");

  // Canvas Pan & Zoom
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Dragging Node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Theme: Nền trắng mặc định
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Filter
  const [filterCluster, setFilterCluster] = useState<string>("all");

  // Load from localStorage on mount
  useEffect(() => {
    setHasMounted(true);
    try {
      const savedNodes = localStorage.getItem("monitor_network_nodes");
      const savedLinks = localStorage.getItem("monitor_network_links");
      if (savedNodes) {
        const parsed = JSON.parse(savedNodes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNodes(parsed);
          setSelectedNode(parsed[0]);
          return;
        }
      }
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
    } catch {
      // fallback
    }
    setSelectedNode(INITIAL_NODES[0]);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem("monitor_network_nodes", JSON.stringify(nodes));
      localStorage.setItem("monitor_network_links", JSON.stringify(links));
    } catch {
      // ignore
    }
  }, [nodes, links, hasMounted]);

  // Keyboard shortcut to delete selected node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        setNodeToDelete(selectedNode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode]);

  const filteredNodes = useMemo(() => {
    if (filterCluster === "all") return nodes;
    return nodes.filter((n) => n.cluster === filterCluster);
  }, [nodes, filterCluster]);

  const clusters = useMemo(() => {
    const set = new Set(nodes.map((n) => n.cluster));
    return Array.from(set);
  }, [nodes]);

  // Handle Dragging
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingNodeId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setSelectedNode(node);
      setNewConnectTo(node.id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggingNodeId ? { ...node, x: mouseX, y: mouseY } : node
        )
      );
    } else if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.PointerEvent) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Reset to default network
  const handleResetToDefault = () => {
    if (confirm("Khôi phục bản đồ về kiến trúc mặc định ban đầu?")) {
      setNodes(INITIAL_NODES);
      setLinks(INITIAL_LINKS);
      setSelectedNode(INITIAL_NODES[0]);
      localStorage.removeItem("monitor_network_nodes");
      localStorage.removeItem("monitor_network_links");
    }
  };

  // Execute Deleting a Node
  const executeDeleteNode = () => {
    if (!nodeToDelete) return;
    const targetId = nodeToDelete.id;

    // Remove node
    const remainingNodes = nodes.filter((n) => n.id !== targetId);
    setNodes(remainingNodes);

    // Remove connected links
    setLinks((prev) =>
      prev.filter((l) => l.source !== targetId && l.target !== targetId)
    );

    // Update selection
    if (selectedNode?.id === targetId) {
      setSelectedNode(remainingNodes[0] || null);
    }

    setNodeToDelete(null);
  };

  // Add new Product / Node
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const id =
      newLabel.toLowerCase().replace(/[^a-z0-9]/g, "-") +
      "-" +
      Date.now().toString().slice(-4);
    const parentNode = nodes.find((n) => n.id === newConnectTo) || selectedNode || nodes[0];

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNode: NodeItem = {
      id,
      label: newLabel.trim(),
      type: "service",
      color: parentNode ? parentNode.color : randomColor,
      glow: parentNode ? parentNode.glow : "rgba(59, 130, 246, 0.5)",
      x: (parentNode ? parentNode.x : 400) + (Math.random() * 120 - 60),
      y: (parentNode ? parentNode.y : 300) + (Math.random() * 120 - 60),
      radius: 20,
      cluster: parentNode?.cluster || newLabel.trim(),
      status: "healthy",
      details: {
        version: "v1.0.0",
        repo: `github.com/project/${id}`,
        cicdStatus: "Passed",
        branch: "main",
        description: `Node ${newLabel.trim()}`,
        lastCommit: "initial commit",
      },
    };

    setNodes((prev) => [...prev, newNode]);
    if (parentNode) {
      setLinks((prev) => [
        ...prev,
        { source: parentNode.id, target: id, color: parentNode.color },
      ]);
    }
    setSelectedNode(newNode);
    setNewLabel("");
    setIsAdding(false);
  };

  // Map of nodes for quick coordinate lookups
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeItem>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0 overflow-hidden">
      {/* HEADER BẢN ĐỒ & THANH CÔNG CỤ THU GỌN */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 shadow-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Bản đồ Mạng lưới Sản phẩm
          </h2>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {nodes.length} Nodes
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc cụm */}
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
            <span>Cụm:</span>
            <select
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 outline-none"
            >
              <option value="all">Tất cả</option>
              {clusters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Đổi giao diện Nền Trắng / Tối */}
          <button
            type="button"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            title="Chuyển đổi màu nền bản đồ"
          >
            {isDarkTheme ? <>☀️ Trắng</> : <>🌙 Tối</>}
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={resetView}
            className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            title="Đặt lại góc nhìn"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Căn giữa ({Math.round(scale * 100)}%)
          </button>

          {/* Khôi phục mặc định */}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            title="Khôi phục lại danh sách node ban đầu"
          >
            ⟲ Mặc định
          </button>

          {/* Nút Thêm sản phẩm mới (Tạo Node) */}
          <button
            type="button"
            onClick={() => {
              if (selectedNode) setNewConnectTo(selectedNode.id);
              setIsAdding(true);
            }}
            className="flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            + Thêm Node
          </button>
        </div>
      </div>

      {/* KHUNG VẼ BẢN ĐỒ TOÀN MÀN HÌNH (FLEX-1 TỰ ĐỘNG KHỚP CHIỀU CAO KHÔNG CUỘN) */}
      <div
        className={`relative flex-1 min-h-0 w-full overflow-hidden rounded-xl border select-none transition-colors duration-200 ${
          isDarkTheme
            ? "border-zinc-900/60 bg-[#090d16] shadow-xl"
            : "border-zinc-200 bg-white shadow-xs"
        }`}
        onWheel={handleWheel}
      >
        {/* Lưới toạ độ nền */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity"
          style={{
            backgroundImage: isDarkTheme
              ? "radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)"
              : "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
            backgroundSize: "28px 28px",
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: isDarkTheme ? 0.2 : 0.6,
          }}
        />

        {/* Hướng dẫn thao tác nhanh ở góc dưới */}
        <div
          className={`pointer-events-none absolute bottom-3 left-4 z-10 flex flex-wrap items-center gap-2 text-[11px] ${
            isDarkTheme
              ? "text-zinc-400"
              : "rounded-md border border-zinc-200/80 bg-white/85 px-2.5 py-1 text-zinc-500 shadow-xs backdrop-blur-xs"
          }`}
        >
          <span>🖱️ Kéo thả di chuyển</span>
          <span>•</span>
          <span>🔍 Cuộn chuột Zoom</span>
          <span>•</span>
          <span>👆 Click vào Node để Thêm / Xóa</span>
        </div>

        {/* THANH THAO TÁC NHANH KHI CLICK VÀO NODE (CHỈ THÊM NODE VÀ XÓA NODE) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-2 border-r border-zinc-200 pr-3">
              <span
                className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: selectedNode.color }}
              />
              <span className="font-semibold text-sm text-zinc-900 max-w-[160px] truncate">
                {selectedNode.label}
              </span>
            </div>

            {/* Nút Thêm Node */}
            <button
              type="button"
              onClick={() => {
                setNewConnectTo(selectedNode.id);
                setIsAdding(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <span>➕</span> Thêm node
            </button>

            {/* Nút Xóa Node */}
            <button
              type="button"
              onClick={() => setNodeToDelete(selectedNode)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
            >
              <span>🗑️</span> Xóa node
            </button>

            {/* Bỏ chọn */}
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="ml-1 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        )}

        {/* SVG Map */}
        <svg
          ref={svgRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={handleStartPan}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isDarkTheme ? 6 : 4} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-sub" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isDarkTheme ? 3 : 2} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {/* CÁC ĐƯỜNG KẾT NỐI (LINKS / EDGES) */}
            {links.map((link, idx) => {
              const s = nodeMap.get(link.source);
              const t = nodeMap.get(link.target);
              if (!s || !t) return null;

              const isHighlight =
                selectedNode &&
                (selectedNode.id === s.id || selectedNode.id === t.id);

              return (
                <g key={`${link.source}-${link.target}-${idx}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={
                      isHighlight
                        ? "#2563eb"
                        : link.color || (isDarkTheme ? "#334155" : "#cbd5e1")
                    }
                    strokeWidth={isHighlight ? 2.5 : 1.5}
                    strokeOpacity={isHighlight ? 1 : isDarkTheme ? 0.45 : 0.65}
                  />

                  {/* Hạt photon chuyển động */}
                  <circle
                    r={isHighlight ? 3 : 2}
                    fill={
                      isHighlight
                        ? isDarkTheme
                          ? "#ffffff"
                          : "#1d4ed8"
                        : link.color || "#3b82f6"
                    }
                  >
                    <animateMotion
                      path={`M ${s.x} ${s.y} L ${t.x} ${t.y}`}
                      dur={`${3 + (idx % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {/* CÁC NỐT SẢN PHẨM (NODES) */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isCore = node.type === "core";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-75"
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                >
                  {/* Hào quang phát sáng (Aura Glow) */}
                  <circle
                    r={node.radius + (isCore ? (isDarkTheme ? 12 : 8) : isDarkTheme ? 6 : 4)}
                    fill={node.glow}
                    opacity={
                      isDarkTheme
                        ? isSelected
                          ? 0.8
                          : 0.35
                        : isSelected
                        ? 0.45
                        : 0.2
                    }
                    filter={isCore ? "url(#glow-core)" : "url(#glow-sub)"}
                  />

                  {/* Vòng viền ngoài khi được chọn */}
                  {isSelected && (
                    <circle
                      r={node.radius + 5}
                      fill="none"
                      stroke={isDarkTheme ? "#ffffff" : "#2563eb"}
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ transformOrigin: "0 0", animationDuration: "12s" }}
                    />
                  )}

                  {/* Hình cầu chính của node */}
                  <circle
                    r={node.radius}
                    fill={node.color}
                    stroke={
                      isSelected
                        ? isDarkTheme
                          ? "#ffffff"
                          : "#1e293b"
                        : isDarkTheme
                        ? "rgba(255, 255, 255, 0.4)"
                        : "#ffffff"
                    }
                    strokeWidth={isSelected ? 2.5 : 2}
                    className={isDarkTheme ? "shadow-md" : "shadow-sm"}
                  />

                  {/* Chấm trạng thái */}
                  <circle
                    cx={node.radius * 0.7}
                    cy={-node.radius * 0.7}
                    r={4}
                    fill={
                      node.status === "healthy"
                        ? "#22c55e"
                        : node.status === "building"
                        ? "#3b82f6"
                        : "#f59e0b"
                    }
                    stroke={isDarkTheme ? "#090d16" : "#ffffff"}
                    strokeWidth="1.5"
                  />

                  {/* Tên hiển thị bên trong hoặc phía dưới node */}
                  {isCore ? (
                    <text
                      textAnchor="middle"
                      dy=".35em"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="600"
                      className="pointer-events-none drop-shadow-sm select-none"
                    >
                      {node.label}
                    </text>
                  ) : (
                    <text
                      textAnchor="middle"
                      y={node.radius + 14}
                      fill={isDarkTheme ? "#e2e8f0" : "#0f172a"}
                      fontSize="11"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* MODAL XÁC NHẬN XÓA NODE */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-zinc-100">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg">
                🗑️
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                Xóa Node "{nodeToDelete.label}"?
              </h3>
            </div>

            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Node này và các đường dây liên kết sẽ được xóa khỏi bản đồ.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNodeToDelete(null)}
                className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeDeleteNode}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-rose-700"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM NODE GỌN GÀNG (CHỈ NHẬP TÊN NODE) */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-semibold text-zinc-900">
                Thêm Node mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Tên Node:
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên node (VD: Payment, Worker, Analytics...)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {selectedNode && (
                <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded border border-zinc-100">
                  🔗 Tự động liên kết vào node:{" "}
                  <strong className="text-zinc-800">{selectedNode.label}</strong>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg border border-zinc-200 px-3.5 py-1.5 font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white shadow hover:bg-blue-700"
                >
                  Tạo Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
