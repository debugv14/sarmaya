import type { NextRequest } from "next/server";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { prompt as system_prompt } from "../../lib/systemPrompt";

const replySchema = z.object({
  message: z.string(),
  poetry: z.object({
    included: z.boolean(),
    type: z.enum(["recommendation", "quote"]).nullable(),
    poet: z.string().nullable(),
    title: z.string().nullable(),
    reason: z.string().nullable(),
  }),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message =
    typeof body === "object" && body !== null && "message" in body
      ? (body as { message: unknown }).message
      : undefined;

  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json(
      { error: "`message` is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const received = message.trim();

  try {
    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      system: system_prompt,
      prompt: received,
      output: Output.object({ schema: replySchema }),
    });

    return Response.json(
      { ok: true, received, reply: output },
      { status: 201 }
    );
  } catch (err) {
    console.error("LLM request failed:", err);
    return Response.json(
      { error: "Failed to generate a response" },
      { status: 502 }
    );
  }
}
