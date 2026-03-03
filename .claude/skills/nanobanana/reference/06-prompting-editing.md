# 이미지 편집 프롬프팅 가이드

이미지와 텍스트 프롬프트를 함께 제공하여 편집, 합성, 스타일 전환을 수행합니다.

## 1. 요소 추가/제거

이미지를 제공하고 변경사항을 설명합니다. 모델이 원본의 스타일, 조명, 원근을 매칭합니다.

**템플릿:**
```
Using the provided image of [subject], please [add/remove/modify] [element]
to/from the scene. Ensure the change is [description of how it should integrate].
```

**예시:**
```
Using the provided image of my cat, please add a small, knitted wizard hat
on its head. Make it look like it's sitting comfortably and matches the soft
lighting of the photo.
```

## 2. 인페인팅 (Semantic Masking)

대화형으로 "마스크"를 정의하여 이미지의 특정 부분만 편집합니다.

**템플릿:**
```
Using the provided image, change only the [specific element] to [new
element/description]. Keep everything else in the image exactly the same,
preserving the original style, lighting, and composition.
```

**예시:**
```
Using the provided image of a living room, change only the blue sofa to be
a vintage, brown leather chesterfield sofa. Keep the rest of the room,
including the pillows on the sofa and the lighting, unchanged.
```

```typescript
const prompt = [
  {
    inlineData: {
      mimeType: "image/png",
      data: base64LivingRoom,
    },
  },
  { text: "Using the provided image of a living room, change only the blue sofa..." },
];

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
});
```

## 3. 스타일 전환

이미지를 제공하고 다른 예술적 스타일로 재생성을 요청합니다.

**템플릿:**
```
Transform the provided photograph of [subject] into the artistic style of
[artist/art style]. Preserve the original composition but render it with
[description of stylistic elements].
```

**예시:**
```
Transform the provided photograph of a modern city street at night into the
artistic style of Vincent van Gogh's 'Starry Night'. Preserve the original
composition but render all elements with swirling, impasto brushstrokes.
```

## 4. 고급 합성: 여러 이미지 결합

여러 이미지를 컨텍스트로 제공하여 새로운 합성 장면을 생성합니다.

**템플릿:**
```
Create a new image by combining the elements from the provided images. Take
the [element from image 1] and place it with/on the [element from image 2].
The final image should be a [description of the final scene].
```

**예시 (패션 이커머스):**
```
Create a professional e-commerce fashion photo. Take the blue floral dress
from the first image and let the woman from the second image wear it.
Generate a realistic, full-body shot of the woman wearing the dress.
```

```typescript
const prompt = [
  { inlineData: { mimeType: "image/png", data: base64Dress } },
  { inlineData: { mimeType: "image/png", data: base64Model } },
  { text: "Create a professional e-commerce fashion photo. Take the dress from the first image..." },
];

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
});
```

## 5. 고충실도 디테일 보존

얼굴이나 로고 같은 중요 디테일을 보존하면서 편집할 때, 보존할 요소를 상세히 설명합니다.

**템플릿:**
```
Using the provided images, place [element from image 2] onto [element from
image 1]. Ensure that the features of [element from image 1] remain
completely unchanged.
```

**예시:**
```
Take the first image of the woman with brown hair, blue eyes, and a neutral
expression. Add the logo from the second image onto her black t-shirt.
Ensure the woman's face and features remain completely unchanged. The logo
should look like it's naturally printed on the fabric.
```

## 6. 스케치를 실제 이미지로 변환

러프 스케치나 드로잉을 완성된 이미지로 정제합니다.

**템플릿:**
```
Turn this rough [medium] sketch of a [subject] into a [style description]
photo. Keep the [specific features] from the sketch but add [new details].
```

**예시:**
```
Turn this rough pencil sketch of a futuristic car into a polished photo of
the finished concept car in a showroom. Keep the sleek lines and low profile
from the sketch but add metallic blue paint and neon rim lighting.
```

## 7. 캐릭터 일관성: 360도 뷰

다양한 각도로 반복 프롬프팅하여 캐릭터의 360도 뷰를 생성합니다. 이전 생성 이미지를 포함하면 일관성이 향상됩니다.

**템플릿:**
```
A studio portrait of [person] against [background],
[looking forward/in profile looking right/etc.]
```

```typescript
const prompt = [
  { text: "A studio portrait of this man against white, in profile looking right" },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64CharacterImage,
    },
  },
];
```
