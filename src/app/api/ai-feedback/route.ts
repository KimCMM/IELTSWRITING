import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

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
  const { writing, level, processTask, feedbackMode } = data;
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

    const prompt = buildPrompt(body);
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [{ role: "user" as const, content: prompt }];

    try {
      const response = await client.invoke(messages, {
        model: "doubao-seed-1-8-251228",
        temperature: 0.3,
      });

      const content = response.content;
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
      console.error("LLM invocation error:", fetchError);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "AI request timed out. Please try again." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: "AI service error. Please try again later." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("AI feedback route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
