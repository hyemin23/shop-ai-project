---
name: nanobanana
description: Nano Banana (Gemini native image generation) guide. Use when writing Gemini image generation/editing code with @google/genai SDK, creating prompts, configuring imageConfig, or selecting models (gemini-3.1-flash-image-preview, gemini-3-pro-image-preview).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Nano Banana Image Generation Skill

Gemini의 네이티브 이미지 생성/편집 기능인 **Nano Banana**를 활용하여 이미지를 생성하고 편집하는 스킬입니다.

## 상세 레퍼런스 로딩 가이드

작업에 필요한 reference 파일을 Read 도구로 로드하세요. 모든 파일 경로의 기준은 `.claude/skills/nanobanana/reference/` 입니다.

| 작업 | 읽어야 할 파일 |
|------|---------------|
| 모델 선택, SDK 초기화, 제약사항 확인 | `reference/01-overview.md` |
| 텍스트 → 이미지 생성 | `reference/02-text-to-image.md` |
| 이미지 편집 (단일/Multi-turn) | `reference/03-image-editing.md` |
| 고해상도, 다중 참조, Search 그라운딩, Thinking | `reference/04-gemini3-features.md` |
| 생성 프롬프트 작성 (사실적, 스티커, 제품 등) | `reference/05-prompting-generation.md` |
| 편집 프롬프트 작성 (인페인팅, 합성, 스타일 등) | `reference/06-prompting-editing.md` |
| config 옵션, 종횡비/해상도 테이블 | `reference/07-configuration.md` |

**예시**: 이미지 편집 코드를 작성할 때:
```
Read .claude/skills/nanobanana/reference/03-image-editing.md
Read .claude/skills/nanobanana/reference/06-prompting-editing.md
```

## 빠른 참조

### SDK 초기화

```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

### 기본 호출 패턴

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",  // 기본 권장 모델
  contents: [
    ...images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })),
    { text: prompt },
  ],
  config: {
    responseModalities: ["IMAGE", "TEXT"],  // 대문자!
    imageConfig: {
      aspectRatio: "3:4",     // 선택
      imageSize: "2K",        // 선택: "512px" | "1K" | "2K" | "4K"
    },
  },
});
```

### 응답 파싱

```typescript
const parts = response.candidates?.[0]?.content?.parts;
for (const part of parts) {
  if (part.inlineData) {
    // part.inlineData.data — base64 이미지
    // part.inlineData.mimeType — MIME 타입
  } else if (part.text) {
    // 텍스트 응답
  }
}
```

## 모델 선택

| 모델 ID | 용도 | 특징 |
|---------|------|------|
| `gemini-3.1-flash-image-preview` | **기본 권장** | 성능/비용/속도 밸런스, 최대 4K, Image Search, 512px 지원 |
| `gemini-3-pro-image-preview` | 전문 에셋 | 고품질, Thinking, 복잡한 지시, 최대 4K |
| `gemini-2.5-flash-image` | 대량/저지연 | 빠른 속도, 1024px 고정 |

## 핵심 규칙

1. **responseModalities 대문자**: `["IMAGE", "TEXT"]` (소문자 사용 금지)
2. **imageSize 대문자 K**: `"1K"`, `"2K"`, `"4K"` (소문자 `k` 거부됨)
3. **contents는 Part 배열**: `[{inlineData: ...}, {text: ...}]`
4. **응답에 `.response` 래퍼 없음**: `response.candidates` 직접 접근
5. **config는 generateContent 인자**: `getGenerativeModel()`에 넣지 않음
