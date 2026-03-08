import {
  type PosePreset,
  type ColorPreset,
  type AspectRatio,
  type ImageSize,
  type ImageGenerationOptions,
  type GenerationMode,
} from "@/types/studio";

export const ASPECT_RATIO_PRESETS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 (정사각형)" },
  { value: "3:4", label: "3:4 (세로)" },
  { value: "4:3", label: "4:3 (가로)" },
  { value: "9:16", label: "9:16 (세로 긴)" },
  { value: "16:9", label: "16:9 (가로 긴)" },
];

export const IMAGE_SIZE_PRESETS: { value: ImageSize; label: string }[] = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" },
];

export const POSE_PRESETS: PosePreset[] = [
  {
    id: "front-standing",
    name: "정면 서기",
    description: "정면을 바라보며 자연스럽게 서 있는 기본 포즈",
    thumbnailUrl: "/images/poses/front-standing.webp",
  },
  {
    id: "turn-left-45",
    name: "왼쪽 45도 회전",
    description: "몸을 왼쪽으로 45도 틀어 서 있는 포즈, 정면과 측면 실루엣이 동시에 보이는 각도",
    thumbnailUrl: "/images/poses/turn-left-45.webp",
  },
  {
    id: "turn-right-45",
    name: "오른쪽 45도 회전",
    description: "몸을 오른쪽으로 45도 틀어 서 있는 포즈, 정면과 측면 실루엣이 동시에 보이는 각도",
    thumbnailUrl: "/images/poses/turn-right-45.webp",
  },
  {
    id: "side-left",
    name: "왼쪽 측면 서기",
    description: "왼쪽 측면을 보여주는 서 있는 포즈",
    thumbnailUrl: "/images/poses/side-left.webp",
  },
  {
    id: "side-right",
    name: "오른쪽 측면 서기",
    description: "오른쪽 측면을 보여주는 서 있는 포즈",
    thumbnailUrl: "/images/poses/side-right.webp",
  },
  {
    id: "back-standing",
    name: "뒤돌아 서기",
    description: "뒷모습을 보여주는 서 있는 포즈",
    thumbnailUrl: "/images/poses/back-standing.webp",
  },
  {
    id: "back-turn-45",
    name: "뒤돌아 45도",
    description: "등을 보이되 몸을 45도 각도로 살짝 틀어 서 있는 포즈, 후면 디테일이 자연스럽게 보이는 각도",
    thumbnailUrl: "/images/poses/back-turn-45.webp",
  },
  {
    id: "walking",
    name: "걷는 포즈",
    description: "한 발을 살짝 앞에 둔 채 가볍게 걷는 듯한 포즈, 보폭은 좁고 동작은 미세하게",
    thumbnailUrl: "/images/poses/walking.webp",
  },
  {
    id: "stride-walk",
    name: "한 발 앞으로",
    description: "한 발을 반 보폭 정도만 앞으로 내딛고 서 있는 포즈, 과장 없이 자연스러운 체중 이동으로 옷의 드레이프가 살짝 보이는 각도",
    thumbnailUrl: "/images/poses/stride-walk.webp",
  },
  {
    id: "hand-on-hip",
    name: "한 손 허리",
    description: "한 손을 허리에 올린 자신감 있는 포즈",
    thumbnailUrl: "/images/poses/hand-on-hip.webp",
  },
  {
    id: "hands-in-pockets",
    name: "양손 주머니",
    description: "양손을 주머니에 넣은 캐주얼한 포즈",
    thumbnailUrl: "/images/poses/hands-in-pockets.webp",
  },
  {
    id: "one-hand-on-collar",
    name: "한 손 칼라 터치",
    description: "한 손으로 칼라나 옷깃을 가볍게 잡고 있는 포즈, 상의 디테일이 강조되는 자연스러운 손 위치",
    thumbnailUrl: "/images/poses/one-hand-on-collar.webp",
  },
];

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "black", hex: "#000000", nameKo: "블랙" },
  { name: "white", hex: "#FFFFFF", nameKo: "화이트" },
  { name: "gray", hex: "#808080", nameKo: "그레이" },
  { name: "navy", hex: "#1B2A4A", nameKo: "네이비" },
  { name: "beige", hex: "#C8B88A", nameKo: "베이지" },
  { name: "khaki", hex: "#8A7E6B", nameKo: "카키" },
  { name: "brown", hex: "#5C3A21", nameKo: "브라운" },
  { name: "wine", hex: "#722F37", nameKo: "와인" },
  { name: "pink", hex: "#E8A0BF", nameKo: "핑크" },
  { name: "skyblue", hex: "#87CEEB", nameKo: "스카이블루" },
  { name: "ivory", hex: "#FFFFF0", nameKo: "아이보리" },
  { name: "charcoal", hex: "#36454F", nameKo: "차콜" },
];

