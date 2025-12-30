import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing on server." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    // We use Responses API via REST to avoid SDK dependency issues.
    const system = `
You are a BPMN + Swimlane generator.
Return ONLY valid JSON (no markdown).
Schema:
{
  "orientation": "horizontal" | "vertical",
  "lanes": [ "Lane A", "Lane B", ... ],
  "nodes": [
    { "id": "n1", "kind": "start_event|end_event|task|gateway_xor_split|gateway_xor_merge|subprocess|intermediate_message|intermediate_timer",
      "label": "text",
      "lane": "Lane A",
      "x": number, "y": number,
      "meta": { "actors": string, "applications": string }
    }
  ],
  "edges": [ { "source": "n1", "target": "n2" } ]
}
Rules:
- Always include start_event and end_event.
- Use 4-12 nodes total.
- lanes must be 3-8 items.
- edges must connect into a coherent flow.
`;

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        // Encourage deterministic JSON
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return NextResponse.json({ error: `OpenAI error: ${t || resp.status}` }, { status: 500 });
    }

    const data = await resp.json();
    const text =
      data?.output_text ??
      data?.output?.[0]?.content?.[0]?.text ??
      data?.output?.[0]?.content?.[0]?.value ??
      "";

    const parsed = typeof text === "string" ? safeJsonParse(text) : null;
    if (!parsed) {
      return NextResponse.json(
        { error: "AI did not return valid JSON. Try a shorter prompt." },
        { status: 500 }
      );
    }

    // minimal validation
    if (!Array.isArray(parsed.lanes) || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return NextResponse.json({ error: "AI response missing lanes/nodes/edges arrays." }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
