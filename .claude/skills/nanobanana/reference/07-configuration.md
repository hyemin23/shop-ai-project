# 설정 및 옵션

## 출력 타입 (Response Modalities)

기본값: `["TEXT", "IMAGE"]` (텍스트 + 이미지 동시 반환)

이미지만 반환:
```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
  config: {
    responseModalities: ["Image"],
  },
});
```

## 종횡비 & 이미지 크기

`config.imageConfig`에서 설정합니다.

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "16:9",
      imageSize: "2K",
    },
  },
});
```

### 지원 종횡비

#### Gemini 3.1 Flash Image Preview / 3 Pro Image Preview

| 종횡비 | 512px | 1K | 2K | 4K |
|--------|-------|-----|-----|-----|
| 1:1 | 512x512 | 1024x1024 | 2048x2048 | 4096x4096 |
| 2:3 | 424x632 | 848x1264 | 1696x2528 | 3392x5056 |
| 3:2 | 632x424 | 1264x848 | 2528x1696 | 5056x3392 |
| 3:4 | 448x600 | 896x1200 | 1792x2400 | 3584x4800 |
| 4:3 | 600x448 | 1200x896 | 2400x1792 | 4800x3584 |
| 4:5 | 464x576 | 928x1152 | 1856x2304 | 3712x4608 |
| 5:4 | 576x464 | 1152x928 | 2304x1856 | 4608x3712 |
| 9:16 | 384x688 | 768x1376 | 1536x2752 | 3072x5504 |
| 16:9 | 688x384 | 1376x768 | 2752x1536 | 5504x3072 |
| 21:9 | 792x168 | 1584x672 | 3168x1344 | 6336x2688 |

> **3.1 Flash Image Preview 전용** 추가 종횡비: `1:4`, `4:1`, `1:8`, `8:1`
> **3.1 Flash Image Preview 전용** 추가 해상도: `512px`

#### Gemini 2.5 Flash Image

| 종횡비 | 해상도 |
|--------|--------|
| 1:1 | 1024x1024 |
| 2:3 | 832x1248 |
| 3:2 | 1248x832 |
| 3:4 | 864x1184 |
| 4:3 | 1184x864 |
| 9:16 | 768x1344 |
| 16:9 | 1344x768 |

> `imageSize`는 대문자 'K' 필수: `"512px"`, `"1K"`, `"2K"`, `"4K"`

## config 구조 요약

```typescript
const config = {
  // 응답 형태
  responseModalities: ["TEXT", "IMAGE"],  // 대문자!

  // 이미지 설정
  imageConfig: {
    aspectRatio: "16:9",      // 종횡비
    imageSize: "2K",          // 해상도
  },

  // Thinking 설정 (3.1 Flash Image)
  thinkingConfig: {
    thinkingLevel: "High",    // "minimal" | "High"
    includeThoughts: true,    // thinking 과정 응답에 포함 여부
  },

  // 도구
  tools: [
    { googleSearch: {} },                                    // 웹 검색 그라운딩
    { googleSearch: { searchTypes: { webSearch: {}, imageSearch: {} } } },  // 이미지 검색 포함
  ],
};
```

## API 호출 패턴 요약

```typescript
// 기본 호출
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: contents,    // string | Part[]
  config: config,        // 위 config 구조
});

// Chat (multi-turn)
const chat = ai.chats.create({
  model: "gemini-3.1-flash-image-preview",
  config: config,
});
const response = await chat.sendMessage({ message, config });
```
