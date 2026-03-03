# Image Editing (이미지 편집)

이미지와 텍스트 프롬프트를 조합하여 요소를 추가/제거/수정하거나, 스타일을 변경하거나, 색상을 조정합니다.

## 단일 이미지 편집

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const imagePath = "path/to/cat_image.png";
const imageData = fs.readFileSync(imagePath);
const base64Image = imageData.toString("base64");

const prompt = [
  { text: "Create a picture of my cat eating a nano-banana in a fancy restaurant" },
  {
    inlineData: {
      mimeType: "image/png",
      data: base64Image,
    },
  },
];

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
});

for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync("edited-image.png", buffer);
  }
}
```

## Multi-turn 이미지 편집

대화형으로 이미지를 반복 수정합니다. Chat API를 사용하면 이전 컨텍스트를 유지합니다.

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chat = ai.chats.create({
  model: "gemini-3.1-flash-image-preview",
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    tools: [{ googleSearch: {} }],
  },
});

// 첫 번째 요청
const message = "Create a vibrant infographic that explains photosynthesis...";
let response = await chat.sendMessage({ message });

for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync("infographic.png", buffer);
  }
}

// 두 번째 요청 (수정)
const editMessage = "Update this infographic to be in Spanish. Do not change any other elements.";
const aspectRatio = "16:9";
const resolution = "2K";

response = await chat.sendMessage({
  message: editMessage,
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: aspectRatio,
      imageSize: resolution,
    },
    tools: [{ googleSearch: {} }],
  },
});

for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync("infographic_spanish.png", buffer);
  }
}
```

## contents 구조

편집 시 contents는 Part 객체 배열로 구성합니다:

```typescript
const contents = [
  { text: "편집 지시사항" },
  {
    inlineData: {
      mimeType: "image/png",
      data: base64EncodedImage,
    },
  },
];
```

- text와 inlineData Part의 순서는 유연하게 배치 가능
- 여러 이미지를 포함할 수 있음 (모델별 제한 참고)
