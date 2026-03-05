"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Monitor,
  FileImage,
  Download,
  Archive,
  Plus,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { ProductInfoCard } from "@/components/studio/product-info-card";
import { DetailHeaderCard } from "@/components/studio/detail-header-card";
import { SizeInfoCard } from "@/components/studio/size-info-card";
import { useCardDownload } from "@/hooks/use-card-download";
import {
  type ProductInfoFormData,
  type ModelSpec,
  type SizeRow,
} from "@/types/product-info";
import {
  DEFAULT_MEASUREMENT_LABELS,
  MODEL_SPEC_STORAGE_KEY,
} from "@/config/product-info";

const INITIAL_FORM_DATA: ProductInfoFormData = {
  colors: "",
  sizes: "",
  modelHeight: "",
  modelWeight: "",
  modelTopSize: "",
  modelBottomSize: "",
  fittingColors: "",
  fittingSize: "",
  fabric: "",
  measurementLabels: [...DEFAULT_MEASUREMENT_LABELS],
  sizeRows: [{ sizeName: "", measurements: ["", "", "", ""] }],
};

export default function ProductInfoPage() {
  const [form, setForm] = useState<ProductInfoFormData>(INITIAL_FORM_DATA);

  const productInfoRef = useRef<HTMLDivElement>(null);
  const detailHeaderRef = useRef<HTMLDivElement>(null);
  const sizeInfoRef = useRef<HTMLDivElement>(null);

  const { downloadCard, downloadAll } = useCardDownload();

  // --- 필드 업데이트 헬퍼 ---
  const updateField = useCallback(
    <K extends keyof ProductInfoFormData>(key: K, value: ProductInfoFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // --- 모델 스펙 저장/불러오기 ---
  const saveModelSpec = useCallback(() => {
    const spec: ModelSpec = {
      modelHeight: form.modelHeight,
      modelWeight: form.modelWeight,
      modelTopSize: form.modelTopSize,
      modelBottomSize: form.modelBottomSize,
    };
    localStorage.setItem(MODEL_SPEC_STORAGE_KEY, JSON.stringify(spec));
    toast.success("모델 스펙이 저장되었습니다.");
  }, [form.modelHeight, form.modelWeight, form.modelTopSize, form.modelBottomSize]);

  const loadModelSpec = useCallback(() => {
    const raw = localStorage.getItem(MODEL_SPEC_STORAGE_KEY);
    if (!raw) {
      toast.error("저장된 모델 스펙이 없습니다.");
      return;
    }
    const spec: ModelSpec = JSON.parse(raw);
    setForm((prev) => ({ ...prev, ...spec }));
    toast.success("모델 스펙을 불러왔습니다.");
  }, []);

  // --- 측정 항목 관리 ---
  const addMeasurementLabel = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      measurementLabels: [...prev.measurementLabels, ""],
      sizeRows: prev.sizeRows.map((row) => ({
        ...row,
        measurements: [...row.measurements, ""],
      })),
    }));
  }, []);

  const removeMeasurementLabel = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      measurementLabels: prev.measurementLabels.filter((_, i) => i !== index),
      sizeRows: prev.sizeRows.map((row) => ({
        ...row,
        measurements: row.measurements.filter((_, i) => i !== index),
      })),
    }));
  }, []);

  const updateMeasurementLabel = useCallback((index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      measurementLabels: prev.measurementLabels.map((l, i) =>
        i === index ? value : l,
      ),
    }));
  }, []);

  // --- 사이즈 행 관리 ---
  const addSizeRow = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      sizeRows: [
        ...prev.sizeRows,
        {
          sizeName: "",
          measurements: Array(prev.measurementLabels.length).fill(""),
        },
      ],
    }));
  }, []);

  const removeSizeRow = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      sizeRows: prev.sizeRows.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSizeRow = useCallback(
    <K extends keyof SizeRow>(rowIndex: number, key: K, value: SizeRow[K]) => {
      setForm((prev) => ({
        ...prev,
        sizeRows: prev.sizeRows.map((row, i) =>
          i === rowIndex ? { ...row, [key]: value } : row,
        ),
      }));
    },
    [],
  );

  const updateMeasurement = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      setForm((prev) => ({
        ...prev,
        sizeRows: prev.sizeRows.map((row, ri) =>
          ri === rowIndex
            ? {
                ...row,
                measurements: row.measurements.map((m, ci) =>
                  ci === colIndex ? value : m,
                ),
              }
            : row,
        ),
      }));
    },
    [],
  );

  // --- 다운로드 ---
  const handleDownloadAll = useCallback(() => {
    downloadAll({
      "제품정보카드": productInfoRef,
      "DETAIL헤더": detailHeaderRef,
      "SIZE_INFO": sizeInfoRef,
    });
  }, [downloadAll]);

  return (
    <div className="space-y-6">
      {/* 모바일 배너 */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground lg:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Monitor className="h-4 w-4 text-primary" />
        </div>
        <p className="text-muted-foreground">
          데스크톱에서 더 편리하게 사용하세요. 넓은 화면에서 프리뷰를 확인할 수 있습니다.
        </p>
      </div>

      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">상세 정보 카드</h1>
        <p className="text-muted-foreground">
          상품 정보를 입력하면 제품 상세 이미지를 자동으로 생성합니다.
        </p>
      </div>

      {/* 2단 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 좌측: 입력 폼 */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileImage className="h-4 w-4" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* 기본 정보 */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">기본 정보</legend>
              <div className="space-y-2">
                <Label htmlFor="colors">컬러 (콤마 구분)</Label>
                <Input
                  id="colors"
                  placeholder="블랙, 화이트, 브라운"
                  value={form.colors}
                  onChange={(e) => updateField("colors", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizes">사이즈 (콤마 구분)</Label>
                <Input
                  id="sizes"
                  placeholder="S, M, L"
                  value={form.sizes}
                  onChange={(e) => updateField("sizes", e.target.value)}
                />
              </div>
            </fieldset>

            {/* 모델 스펙 */}
            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <legend className="text-sm font-semibold">모델 스펙</legend>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={saveModelSpec}
                  >
                    <Save className="mr-1 h-3.5 w-3.5" />
                    저장
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadModelSpec}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    불러오기
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="modelHeight">키 (cm)</Label>
                  <Input
                    id="modelHeight"
                    type="number"
                    placeholder="183"
                    value={form.modelHeight}
                    onChange={(e) => updateField("modelHeight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelWeight">몸무게 (kg)</Label>
                  <Input
                    id="modelWeight"
                    type="number"
                    placeholder="78"
                    value={form.modelWeight}
                    onChange={(e) => updateField("modelWeight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelTopSize">평소 상의</Label>
                  <Input
                    id="modelTopSize"
                    placeholder="105"
                    value={form.modelTopSize}
                    onChange={(e) =>
                      updateField("modelTopSize", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelBottomSize">평소 하의</Label>
                  <Input
                    id="modelBottomSize"
                    placeholder="30"
                    value={form.modelBottomSize}
                    onChange={(e) =>
                      updateField("modelBottomSize", e.target.value)
                    }
                  />
                </div>
              </div>
            </fieldset>

            {/* 착용 정보 */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">착용 정보</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fittingColors">착용 컬러</Label>
                  <Input
                    id="fittingColors"
                    placeholder="브라운, 화이트"
                    value={form.fittingColors}
                    onChange={(e) =>
                      updateField("fittingColors", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fittingSize">착용 사이즈</Label>
                  <Input
                    id="fittingSize"
                    placeholder="L"
                    value={form.fittingSize}
                    onChange={(e) =>
                      updateField("fittingSize", e.target.value)
                    }
                  />
                </div>
              </div>
            </fieldset>

            {/* 소재 */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">소재</legend>
              <div className="space-y-2">
                <Label htmlFor="fabric">소재</Label>
                <Input
                  id="fabric"
                  placeholder="코튼100%"
                  value={form.fabric}
                  onChange={(e) => updateField("fabric", e.target.value)}
                />
              </div>
            </fieldset>

            {/* 실측 정보 */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">실측 정보</legend>

              {/* 측정 항목 라벨 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>측정 항목</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMeasurementLabel}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    항목 추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.measurementLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Input
                        className="h-8 w-20"
                        value={label}
                        onChange={(e) =>
                          updateMeasurementLabel(i, e.target.value)
                        }
                        placeholder="항목명"
                      />
                      {form.measurementLabels.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeMeasurementLabel(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 사이즈 행 */}
              <div className="space-y-2">
                {form.sizeRows.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-2">
                    <Input
                      className="h-8 w-16"
                      placeholder="S"
                      value={row.sizeName}
                      onChange={(e) =>
                        updateSizeRow(ri, "sizeName", e.target.value)
                      }
                    />
                    {form.measurementLabels.map((_, ci) => (
                      <Input
                        key={ci}
                        className="h-8 w-16"
                        placeholder="-"
                        value={row.measurements[ci] ?? ""}
                        onChange={(e) =>
                          updateMeasurement(ri, ci, e.target.value)
                        }
                      />
                    ))}
                    {form.sizeRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSizeRow(ri)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSizeRow}
                  className="w-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  사이즈 추가
                </Button>
              </div>
            </fieldset>
          </CardContent>
        </Card>

        {/* 우측: 프리뷰 */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">프리뷰</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* 제품 정보 카드 */}
            <PreviewSection
              label="제품 정보 카드"
              cardRef={productInfoRef}
              onDownload={() => downloadCard(productInfoRef, "제품정보카드")}
            >
              <ProductInfoCard ref={productInfoRef} data={form} />
            </PreviewSection>

            {/* DETAIL 헤더 */}
            <PreviewSection
              label="DETAIL 헤더"
              cardRef={detailHeaderRef}
              onDownload={() => downloadCard(detailHeaderRef, "DETAIL헤더")}
            >
              <DetailHeaderCard ref={detailHeaderRef} />
            </PreviewSection>

            {/* SIZE INFO */}
            <PreviewSection
              label="SIZE INFO"
              cardRef={sizeInfoRef}
              onDownload={() => downloadCard(sizeInfoRef, "SIZE_INFO")}
            >
              <SizeInfoCard ref={sizeInfoRef} data={form} />
            </PreviewSection>

            {/* 전체 다운로드 */}
            <Button className="w-full" onClick={handleDownloadAll}>
              <Archive className="mr-2 h-4 w-4" />
              전체 다운로드 (ZIP)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- 프리뷰 섹션 (scale 적용 + 높이 보정) ---
function PreviewSection({
  label,
  children,
  onDownload,
}: {
  label: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  onDownload: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // 카드 실제 높이를 측정하여 컨테이너 높이 보정
  useResizeObserver(innerRef, (entry) => {
    const scale = getComputedScale(wrapperRef.current);
    setHeight(entry.contentRect.height * scale);
  });

  return (
    <div className="space-y-2">
      <div
        className="overflow-hidden rounded-lg border"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div
          ref={wrapperRef}
          className="origin-top-left scale-[0.5] sm:scale-[0.55] lg:scale-[0.45] xl:scale-[0.55]"
        >
          <div ref={innerRef}>{children}</div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={onDownload}>
        <Download className="mr-1 h-3.5 w-3.5" />
        {label} 다운로드
      </Button>
    </div>
  );
}

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
