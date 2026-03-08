"use client";

import { toast } from "sonner";
import { AlertCircle, RotateCw, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextToVideoForm } from "@/components/video/text-to-video-form";
import { VideoGenerationStatusDisplay } from "@/components/video/video-generation-status";
import { VideoResultViewer } from "@/components/video/video-result-viewer";
import { useVideoGenerate } from "@/hooks/use-video-generate";
import type { TextToVideoRequest } from "@/types/video";

export default function TextToVideoPage() {
  const {
    status,
    videoUrl,
    error,
    elapsedSeconds,
    isOnline,
    submit,
    reset,
  } = useVideoGenerate<TextToVideoRequest>({
    apiPath: "/api/video/text-to-video",
    onSuccess: () => {
      toast.success("비디오 생성 완료", {
        description: "영상이 성공적으로 생성되었습니다.",
      });
    },
    onTokenInsufficient: () => {
      toast.error("토큰 부족", {
        description: "토큰을 충전한 후 다시 시도해주세요.",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">텍스트 비디오</h1>
        <p className="text-muted-foreground">
          텍스트 프롬프트로 AI 영상을 생성합니다. (Kling AI 기반)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <TextToVideoForm
              status={status}
              isOnline={isOnline}
              onSubmit={submit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  프롬프트를 입력하고 영상을 생성해보세요
                </p>
              </div>
            )}

            {(status === "submitting" || status === "polling") && (
              <VideoGenerationStatusDisplay
                status={status}
                elapsedSeconds={elapsedSeconds}
              />
            )}

            {status === "succeed" && videoUrl && (
              <div className="space-y-4">
                <VideoResultViewer videoUrl={videoUrl} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={reset}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  새 영상 생성
                </Button>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
