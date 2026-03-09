"use client";

import { useState, useRef, useCallback, useEffect, useMemo, createRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  FileImage,
  Eye,
  Download,
  Archive,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { ProductNameCard } from "@/components/studio/detail-page/product-name-card";
import { CatchphraseCard } from "@/components/studio/detail-page/catchphrase-card";
import { FeaturesCard } from "@/components/studio/detail-page/features-card";
import {
  SingleColorChipCard,
  parseColorList,
} from "@/components/studio/detail-page/color-chips-card";
import { FabricCard } from "@/components/studio/detail-page/fabric-card";
import { ProductInfoCard } from "@/components/studio/product-info-card";
import { DetailHeaderCard } from "@/components/studio/detail-header-card";
import { SizeInfoCard } from "@/components/studio/size-info-card";
import {
  ProductInfoForm,
  INITIAL_FORM_DATA,
} from "@/components/studio/detail-page/product-info-form";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useDetailPageDownload } from "@/hooks/use-detail-page-download";
import { SECTION_NAMES, colorChipSectionName, DETAIL_PAGE_COST } from "@/config/detail-page";
import type { ProductInfoFormData } from "@/types/product-info";
import type {
  DetailPageGenerateResponse,
  DetailPageFeature,
} from "@/types/detail-page";

