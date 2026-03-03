# 이미지 생성 프롬프팅 가이드

> **핵심 원칙**: 키워드를 나열하지 말고, 장면을 묘사하세요. 서술적인 문단이 거의 항상 더 좋고 일관된 이미지를 만듭니다.

## 1. 사실적인 장면 (Photorealistic)

사진 용어 사용: 카메라 앵글, 렌즈 종류, 조명, 세부 디테일.

**템플릿:**
```
A photorealistic [shot type] of [subject], [action or expression], set in
[environment]. The scene is illuminated by [lighting description], creating
a [mood] atmosphere. Captured with a [camera/lens details], emphasizing
[key textures and details]. The image should be in a [aspect ratio] format.
```

**예시:**
```
A photorealistic close-up portrait of an elderly Japanese ceramicist with
deep, sun-etched wrinkles and a warm, knowing smile. He is carefully
inspecting a freshly glazed tea bowl. Captured with an 85mm portrait lens,
resulting in a soft, blurred background (bokeh). The overall mood is serene.
```

## 2. 스타일화된 일러스트 & 스티커

스타일, 배경, 아웃라인, 셰이딩을 명시적으로 지정.

**템플릿:**
```
A [style] sticker of a [subject], featuring [key characteristics] and a
[color palette]. The design should have [line style] and [shading style].
The background must be transparent.
```

**예시:**
```
A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat.
It's munching on a green bamboo leaf. The design features bold, clean
outlines, simple cel-shading, and a vibrant color palette. The background
must be white.
```

## 3. 정확한 텍스트 렌더링

텍스트 내용, 폰트 스타일, 전체 디자인을 명확히 지정. Gemini 3 Pro Image가 최적.

**템플릿:**
```
Create a [image type] for [brand/concept] with the text "[text to render]"
in a [font style]. The design should be [style description], with a
[color scheme].
```

**예시:**
```
Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'.
The text should be in a clean, bold, sans-serif font. The color scheme is
black and white. Put the logo in a circle. Use a coffee bean in a clever way.
```

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
  config: {
    imageConfig: {
      aspectRatio: "1:1",
    },
  },
});
```

## 4. 제품 목업 & 상업 사진

깨끗하고 전문적인 제품 샷 생성.

**템플릿:**
```
A high-resolution, studio-lit product photograph of a [product description]
on a [background surface]. The lighting is a [lighting setup] to [purpose].
The camera angle is a [angle type] to showcase [specific feature].
Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio].
```

## 5. 미니멀리스트 & 네거티브 스페이스

웹사이트, 프레젠테이션, 마케팅 배경용.

**템플릿:**
```
A minimalist composition featuring a single [subject] positioned in the
[bottom-right/top-left/etc.] of the frame. The background is a vast, empty
[color] canvas, creating significant negative space. Soft, subtle lighting.
[Aspect ratio].
```

## 6. 순차 아트 (만화 패널 / 스토리보드)

캐릭터 일관성과 장면 묘사를 결합한 비주얼 스토리텔링. Gemini 3 Pro / 3.1 Flash에 최적.

**템플릿:**
```
Make a 3 panel comic in a [style]. Put the character in a [type of scene].
```

```typescript
const prompt = [
  { text: "Make a 3 panel comic in a gritty, noir art style..." },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64CharacterImage,
    },
  },
];
```

## 7. Google Search 그라운딩 활용

실시간 정보 기반 이미지 생성 (뉴스, 날씨 등).

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: "Make a simple but stylish graphic of last night's Arsenal game",
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
    tools: [{ googleSearch: {} }],
  },
});
```
