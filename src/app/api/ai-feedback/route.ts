import { NextRequest, NextResponse } from "next/server";

interface AIFeedbackRequest {
  writing: string;
  level: string;
  processTitle: string;
  processTask: string;
  feedbackMode?: string;
  instruction?: string;
}

interface ErrorItem {
  type: string;
  original?: string;
  suggestion?: string;
  explanation?: string;
}

interface AIFeedbackResponse {
  estimatedBand?: string;
  summary?: string;
  errors: ErrorItem[];
  strengths?: string[];
  nextSteps?: string[];
}

function buildPrompt(data: AIFeedbackRequest): string {
  const { writing, level, processTitle, processTask, feedbackMode } = data;
  const levelMap: Record<string, string> = {
    band55: "5.5",
    band6: "6.0",
    band65: "6.5",
  };
  const targetBand = levelMap[level] || "6.0";

  if (feedbackMode === "error-types-only") {
    return `You are an IELTS Academic Writing Task 1 examiner. Your task is ONLY to identify and label language errors in a process paragraph.

## TASK DESCRIPTION
${processTask}

## CANDIDATE'S PARAGRAPH
${writing}

## INSTRUCTIONS
Analyze the paragraph for language errors only. Classify each error into ONE of these types:
- "grammar": subject-verb agreement, verb form, article errors, word order
- "lexis": wrong word choice, inappropriate register, collocation errors
- "spelling": spelling mistakes
- "cohesion": missing or wrong linkers, pronoun reference problems
- "task": missing key stages, missing passive voice, missing important details

## OUTPUT FORMAT
Return a JSON object with an "errors" array. Each error object must have:
- "type": the error classification (grammar/lexis/spelling/cohesion/task)
- "original": the exact error phrase from the text (or a brief description if the issue spans multiple words)

Do NOT provide corrections, suggestions, or explanations. Only label the errors.

## EXAMPLE
Input paragraph: "The strips is crushed and fibres are spinned."
Output: {"errors": [{"type": "grammar", "original": "is crushed"}, {"type": "spelling", "original": "spinned"}]}

## YOUR RESPONSE (JSON only, no markdown):`;
  }

  return `You are an IELTS Academic Writing Task 1 examiner. Evaluate the following process paragraph.

## TASK DESCRIPTION
${processTask}

## CANDIDATE'S PARAGRAPH
${writing}

## TARGET BAND
${targetBand}

## EVALUATION CRITERIA
1. Grammar accuracy (passive voice, subject-verb agreement, tense)
2. Lexical resource (word choice, collocation, register)
3. Spelling accuracy
4. Cohesion (linkers, pronoun reference, flow)
5. Task achievement (key stages covered, relevant details)

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "estimatedBand": "5.5" or "6.0" or "6.5",
  "summary": "Brief overall assessment (1-2 sentences)",
  "errors": [
    {"type": "error type", "original": "exact phrase", "suggestion": "correct form", "explanation": "why it's wrong"}
  ],
  "strengths": ["list of 2-3 things done well"],
  "nextSteps": ["2-3 specific improvement areas"]
}

## YOUR RESPONSE (JSON only, no markdown):`;
}

function extractJSON(text: string): Record<string, unknown> | null {
  const patterns = [
    /\{[\s\S]*"errors"[\s\S]*\}/,
    /```json\s*([\s\S]*?)\s*```/,
    /\{[\s\S]+\}/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] || match[0];
        return JSON.parse(jsonStr);
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIFeedbackRequest;
    const { writing, feedbackMode } = body;

    if (!writing || typeof writing !== "string" || writing.trim().length === 0) {
      return NextResponse.json(
        { error: "Writing content is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DOUBAO_API_KEY;
    if (!apiKey) {
      console.error("DOUBAO_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(body);
    const model = "doubao-seed-1-8-251228";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch(
        `https://ark.cn-beijing.volces.com/api/v3/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: feedbackMode === "error-types-only" ? 800 : 1500,
            temperature: 0.3,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Doubao API error:", response.status, errorText);
        return NextResponse.json(
          { error: `AI service returned ${response.status}` },
          { status: 502 }
        );
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      };

      if (data.error) {
        return NextResponse.json(
          { error: data.error.message || "AI service error" },
          { status: 502 }
        );
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json(
          { error: "Empty response from AI service" },
          { status: 502 }
        );
      }

      const parsed = extractJSON(content);
      if (!parsed) {
        if (feedbackMode === "error-types-only") {
          return NextResponse.json({ errors: [] });
        }
        return NextResponse.json({
          estimatedBand: "6.0",
          summary: "Unable to parse AI response. Please try again.",
          errors: [],
          strengths: [],
          nextSteps: [],
        });
      }

      const result: AIFeedbackResponse = {
        estimatedBand: parsed.estimatedBand as string | undefined,
        summary: parsed.summary as string | undefined,
        errors: (parsed.errors as ErrorItem[]) || [],
        strengths: parsed.strengths as string[] | undefined,
        nextSteps: parsed.nextSteps as string[] | undefined,
      };

      return NextResponse.json(result);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "AI request timed out. Please try again." },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("AI feedback route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
