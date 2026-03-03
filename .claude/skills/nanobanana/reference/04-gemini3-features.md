# Gemini 3 이미지 모델 고급 기능

Gemini 3 이미지 모델의 고급 기능들입니다.

## 고해상도 출력 (최대 4K)

기본 1K, 선택적으로 512px, 2K, 4K 출력 가능. **대문자 'K' 필수** (예: `1K`, `2K`, `4K`).

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "1:1",
      imageSize: "2K", // "512px", "1K", "2K", "4K"
    },
  },
});
```

## 최대 14개 참조 이미지

| 모델 | 오브젝트 이미지 | 캐릭터 이미지 |
|------|----------------|--------------|
| Gemini 3.1 Flash Image | 최대 10개 | 최대 4개 |
| Gemini 3 Pro Image | 최대 6개 | 최대 5개 |

```typescript
const contents = [
  { text: "An office group photo of these people, they are making funny faces." },
  { inlineData: { mimeType: "image/jpeg", data: base64Image1 } },
  { inlineData: { mimeType: "image/jpeg", data: base64Image2 } },
  { inlineData: { mimeType: "image/jpeg", data: base64Image3 } },
  // ... 최대 14개
];

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: contents,
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "5:4",
      imageSize: "2K",
    },
  },
});
```

## Google Search 그라운딩

실시간 정보 기반 이미지 생성 (날씨, 뉴스, 스포츠 결과 등).

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: "Visualize the current weather forecast for San Francisco",
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "16:9",
      imageSize: "2K",
    },
    tools: [{ googleSearch: {} }],
  },
});
```

응답에 `groundingMetadata` 포함:
- `searchEntryPoint`: Google Search 칩 렌더링용 HTML/CSS
- `groundingChunks`: 상위 3개 웹 소스

## Google Image Search 그라운딩 (3.1 Flash 전용)

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: "A detailed painting of a Timareta butterfly resting on a flower",
  config: {
    responseModalities: ["IMAGE"],
    tools: [
      {
        googleSearch: {
          searchTypes: {
            webSearch: {},
            imageSearch: {},
          },
        },
      },
    ],
  },
});
```

Image Search 사용 시 필수 조건:
- **출처 표시**: 소스 이미지가 포함된 웹페이지 링크 제공 필수
- **직접 내비게이션**: 소스 이미지에서 소스 웹페이지로 단일 클릭 경로 제공 필수

## Thinking 프로세스

Gemini 3 이미지 모델은 기본적으로 "Thinking" 추론 과정을 사용합니다. API에서 비활성화 불가.

- 최대 2개의 중간 이미지를 생성하여 구도와 로직 테스트
- Thinking 내 마지막 이미지가 최종 렌더링 이미지

### Thinking 레벨 제어 (3.1 Flash Image)

기본 `thinkingLevel`은 `minimal`, 지원 레벨: `minimal`, `high`.

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: "A futuristic city built inside a giant glass bottle floating in space",
  config: {
    responseModalities: ["IMAGE"],
    thinkingConfig: {
      thinkingLevel: "High",
      includeThoughts: true,
    },
  },
});

for (const part of response.candidates[0].content.parts) {
  if (part.thought) {
    // Thinking 과정 (스킵하거나 디버깅용으로 출력)
    continue;
  }
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync("image.png", buffer);
  }
}
```

> `includeThoughts` 값과 무관하게 thinking 토큰은 항상 과금됩니다.

### Thought Signatures

- 모든 응답에 `thought_signature` 필드 포함
- 공식 SDK의 chat 기능 사용 시 자동 처리됨
- 수동 관리 시: 응답의 `thought_signature`를 다음 턴에 그대로 전달해야 함
- 서명 규칙:
  - 이미지 `inline_data` parts (non-thought): 서명 있음
  - Thoughts 내 이미지: 서명 없음
  - 첫 번째 non-thought 텍스트 part: 서명 있음
