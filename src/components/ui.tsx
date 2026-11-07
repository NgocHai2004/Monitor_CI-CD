import type { ReactNode } from "react";

/** Khung chung của mọi trang: bề rộng, padding, tiêu đề, mô tả. */
export function Page({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col px-4 py-2.5 overflow-hidden">
      <header className="mb-2 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
            {title}
          </h1>
          <p className="text-xs text-zinc-500 leading-tight mt-0.5">{description}</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Ô số liệu: nhãn + giá trị. Chưa có dữ liệu nên không có delta/sparkline. */
export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center text-base text-zinc-500">
      {children}
    </div>
  );
}

const ICON = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "shrink-0",
};

/** Bộ icon tối giản, vẽ bằng hình học cơ bản — không thêm thư viện icon. */
export function NavIcon({ name }: { name: string }) {
  switch (name) {
    case "server":
      return (
        <svg {...ICON}>
          <rect x="3" y="4" width="18" height="6" rx="2" />
          <rect x="3" y="14" width="18" height="6" rx="2" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" />
          <circle cx="7" cy="17" r="1.2" fill="currentColor" />
          <path d="M13 7h4M13 17h4" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...ICON}>
          <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
          <rect x="14" y="14" width="6.5" height="6.5" rx="1.5" />
        </svg>
      );
    case "products":
      return (
        <svg {...ICON}>
          <path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6z" />
          <path d="M4 7.6 12 12l8-4.4" />
          <path d="M12 12v8.8" />
        </svg>
      );
    case "architecture":
      return (
        <svg {...ICON}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
          <path d="M12 7.5v3.5" />
          <path d="M12 11H5.5v5.5" />
          <path d="M12 11h6.5v5.5" />
        </svg>
      );
    case "my-tasks":
      return (
        <svg {...ICON}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19.5c0-3.2 2.9-5.2 6.5-5.2s6.5 2 6.5 5.2" />
        </svg>
      );
    case "all-tasks":
      return (
        <svg {...ICON}>
          <path d="M4 6.5h16" />
          <path d="M4 12h16" />
          <path d="M4 17.5h16" />
        </svg>
      );
    case "overdue-tasks":
      return (
        <svg {...ICON}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12" />
          <path d="M12 15.6v.2" />
        </svg>
      );
    case "reports":
      return (
        <svg {...ICON}>
          <path d="M3.5 20.5h17" />
          <path d="M6.5 20.5V12" />
          <path d="M11 20.5V5" />
          <path d="M15.5 20.5v-5.5" />
          <path d="M20 20.5V9" />
        </svg>
      );
    case "repositories":
      return (
        <svg {...ICON}>
          <circle cx="6.5" cy="6" r="2.5" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="12" r="2.5" />
          <path d="M6.5 8.5v7" />
          <path d="M9 6h3.5a5 5 0 0 1 5 5v.5" />
        </svg>
      );
    default:
      return (
        <svg {...ICON}>
          <path d="M4 8h6" />
          <path d="M14 8h6" />
          <circle cx="12" cy="8" r="2" />
          <path d="M4 16h10" />
          <path d="M18 16h2" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      );
  }
}
