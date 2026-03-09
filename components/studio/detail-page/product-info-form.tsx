"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import {
  type ProductInfoFormData,
  type ModelSpec,
  type SizeRow,
} from "@/types/product-info";
import {
  DEFAULT_MEASUREMENT_LABELS,
  MODEL_SPEC_STORAGE_KEY,
} from "@/config/product-info";

export const INITIAL_FORM_DATA: ProductInfoFormData = {
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

interface ProductInfoFormProps {
  form: ProductInfoFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductInfoFormData>>;
  additionalContext: string;
  onAdditionalContextChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
}

export function ProductInfoForm({
  form,
  setForm,
  additionalContext,
  onAdditionalContextChange,
  onFileSelect,
}: ProductInfoFormProps) {
  const updateField = useCallback(
    <K extends keyof ProductInfoFormData>(
      key: K,
      value: ProductInfoFormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [setForm],
  );

  const saveModelSpec = useCallback(() => {
    const spec: ModelSpec = {
      modelHeight: form.modelHeight,
      modelWeight: form.modelWeight,
      modelTopSize: form.modelTopSize,
      modelBottomSize: form.modelBottomSize,
    };
    localStorage.setItem(MODEL_SPEC_STORAGE_KEY, JSON.stringify(spec));
    toast.success("모델 스펙이 저장되었습니다.");
  }, [
    form.modelHeight,
    form.modelWeight,
    form.modelTopSize,
    form.modelBottomSize,
  ]);

  const loadModelSpec = useCallback(() => {
    const raw = localStorage.getItem(MODEL_SPEC_STORAGE_KEY);
    if (!raw) {
      toast.error("저장된 모델 스펙이 없습니다.");
      return;
    }
    const spec: ModelSpec = JSON.parse(raw);
    setForm((prev) => ({ ...prev, ...spec }));
    toast.success("모델 스펙을 불러왔습니다.");
  }, [setForm]);

  const addMeasurementLabel = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      measurementLabels: [...prev.measurementLabels, ""],
      sizeRows: prev.sizeRows.map((row) => ({
        ...row,
        measurements: [...row.measurements, ""],
      })),
    }));
  }, [setForm]);

  const removeMeasurementLabel = useCallback(
    (index: number) => {
      setForm((prev) => ({
        ...prev,
        measurementLabels: prev.measurementLabels.filter(
          (_, i) => i !== index,
        ),
        sizeRows: prev.sizeRows.map((row) => ({
          ...row,
          measurements: row.measurements.filter((_, i) => i !== index),
        })),
      }));
    },
    [setForm],
  );

  const updateMeasurementLabel = useCallback(
    (index: number, value: string) => {
      setForm((prev) => ({
        ...prev,
        measurementLabels: prev.measurementLabels.map((l, i) =>
          i === index ? value : l,
        ),
      }));
    },
    [setForm],
  );

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
  }, [setForm]);

  const removeSizeRow = useCallback(
    (index: number) => {
      setForm((prev) => ({
        ...prev,
        sizeRows: prev.sizeRows.filter((_, i) => i !== index),
      }));
    },
    [setForm],
  );

  const updateSizeRow = useCallback(
    <K extends keyof SizeRow>(rowIndex: number, key: K, value: SizeRow[K]) => {
      setForm((prev) => ({
        ...prev,
        sizeRows: prev.sizeRows.map((row, i) =>
          i === rowIndex ? { ...row, [key]: value } : row,
        ),
      }));
    },
    [setForm],
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
    [setForm],
  );

  return (
    <div className="space-y-5">
      {/* 이미지 업로드 (탭 바깥 — 탭 전환해도 유지) */}
      <ImageUploadZone
        label="상품 이미지 업로드"
        description="상품 착용컷 또는 제품 사진"
        onFileSelect={onFileSelect}
      />

      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product">상품정보</TabsTrigger>
          <TabsTrigger value="measurements">실측정보</TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-5 pt-4">
          {/* 기본 정보 */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">기본 정보</legend>
          <div className="space-y-2">
            <Label htmlFor="dp-colors">컬러 (콤마 구분)</Label>
            <Input
              id="dp-colors"
              placeholder="블랙, 아이보리, 와인"
              value={form.colors}
              onChange={(e) => updateField("colors", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dp-sizes">사이즈 (콤마 구분)</Label>
            <Input
              id="dp-sizes"
              placeholder="S, M, L, XL"
              value={form.sizes}
              onChange={(e) => updateField("sizes", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dp-fabric">소재</Label>
            <Input
              id="dp-fabric"
              placeholder="울 스판 혼방"
              value={form.fabric}
              onChange={(e) => updateField("fabric", e.target.value)}
            />
          </div>
        </fieldset>

        {/* 모델 스펙 */}
        <fieldset className="space-y-3" aria-label="모델 스펙">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">모델 스펙</span>
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
              <Label htmlFor="dp-modelHeight">키 (cm)</Label>
              <Input
                id="dp-modelHeight"
                type="number"
                placeholder="183"
                value={form.modelHeight}
                onChange={(e) => updateField("modelHeight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-modelWeight">몸무게 (kg)</Label>
              <Input
                id="dp-modelWeight"
                type="number"
                placeholder="78"
                value={form.modelWeight}
                onChange={(e) => updateField("modelWeight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-modelTopSize">평소 상의</Label>
              <Input
                id="dp-modelTopSize"
                placeholder="105"
                value={form.modelTopSize}
                onChange={(e) => updateField("modelTopSize", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-modelBottomSize">평소 하의</Label>
              <Input
                id="dp-modelBottomSize"
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
              <Label htmlFor="dp-fittingColors">착용 컬러</Label>
              <Input
                id="dp-fittingColors"
                placeholder="브라운"
                value={form.fittingColors}
                onChange={(e) =>
                  updateField("fittingColors", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp-fittingSize">착용 사이즈</Label>
              <Input
                id="dp-fittingSize"
                placeholder="L"
                value={form.fittingSize}
                onChange={(e) => updateField("fittingSize", e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {/* 추가 컨텍스트 */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">추가 설명 (선택)</legend>
          <Textarea
            id="dp-additionalContext"
            aria-label="추가 설명"
            placeholder="상품에 대한 추가 설명을 입력하세요"
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
            rows={3}
          />
        </fieldset>
      </TabsContent>

      <TabsContent value="measurements" className="space-y-5 pt-4">
        {/* 측정 항목 */}
        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold">측정 항목</legend>
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
                  onChange={(e) => updateMeasurementLabel(i, e.target.value)}
                  placeholder="항목명"
                  aria-label={`측정 항목 ${i + 1} 이름`}
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
        </fieldset>

        {/* 사이즈 행 */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">사이즈별 실측</legend>
          <div className="space-y-2">
            {form.sizeRows.map((row, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <Input
                  className="h-8 w-16"
                  placeholder="S"
                  value={row.sizeName}
                  aria-label={`사이즈 행 ${ri + 1} 이름`}
                  onChange={(e) =>
                    updateSizeRow(ri, "sizeName", e.target.value)
                  }
                />
                {form.measurementLabels.map((ml, ci) => (
                  <Input
                    key={ci}
                    className="h-8 w-16"
                    placeholder="-"
                    value={row.measurements[ci] ?? ""}
                    aria-label={`${row.sizeName || `행 ${ri + 1}`} ${ml || `항목 ${ci + 1}`}`}
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
      </TabsContent>
      </Tabs>
    </div>
  );
}
