# 🚀 Monitor CI/CD & Server Architecture Map

Nền tảng quản lý kiến trúc sản phẩm dạng sơ đồ mạng lưới tương tác (Interactive Node Graph) tích hợp giám sát tài nguyên phần cứng máy chủ theo thời gian thực (CPU, GPU, PIN, RAM) và quy trình tự động hóa CI/CD.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=flat-square&logo=tailwind-css)
![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)

---

## ✨ Tính năng nổi bật

### 1. 🖥️ Giám sát phần cứng máy chủ (Server Hardware Monitor)
* **4 Thẻ căn đều hoàn chỉnh**: Giám sát **CPU**, **GPU**, **PIN / NGUỒN**, và **RAM**.
* **Đo lường thời gian thực (Real-time API)**: Đọc thông số trực tiếp từ hệ thống qua `node:os` và WMI API (`/api/system-stats`), cập nhật mỗi 2 giây.
* **Chỉ báo thông minh**: Thanh đo đổi màu linh hoạt theo tải hệ thống kèm nhãn trạng thái trực quan.

### 2. 🌐 Bản đồ mạng lưới sản phẩm & Kiến trúc hệ thống (Product Node Map)
* **Mỗi sản phẩm là một Node**: Hiển thị quan hệ giữa các thành phần Core Product, Service, Controller API, Database.
* **Xung dữ liệu CI/CD**: Các photon ánh sáng chuyển động liên tục dọc theo các đường liên kết biểu thị dữ liệu và traffic hệ thống.
* **Tương tác tối giản & nhanh chóng**:
  - Click vào node để chọn.
  - **`➕ Thêm node`**: Tạo node mới và tự động nối dây vào node đang chọn.
  - **`🗑️ Xóa node`**: Xóa node và toàn bộ đường liên kết liên quan (hỗ trợ phím tắt `Delete`).
  - **Kéo thả tự do**: Di chuyển các node theo ý muốn trên canvas.
  - **Zoom & Pan**: Phóng to/thu nhỏ bằng cuộn chuột, kéo canvas để di chuyển góc nhìn.
  - **Tự động lưu trữ**: Lưu trữ trạng thái bản đồ qua LocalStorage.
  - **Chuyển đổi giao diện**: Hỗ trợ linh hoạt Nền Trắng (Light Mode) và Nền Tối (Dark Mode).

### 3. 📐 Thiết kế Không Thanh Cuộn (Zero Scroll / 100vh Fit)
* Bố cục tràn màn hình khóa cố định khung nhìn (`overflow: hidden`), tự động co giãn theo mọi kích thước màn hình mà không bao giờ xuất hiện thanh cuộn.

---

## 🛠️ Quy trình CI/CD (GitHub Actions)

Dự án được cấu hình sẵn pipeline CI/CD tự động trong `.github/workflows/ci-cd.yml`:

```
Git Push / Pull Request (main)
        │
        ▼
 ┌──────────────┐
 │   Job: CI    │ -> Setup Node.js 20 & npm ci
 └──────┬───────┘ -> TypeScript Typecheck (`npm run typecheck`)
        │         -> Production Build (`npm run build`)
        │         -> Lưu trữ Build Artifacts
        ▼
 ┌──────────────┐
 │   Job: CD    │ -> Tự động kích hoạt khi merge vào `main`
 └──────────────┘ -> Triển khai (Deploy to Hosting/Vercel/Docker)
```

---

## 🚀 Khởi chạy dự án ở Local

### Yêu cầu:
* Node.js >= 18.18 (khuyến nghị Node 20+)
* npm hoặc yarn/pnpm

### Cài đặt & chạy:

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Kiểm tra lỗi TypeScript
npm run typecheck

# 3. Chạy môi trường phát triển (Dev Server)
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

### Đóng gói cho Production:
```bash
npm run build
npm run start
```

---

## 📂 Cấu trúc thư mục

```
Monitor_CICD/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Pipeline CI/CD GitHub Actions
├── src/
│   ├── app/
│   │   ├── api/system-stats/  # API đọc thông số CPU, GPU, RAM, Pin máy chủ
│   │   ├── layout.tsx         # Root layout cố định 100vh
│   │   ├── page.tsx           # Trang chủ Dashboard
│   │   └── globals.css        # Cấu hình Tailwind & chặn scroll
│   ├── components/
│   │   ├── ProductNetworkMap.tsx # Bản đồ Node sản phẩm tương tác
│   │   ├── ServerMonitor.tsx     # 4 thẻ giám sát phần cứng & thanh trạng thái
│   │   ├── Sidebar.tsx           # Thanh menu bên trái
│   │   └── ui.tsx                # Thư viện UI chung
│   └── lib/
│       └── nav.ts             # Định nghĩa danh mục điều hướng
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