export default function DetailPageBuilderPage() {
  const [form, setForm] = useState<ProductInfoFormData>(INITIAL_FORM_DATA);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] =
    useState<DetailPageGenerateResponse | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  // 편집 가능한 AI 생성 데이터
  const [editedSubtitle, setEditedSubtitle] = useState("");
  const [editedProductName, setEditedProductName] = useState("");
  const [editedCatchphrase, setEditedCatchphrase] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedFeatures, setEditedFeatures] = useState<DetailPageFeature[]>([]);

  // 고정 카드 refs
  const productNameRef = useRef<HTMLDivElement>(null);
  const catchphraseRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<HTMLDivElement>(null);
  const productInfoRef = useRef<HTMLDivElement>(null);
  const detailHeaderRef = useRef<HTMLDivElement>(null);
  const sizeInfoRef = useRef<HTMLDivElement>(null);

  // 컬러칩 동적 refs
  const colorList = useMemo(() => parseColorList(form.colors), [form.colors]);
  const colorChipRefs = useMemo(
    () => colorList.map(() => createRef<HTMLDivElement>()),
    [colorList],
  );

  const { downloadSection, downloadAllSections } = useDetailPageDownload();

  // AI 데이터가 생성되면 편집 상태에 복사
  useEffect(() => {
    if (generatedData) {
      setEditedSubtitle(generatedData.subtitle);
      setEditedProductName(generatedData.productName);
      setEditedCatchphrase(generatedData.catchphrase);
      setEditedDescription(generatedData.description);
      setEditedFeatures([...generatedData.features]);
    }
  }, [generatedData]);

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) {
      toast.error("상품 이미지를 업로드해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.set("sourceImage", sourceFile);
      formData.set("fabric", form.fabric);
      formData.set("colors", form.colors);
      formData.set("sizes", form.sizes);
      if (additionalContext) {
        formData.set("additionalContext", additionalContext);
      }

      const res = await fetch("/api/studio/detail-page/generate", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.code === "TOKEN_INSUFFICIENT" || json.code === "FREE_TRIAL_EXCEEDED") {
          setShowTokenDialog(true);
        } else {
          toast.error(json.error || "생성에 실패했습니다.");
        }
        return;
      }

      setGeneratedData(json.data);
      const spent = json.tokensSpent as number | undefined;
      toast.success("상세페이지 콘텐츠가 생성되었습니다.", {
        description: spent ? `${spent} 크레딧이 차감되었습니다.` : undefined,
      });
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }, [sourceFile, form.fabric, form.colors, form.sizes, additionalContext]);

  const handleDownloadAll = useCallback(() => {
    const entries: { name: string; ref: React.RefObject<HTMLDivElement | null> }[] = [
      { name: SECTION_NAMES.productName, ref: productNameRef },
      { name: SECTION_NAMES.catchphrase, ref: catchphraseRef },
      { name: SECTION_NAMES.features, ref: featuresRef },
      { name: SECTION_NAMES.fabric, ref: fabricRef },
      { name: SECTION_NAMES.productInfo, ref: productInfoRef },
      { name: SECTION_NAMES.detailHeader, ref: detailHeaderRef },
      { name: SECTION_NAMES.sizeInfo, ref: sizeInfoRef },
    ];

    colorList.forEach((color, i) => {
      entries.push({
        name: colorChipSectionName(i, color),
        ref: colorChipRefs[i],
      });
    });

    downloadAllSections(entries);
  }, [downloadAllSections, colorList, colorChipRefs]);

  const hasGenerated = !!generatedData;
  const hasFabric = form.fabric.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <TokenInsufficientDialog
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
      />
      {/* 모바일 배너 */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground lg:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Monitor className="h-4 w-4 text-primary" />
        </div>
        <p className="text-muted-foreground">
          데스크톱에서 더 편리하게 사용하세요.
        </p>
      </div>

      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">상세페이지 빌더</h1>
        <p className="text-muted-foreground">
          상품 정보를 입력하면 상세페이지 섹션을 자동으로 생성합니다.
        </p>
      </div>

      {/* 2단 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 좌측: 입력 패널 */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileImage className="h-4 w-4" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <ProductInfoForm
              form={form}
              setForm={setForm}
              additionalContext={additionalContext}
              onAdditionalContextChange={setAdditionalContext}
              onFileSelect={setSourceFile}
            />

            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || !sourceFile}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    상세페이지 생성
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {!sourceFile
                  ? "상품 이미지를 먼저 업로드해주세요"
                  : `1회 생성 시 ${DETAIL_PAGE_COST} 크레딧이 차감됩니다`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 우측: 프리뷰 패널 */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              프리뷰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {isGenerating ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-muted/10 p-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    AI가 상세페이지를 생성하고 있습니다
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    상품 분석 중... 잠시만 기다려주세요
                  </p>
                </div>
              </div>
            ) : !hasGenerated ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/10 p-8 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    상세페이지가 여기에 표시됩니다
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    상품 이미지를 업로드하고 생성 버튼을 클릭하세요
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 1. 상품명 헤더 */}
                <PreviewSection
                  label={SECTION_NAMES.productName}
                  onDownload={() =>
                    downloadSection(productNameRef, SECTION_NAMES.productName)
                  }
                >
                  <ProductNameCard
                    ref={productNameRef}
                    subtitle={editedSubtitle}
                    productName={editedProductName}
                  />
                </PreviewSection>

                <EditableFields>
                  <EditField
                    label="서브타이틀"
                    value={editedSubtitle}
                    onChange={setEditedSubtitle}
                  />
                  <EditField
                    label="상품명"
                    value={editedProductName}
                    onChange={setEditedProductName}
                  />
                </EditableFields>

                {/* 2. 상품 설명 카피 */}
                <PreviewSection
                  label={SECTION_NAMES.catchphrase}
                  onDownload={() =>
                    downloadSection(catchphraseRef, SECTION_NAMES.catchphrase)
                  }
                >
                  <CatchphraseCard
                    ref={catchphraseRef}
                    catchphrase={editedCatchphrase}
                    description={editedDescription}
                  />
                </PreviewSection>

                <EditableFields>
                  <EditField
                    label="캐치프레이즈"
                    value={editedCatchphrase}
                    onChange={setEditedCatchphrase}
                  />
                  <EditField
                    label="상품 설명"
                    value={editedDescription}
                    onChange={setEditedDescription}
                    multiline
                  />
                </EditableFields>

                {/* 3. 상품 특징 */}
                <PreviewSection
                  label={SECTION_NAMES.features}
                  onDownload={() =>
                    downloadSection(featuresRef, SECTION_NAMES.features)
                  }
                >
                  <FeaturesCard ref={featuresRef} features={editedFeatures} />
                </PreviewSection>

                <EditableFields>
                  {editedFeatures.map((f, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      <EditField
                        label={`특징 ${i + 1} 제목`}
                        value={f.title}
                        onChange={(v) => {
                          setEditedFeatures((prev) =>
                            prev.map((feat, fi) =>
                              fi === i ? { ...feat, title: v } : feat,
                            ),
                          );
                        }}
                      />
                      <EditField
                        label={`특징 ${i + 1} 설명`}
                        value={f.description}
                        onChange={(v) => {
                          setEditedFeatures((prev) =>
                            prev.map((feat, fi) =>
                              fi === i ? { ...feat, description: v } : feat,
                            ),
                          );
                        }}
                      />
                    </div>
                  ))}
                </EditableFields>

                {/* 4. FABRIC */}
                {hasFabric && (
                  <PreviewSection
                    label={SECTION_NAMES.fabric}
                    onDownload={() =>
                      downloadSection(fabricRef, SECTION_NAMES.fabric)
                    }
                  >
                    <FabricCard ref={fabricRef} fabric={form.fabric} />
                  </PreviewSection>
                )}

                {/* 5. 컬러칩 (개별) */}
                {colorList.map((color, i) => {
                  const name = colorChipSectionName(i, color);
                  return (
                    <PreviewSection
                      key={`${color}-${i}`}
                      label={name}
                      onDownload={() =>
                        downloadSection(colorChipRefs[i], name)
                      }
                    >
                      <SingleColorChipCard
                        ref={colorChipRefs[i]}
                        colorName={color}
                      />
                    </PreviewSection>
                  );
                })}

                {/* 6. 제품 정보 카드 */}
                <PreviewSection
                  label={SECTION_NAMES.productInfo}
                  onDownload={() =>
                    downloadSection(productInfoRef, SECTION_NAMES.productInfo)
                  }
                >
                  <ProductInfoCard ref={productInfoRef} data={form} />
                </PreviewSection>

                {/* 7. DETAIL 헤더 */}
                <PreviewSection
                  label={SECTION_NAMES.detailHeader}
                  onDownload={() =>
                    downloadSection(detailHeaderRef, SECTION_NAMES.detailHeader)
                  }
                >
                  <DetailHeaderCard ref={detailHeaderRef} />
                </PreviewSection>

                {/* 8. SIZE INFO */}
                <PreviewSection
                  label={SECTION_NAMES.sizeInfo}
                  onDownload={() =>
                    downloadSection(sizeInfoRef, SECTION_NAMES.sizeInfo)
                  }
                >
                  <SizeInfoCard ref={sizeInfoRef} data={form} />
                </PreviewSection>

                {/* 전체 다운로드 */}
                <Button className="w-full" onClick={handleDownloadAll}>
                  <Archive className="mr-2 h-4 w-4" />
                  전체 다운로드 (ZIP)
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- 프리뷰 섹션 (컨테이너 너비 기반 동적 scale) ---
const CARD_WIDTH = 860;

function PreviewSection({
  label,
  children,
  onDownload,
}: {
  label: string;
  children: React.ReactNode;
  onDownload: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // 컨테이너 너비에 맞춰 scale 계산
  useResizeObserver(containerRef, (entry) => {
    const containerWidth = entry.contentRect.width;
    const newScale = Math.min(containerWidth / CARD_WIDTH, 1);
    setScale(newScale);
  });

  // 카드 원본 높이 * scale = 보정 높이
  const cardHeightRef = useRef(0);

  useResizeObserver(innerRef, (entry) => {
    cardHeightRef.current = entry.contentRect.height;
    setHeight(entry.contentRect.height * scale);
  });

  // scale 변경 시 높이 재계산
  useEffect(() => {
    if (cardHeightRef.current > 0) {
      setHeight(cardHeightRef.current * scale);
    }
  }, [scale]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg border"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div ref={innerRef}>{children}</div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onDownload}
      >
        <Download className="mr-1 h-3.5 w-3.5" />
        {label} 다운로드
      </Button>
    </div>
  );
}

// --- 인라인 편집 필드 ---
function EditableFields({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      {children}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// --- 유틸리티 ---
function getComputedScale(el: HTMLElement | null): number {
  if (!el) return 0.5;
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return 0.5;
  const match = transform.match(/matrix\(([^,]+)/);
  return match ? parseFloat(match[1]) : 0.5;
}

function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
