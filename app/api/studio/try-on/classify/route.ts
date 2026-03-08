import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const CLASSIFY_PROMPT = `Look at this clothing image. Classify the garment into exactly ONE category:
- "top" (t-shirt, shirt, blouse, knit, hoodie, sweatshirt, vest)
- "bottom" (pants, jeans, skirt, shorts)
- "outerwear" (jacket, coat, padding, cardigan, blazer — worn over another top)
- "one-piece" (dress, jumpsuit, overall, set that covers upper and lower body)

Respond with ONLY a JSON object, no markdown:
{"category": "<top|bottom|outerwear|one-piece>", "label": "<Korean label>", "description": "<1-sentence Korean description of the garment>"}`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("referenceImage") as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "참조 이미지가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: { mimeType, data: base64 },
        },
        { text: CLASSIFY_PROMPT },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.filter((p) => "text" in p)
      .map((p) => ("text" in p ? p.text : ""))
      .join("")
      .trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "분류 결과를 받지 못했습니다." },
        { status: 500 },
      );
    }

    // JSON 파싱 (마크다운 코드블록 제거)
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      category: result.category,
      label: result.label,
      description: result.description,
    });
  } catch (error) {
    console.error("[Classify] Error:", error);
    return NextResponse.json(
      { success: false, error: "의류 분류에 실패했습니다." },
      { status: 500 },
    );
  }
}
