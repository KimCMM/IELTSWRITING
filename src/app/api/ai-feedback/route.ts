import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

interface AIFeedbackRequest {
  writing: string;
  level: string;
  processTitle: string;
  processDescription: string;
}

interface ErrorItem {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
}

interface AIFeedbackResponse {
  estimatedBand: string;
  summary: string;
  errors: ErrorItem[];
  strengths: string[];
  nextSteps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { writing, level, processTitle, processDescription }: AIFeedbackRequest = await request.json();

    if (!writing || writing.trim().length === 0) {
      return NextResponse.json({ error: "Writing content is required" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `You are an expert IELTS Academic Writing Task 1 examiner specializing in process diagram writing. You provide detailed, constructive feedback on student writings.

When analyzing the writing, consider:
1. Passive voice accuracy (present simple passive for process diagrams)
2. Sequencing linkers (first, then, next, finally, subsequently, after which, followed by)
3. Pronoun usage to avoid repetition (it, they, them)
4. Vocabulary precision (formal verbs, accurate terminology)
5. Sentence structure complexity
6. Grammar accuracy

Provide your feedback in JSON format with this structure:
{
  "estimatedBand": "X.X",
  "summary": "Brief overall assessment paragraph",
  "errors": [
    {
      "type": "grammar|lexis|cohesion|spelling",
      "original": "the exact error text from the writing",
      "suggestion": "corrected version",
      "explanation": "why this is an error"
    }
  ],
  "strengths": ["list of 2-3 things done well"],
  "nextSteps": ["2-3 specific improvement suggestions"]
}

Be specific and constructive. Focus on errors that would affect the IELTS band score.`;

    const userPrompt = `Please analyze this IELTS Writing Task 1 process paragraph written for a ${level.toUpperCase()} target band:

Process: ${processTitle}
Task description: ${processDescription}

Student's writing:
${writing}

Word count: ${writing.split(/\s+/).filter(Boolean).length}

Provide detailed feedback focusing on:
1. Does the writing accurately describe the process steps?
2. Is the passive voice used correctly?
3. Are sequencing linkers appropriate?
4. Is vocabulary accurate and appropriate for the level?
5. What would improve the score to the next band?`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-1-8-251228",
      temperature: 0.7,
    });

    let feedback: AIFeedbackResponse;
    
    try {
      const content = response.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        feedback = {
          estimatedBand: level === "band55" ? "5.5" : level === "band6" ? "6.0" : "6.5",
          summary: content,
          errors: [],
          strengths: ["Writing submitted"],
          nextSteps: ["Review feedback and try again"]
        };
      }
    } catch {
      feedback = {
        estimatedBand: level === "band55" ? "5.5" : level === "band6" ? "6.0" : "6.5",
        summary: response.content,
        errors: [],
        strengths: [],
        nextSteps: []
      };
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("AI Feedback API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI feedback. Please try again." },
      { status: 500 }
    );
  }
}
