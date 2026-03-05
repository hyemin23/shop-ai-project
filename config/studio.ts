import {
  type PosePreset,
  type ColorPreset,
  type AspectRatio,
  type ImageSize,
  type ImageGenerationOptions,
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
    id: "walking",
    name: "걷는 포즈",
    description: "자연스럽게 걷고 있는 동적인 포즈",
    thumbnailUrl: "/images/poses/walking.webp",
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
    id: "sitting",
    name: "앉은 포즈",
    description: "의자에 앉아있는 편안한 포즈",
    thumbnailUrl: "/images/poses/sitting.webp",
  },
  {
    id: "leaning",
    name: "기대는 포즈",
    description: "벽이나 구조물에 기대어 있는 포즈",
    thumbnailUrl: "/images/poses/leaning.webp",
  },
  {
    id: "upper-body",
    name: "상반신 클로즈업",
    description: "상반신을 강조하는 클로즈업 포즈",
    thumbnailUrl: "/images/poses/upper-body.webp",
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
  batch: "예: 전체적으로 밝은 톤으로 처리해주세요",
};

export function appendImageOptions(
  formData: FormData,
  options: ImageGenerationOptions,
): void {
  if (options.aspectRatio) formData.set("aspectRatio", options.aspectRatio);
  if (options.imageSize) formData.set("imageSize", options.imageSize);
  if (options.userPrompt?.trim())
    formData.set("userPrompt", options.userPrompt.trim());
}

export const IMAGE_CONSTRAINTS = {
  maxSizeBytes: 10 * 1024 * 1024,
  minResolution: 512,
  maxResolution: 4096,
  supportedFormats: ["image/jpeg", "image/png", "image/webp"],
  supportedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
} as const;

export const COOLDOWN_MS = 3000;
