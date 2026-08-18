import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { question, knowledgeBase, centreName } = await req.json();
  if (!question) return NextResponse.json({ error: "Missing question" }, { status: 400 });

  const systemPrompt = `You are VP (Virtual Paul), an expert assistant for leisure centre staff${centreName ? ` at ${centreName}` : ""}.
Match your answer's length and detail to the question. A short, simple question (e.g. "pool hours", "phone number") gets a short, direct answer — just the relevant fact(s), no tables, no checklists, no extra caveats unless directly relevant. Only give a full breakdown (tables, sections, notes) when the question is broad or explicitly asks for an overview or all the details.
${knowledgeBase
  ? `Use the knowledge base below to answer questions. Be concise, clear, and helpful. If the answer is not in the knowledge base, say so honestly.\n\nKNOWLEDGE BASE:\n${knowledgeBase}`
  : "Answer as helpfully as possible based on your general knowledge about leisure centres."}`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
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
