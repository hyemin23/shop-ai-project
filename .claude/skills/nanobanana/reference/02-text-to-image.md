# Text-to-Image 생성

텍스트 프롬프트만으로 이미지를 생성합니다.

## 기본 패턴

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
});

for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const imageData = part.inlineData.data;
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync("gemini-native-image.png", buffer);
  }
}
```

## 핵심 포인트

- `contents`에 텍스트 문자열을 직접 전달
- 응답의 `candidates[0].content.parts`를 순회하며 `text` 또는 `inlineData` 확인
- `inlineData.data`는 base64 인코딩된 이미지 데이터
- 별도 `config` 없이도 기본 이미지 생성 가능
