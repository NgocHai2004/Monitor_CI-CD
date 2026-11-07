import { Page } from "@/components/ui";
import { SshServerMonitor } from "@/components/SshServerMonitor";

export default function SshServerMonitorPage() {
  return (
    <Page
      title="Giám sát Máy chủ Từ xa (SSH Server Monitor)"
      description="Kết nối máy chủ từ xa qua SSH để theo dõi biểu đồ thời gian thực: CPU, GPU, RAM, Ổ cứng và Tiến trình."
    >
      <SshServerMonitor />
    </Page>
  );
}

