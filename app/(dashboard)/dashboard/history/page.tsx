import { HistoryList } from "@/components/dashboard/history-list";
import { VideoHistoryList } from "@/components/dashboard/video-history-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">작업 히스토리</h1>
        <p className="text-muted-foreground">
          이전에 생성한 이미지와 영상을 확인하고 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="images">
        <TabsList>
          <TabsTrigger value="images">이미지</TabsTrigger>
          <TabsTrigger value="videos">영상</TabsTrigger>
        </TabsList>
        <TabsContent value="images" className="space-y-4 mt-4">
          <HistoryList />
        </TabsContent>
        <TabsContent value="videos" className="space-y-4 mt-4">
          <VideoHistoryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
