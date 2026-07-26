import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { question, knowledgeBase, centreName } = await req.json();
  if (!question) return NextResponse.json({ error: "Missing question" }, { status: 400 });

  const systemPrompt = `You are VP (Virtual Paul), an expert assistant for leisure centre staff${centreName ? ` at ${centreName}` : ""}.
${knowledgeBase
  ? `Use the knowledge base below to answer questions. Be concise, clear, and helpful. If the answer is not in the knowledge base, say so honestly.\n\nKNOWLEDGE BASE:\n${knowledgeBase}`
  : "Answer as helpfully as possible based on your general knowledge about leisure centres."}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const answer = completion.choices[0]?.message?.content ?? "No response generated.";
  return NextResponse.json({ answer });
}
