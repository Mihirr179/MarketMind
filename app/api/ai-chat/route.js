export async function POST(request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!geminiApiKey) {
      return Response.json(
        { error: "Server not configured: GEMINI_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const contents = messages.map((m) => {
      const role = m?.role === "assistant" ? "model" : "user";
      const content = typeof m?.content === "string" ? m.content : "";
      return {
        role,
        parts: [{ text: content }],
      };
    });

    // Gemini expects: { contents: [{ parts: [{ text }], role? }] }
    const payload = {
      contents: contents.length
        ? contents
        : [
            {
              role: "user",
              parts: [{ text: "" }],
            },
          ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      geminiModel
    )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    console.log("Gemini Response:");
    console.dir(data, { depth: null });

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        "Gemini request failed";

      return Response.json(
        { error: errorMessage },
        { status: response.status || 500 }
      );
    }

   const generatedText =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

if (!generatedText) {
  return Response.json(
    {
      error: "AI service returned an empty response",
    },
    {
      status: 502,
    }
  );
}

return Response.json({
  reply: generatedText.trim(),
});
  } catch (err) {
    const errorMessage = err?.message || "Failed to generate AI response";
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

