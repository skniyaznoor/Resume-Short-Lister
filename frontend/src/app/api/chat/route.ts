import { OpenRouter } from "@openrouter/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const stream = await openrouter.chat.send({
      chatRequest: {
        model: "openai/gpt-oss-120b:free",
        messages: messages,
        stream: true,
      }
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
            
            // Usage information comes in the final chunk
            const usage = chunk.usage as any;
            if (usage && usage.reasoningTokens) {
              const usageText = `\n\n> **Reasoning tokens used:** ${usage.reasoningTokens}\n`;
              controller.enqueue(encoder.encode(usageText));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
