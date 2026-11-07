export type NavItem = {
  href: string;
  label: string;
  /** Khoá icon, xem NavIcon trong components/ui.tsx */
  icon: string;
  title: string;
  description: string;
  empty: string;
};

export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: "dashboard",
    title: "Server Monitor",
    description: "Giám sát hiệu năng phần cứng CPU, GPU, Pin và RAM theo thời gian thực.",
    empty: "",
  },
  {
    href: "/server-monitor",
    label: "SSH Monitor",
    icon: "server",
    title: "Giám sát Máy chủ Từ xa (SSH Server Monitor)",
    description: "Kết nối máy chủ qua SSH để theo dõi biểu đồ CPU, GPU, RAM, Ổ cứng và tiến trình theo thời gian thực.",
    empty: "",
  },
  {
    href: "/products",
    label: "Products",
    icon: "products",
    title: "Sản phẩm",
    description: "Danh sách sản phẩm CNTT, mỗi sản phẩm có không gian quản lý riêng.",
    empty: "Chưa có sản phẩm nào. Sản phẩm đầu tiên sẽ xuất hiện ở đây.",
  },
  {
    href: "/architecture",
    label: "Architecture",
    icon: "architecture",
    title: "Kiến trúc hệ thống",
    description: "Sơ đồ kiến trúc tương tác của từng sản phẩm.",
    empty: "Chưa có sơ đồ kiến trúc. Vùng canvas sẽ hiển thị ở đây.",
  },
  {
    href: "/my-tasks",
    label: "My Tasks",
    icon: "my-tasks",
    title: "Task của tôi",
    description: "Các task được giao cho bạn.",
    empty: "Chưa có task nào được giao cho bạn.",
  },
  {
    href: "/all-tasks",
    label: "All Tasks",
    icon: "all-tasks",
    title: "Tất cả task",
    description: "Toàn bộ task trong hệ thống.",
    empty: "Chưa có task nào trong hệ thống.",
  },
  {
    href: "/overdue-tasks",
    label: "Overdue Tasks",
    icon: "overdue-tasks",
    title: "Task quá hạn",
    description: "Task đã qua deadline và chưa hoàn thành.",
    empty: "Không có task quá hạn.",
  },
  {
    href: "/reports",
    label: "Reports",
    icon: "reports",
    title: "Báo cáo",
    description: "Tỷ lệ hoàn thành đúng hạn và khối lượng task theo nhân sự.",
    empty: "Chưa có dữ liệu để lập báo cáo.",
  },
  {
    href: "/repositories",
    label: "Repositories",
    icon: "repositories",
    title: "Kho mã nguồn & CI/CD",
    description: "Kết nối repository để theo dõi pipeline, build và triển khai.",
    empty:
      "Chưa kết nối kho mã nguồn nào. Link Git sẽ được thêm ở đây để bắt đầu theo dõi CI/CD.",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
    title: "Cài đặt",
    description: "Cấu hình hệ thống, người dùng và phân quyền.",
    empty: "Chưa có mục nào để cấu hình.",
  },
];

/** Mục nav sáng khi đang ở trang con, ví dụ /products/phantom-r3 vẫn sáng "Products". */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
