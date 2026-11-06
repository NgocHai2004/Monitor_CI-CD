import { Page } from "@/components/ui";
import { ServerMonitor } from "@/components/ServerMonitor";

export default function DashboardPage() {
  return (
    <Page
      title="Server Monitor"
      description="Giám sát hiệu năng và tài nguyên phần cứng máy chủ: CPU, GPU, Pin và RAM theo thời gian thực."
    >
      <ServerMonitor />
    </Page>
  );
}
