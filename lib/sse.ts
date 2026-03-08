export async function consumeSSEStream<T>(
  response: Response,
  onEvent: (event: T) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

  const decoder = new TextDecoder();
  let buffer = "";

  function processLines(text: string) {
    const chunks = text.split("\n\n").filter(Boolean);
    for (const chunk of chunks) {
      const dataLine = chunk
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      onEvent(JSON.parse(dataLine.slice(6)));
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim()) processLines(buffer);
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    if (lines.length > 0) {
      processLines(lines.join("\n\n"));
    }
  }
}
