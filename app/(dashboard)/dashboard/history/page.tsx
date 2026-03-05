import { HistoryList } from "@/components/dashboard/history-list";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">작업 히스토리</h1>
        <p className="text-muted-foreground">
          이전에 생성한 이미지를 확인하고 관리합니다. 30일 후 자동 삭제됩니다.
        </p>
      </div>

      <HistoryList />
    </div>
  );
}
