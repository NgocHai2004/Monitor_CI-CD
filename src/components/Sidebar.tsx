"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isActive } from "@/lib/nav";
import { NavIcon } from "@/components/ui";

/** Rail icon cố định, không thu gọn/mở rộng. Tên mục hiện qua tooltip khi hover. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-14 shrink-0 flex-col border-r border-[#9dbdda] bg-[#bcd4ec] overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-[#9dbdda]">
        <span className="grid h-6 w-6 place-items-center rounded bg-zinc-900 text-[11px] font-semibold text-white">
          M
        </span>
      </div>

      <nav aria-label="Điều hướng chính" className="flex-1 overflow-hidden p-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`mb-1 flex h-10 items-center justify-center rounded-md transition-colors ${
                active
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-700 hover:bg-white/70 hover:text-zinc-900"
              }`}
            >
              <NavIcon name={item.icon} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
