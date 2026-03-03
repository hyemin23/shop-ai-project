# Nano Banana Overview

**Nano Banana**는 Gemini의 네이티브 이미지 생성 기능의 이름입니다. Gemini는 텍스트, 이미지, 또는 둘의 조합으로 대화형으로 이미지를 생성하고 처리할 수 있습니다.

## 모델 종류

| 모델 | ID | 특징 |
|------|-----|------|
| **Nano Banana 2** | `gemini-3.1-flash-image-preview` | 속도와 대량 처리에 최적화. Gemini 3 Pro Image의 고효율 버전 |
| **Nano Banana Pro** | `gemini-3-pro-image-preview` | 전문 에셋 제작용. 고급 추론("Thinking")으로 복잡한 지시 수행 및 고품질 텍스트 렌더링 |
| **Nano Banana** | `gemini-2.5-flash-image` | 속도와 효율성 최적화. 대량/저지연 작업용 |

## 모델 선택 가이드

- **Gemini 3.1 Flash Image Preview (Nano Banana 2)**: 기본 권장 모델. 성능/비용/지연 시간의 최적 밸런스
- **Gemini 3 Pro Image Preview (Nano Banana Pro)**: 전문 에셋 제작, 복잡한 지시 처리. Google Search 그라운딩, Thinking 프로세스, 최대 4K 해상도
- **Gemini 2.5 Flash Image (Nano Banana)**: 속도와 효율성 최적화. 1024px 해상도

## SDK 초기화 (JavaScript)

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

## 핵심 제약사항

- 지원 언어: EN, ar-EG, de-DE, es-MX, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, ua-UA, vi-VN, zh-CN
- 오디오/비디오 입력 미지원
- 정확한 출력 이미지 수를 보장하지 않을 수 있음
- 모든 생성 이미지에 SynthID 워터마크 포함
- `gemini-2.5-flash-image`: 최대 3개 입력 이미지
- `gemini-3-pro-image-preview`: 최대 5개 고품질 + 총 14개 이미지
- `gemini-3.1-flash-image-preview`: 캐릭터 유사성 최대 4명, 오브젝트 충실도 최대 10개
