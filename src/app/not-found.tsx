import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-zinc-900">404 - Không tìm thấy trang</h2>
      <p className="mt-2 text-zinc-500">Mục bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Về trang Dashboard
      </Link>
    </div>
  );
}