export const DEFAULT_IMAGE_OPTIONS: ImageGenerationOptions = {
  aspectRatio: "1:1",
  imageSize: "1K",
};

export const PROMPT_CONSTRAINTS = {
  maxLength: 500,
} as const;

export const PROMPT_PLACEHOLDERS: Record<string, string> = {
  "try-on": "예: 소매를 살짝 걷어올려주세요, 셔츠 단추를 하나 풀어주세요",
  "color-swap": "예: 채도를 약간 낮춰주세요, 빈티지한 느낌으로 해주세요",
  "pose-transfer": "예: 자연스러운 미소를 지어주세요, 팔을 좀 더 내려주세요",
  "background-swap": "예: 배경과 모델 사이의 조명을 자연스럽게 맞춰주세요",
  "multi-pose":
    "예: 왼손을 허리에 올리고 카메라를 바라보는 포즈, 자연스럽게 걷는 동작",
  "detail-extract":
    "예: 버튼의 정교함을 강조해주세요, 원단 결을 더 선명하게 보여주세요",
  "auto-fitting":
    "예: 스트릿 캐주얼 느낌으로, 밝은 조명에서 촬영한 것처럼",
  batch: "예: 전체적으로 밝은 톤으로 처리해주세요",
};

/** 4K 해상도 선택 시 premium(Pro) 모델 사용, 그 외 standard(Flash) */
export function resolveMode(imageSize?: ImageSize): GenerationMode {
  return imageSize === "4K" ? "premium" : "standard";
}

export function appendImageOptions(
  formData: FormData,
  options: ImageGenerationOptions,
): void {
  if (options.aspectRatio) formData.set("aspectRatio", options.aspectRatio);
  if (options.imageSize) formData.set("imageSize", options.imageSize);
  if (options.userPrompt?.trim())
    formData.set("userPrompt", options.userPrompt.trim());
}

export const INSTRUCTION_CHIPS = [
  {
    id: "no-ref-accessories",
    label: "악세사리 무시",
    promptText:
      "Do NOT transfer any accessories (glasses, necklace, earrings, watch, hat, bag) from the reference image to the output. Only the target garment should be transferred.",
  },
  {
    id: "fit-slim",
    label: "슬림하게",
    promptText:
      "Fit the garment closer to the body, reducing excess fabric volume by about 30% compared to the reference image, while preserving the original design, color, and pattern.",
  },
  {
    id: "fit-loose",
    label: "루즈하게",
    promptText:
      "Add about 30% more fabric volume, making the garment hang looser from the body compared to the reference image, while preserving the original design, color, and pattern.",
  },
] as const;

export const CHIP_CONFLICTS: Record<string, string> = {
  "fit-slim": "fit-loose",
  "fit-loose": "fit-slim",
};

export const IMAGE_CONSTRAINTS = {
  maxSizeBytes: 10 * 1024 * 1024,
  minResolution: 512,
  maxResolution: 4096,
  supportedFormats: ["image/jpeg", "image/png", "image/webp"],
  supportedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

export const COOLDOWN_MS = 3000;

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  "try-on": "의류 교체",
  "color-swap": "색상 변경",
  "pose-transfer": "포즈 변경",
  "background-swap": "배경 변경",
  "multi-pose": "멀티포즈",
  "detail-extract": "상세 추출",
  "auto-fitting": "자동피팅",
  "ugc": "UGC 이미지",
};

export const SERVICE_TYPE_COLORS: Record<string, string> = {
  "try-on": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-500",
  "color-swap": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-500",
  "pose-transfer": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-500",
  "background-swap": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-500",
  "multi-pose": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-500",
  "detail-extract": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-500",
  "auto-fitting": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-500",
  "ugc": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-500",
};
