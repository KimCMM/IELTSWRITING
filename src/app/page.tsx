"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Sparkles, Wand2 } from "lucide-react";

const passiveExercises = {
  beginner: [
    {
      active: "People crush the seeds.",
      subject: "The seeds",
      answer: "The seeds are crushed.",
      explanation: "Use the present simple passive: are + past participle."
    },
    {
      active: "Workers heat the mixture.",
      subject: "The mixture",
      answer: "The mixture is heated.",
      explanation: "Use is + heated because the subject is singular."
    },
    {
      active: "People filter the liquid.",
      subject: "The liquid",
      answer: "The liquid is filtered.",
      explanation: "Use the passive to focus on the process, not the doer."
    }
  ],
  intermediate: [
    {
      active: "Workers dry the beans in the sun.",
      subject: "The beans",
      answer: "The beans are dried in the sun.",
      explanation: "Keep the extra detail after the passive verb."
    },
    {
      active: "Machines remove the shells.",
      subject: "The shells",
      answer: "The shells are removed.",
      explanation: "The object becomes the subject in passive voice."
    },
    {
      active: "Workers pour the oil into a container.",
      subject: "The oil",
      answer: "The oil is poured into a container.",
      explanation: "Use is poured to describe a stage in a process."
    }
  ],
  advanced: [
    {
      active: "Technicians transfer the mixture to a cooling chamber.",
      subject: "The mixture",
      answer: "The mixture is transferred to a cooling chamber.",
      explanation: "Use a full passive form with precise process vocabulary."
    },
    {
      active: "Workers separate the remaining solids from the liquid.",
      subject: "The remaining solids",
      answer: "The remaining solids are separated from the liquid.",
      explanation: "Make sure the plural subject matches are separated."
    },
    {
      active: "Machines compress the material before packaging.",
      subject: "The material",
      answer: "The material is compressed before packaging.",
      explanation: "The time phrase remains after the passive verb phrase."
    }
  ]
};

const sequencingExercises = {
  beginner: [
    {
      sentence: "__________, the mixture is heated.",
      options: ["Initially", "Finally", "In contrast"],
      answer: "Initially",
      explanation: "This stage happens at the beginning, so Initially is the best choice."
    },
    {
      sentence: "The seeds are crushed. __________, the oil is extracted.",
      options: ["Next", "For example", "On the other hand"],
      answer: "Next",
      explanation: "Next shows the following step in a sequence."
    },
    {
      sentence: "The liquid is filtered. __________, it is stored in tanks.",
      options: ["Finally", "Similarly", "However"],
      answer: "Finally",
      explanation: "Finally is used for the last stage of a process."
    }
  ],
  intermediate: [
    {
      sentence: "__________, the beans are dried before being transported.",
      options: ["Subsequently", "In contrast", "For instance"],
      answer: "Subsequently",
      explanation: "Subsequently is a formal sequencing linker for a later stage."
    },
    {
      sentence: "The shell is removed. __________, the inner material is washed.",
      options: ["After that", "Likewise", "By comparison"],
      answer: "After that",
      explanation: "After that is used to continue the process in order."
    },
    {
      sentence: "The mixture is left to cool. __________, it is packaged.",
      options: ["Thereafter", "Nevertheless", "For example"],
      answer: "Thereafter",
      explanation: "Thereafter is suitable for a later step in a formal process description."
    }
  ],
  advanced: [
    {
      sentence: "The raw material is inspected. __________, it is processed in a sealed chamber.",
      options: ["Subsequently", "In addition", "For instance"],
      answer: "Subsequently",
      explanation: "Subsequently accurately shows the next ordered stage."
    },
    {
      sentence: "The liquid is purified. __________, any remaining waste is removed.",
      options: ["Following this", "In comparison", "As a result of this example"],
      answer: "Following this",
      explanation: "Following this is a natural formal linker in process writing."
    },
    {
      sentence: "The final product is checked for quality. __________, it is sent to retailers.",
      options: ["Once this has been completed", "However", "Similarly"],
      answer: "Once this has been completed",
      explanation: "This linker clearly marks a completed stage before the next step."
    }
  ]
};

const paragraphTasks = {
  beginner: {
    notes: ["The seeds are crushed.", "The oil is extracted.", "The liquid is filtered."],
    model: "First, the seeds are crushed. Next, the oil is extracted. Finally, the liquid is filtered.",
    hint: "Use First, Next, and Finally. Keep all verbs in the passive voice."
  },
  intermediate: {
    notes: [
      "The seeds are crushed.",
      "The oil is extracted from the seeds.",
      "The liquid is filtered before storage."
    ],
    model:
      "Initially, the seeds are crushed, after which the oil is extracted from them. Finally, the liquid is filtered before being stored.",
    hint: "Try joining steps into one or two sentences with linkers such as initially, after which, and finally."
  },
  advanced: {
    notes: [
      "The seeds are crushed in a machine.",
      "The oil is extracted under pressure.",
      "The liquid is filtered to remove waste materials."
    ],
    model:
      "Initially, the seeds are crushed in a machine, after which the oil is extracted under pressure. In the final stage, the liquid is filtered to remove any remaining waste materials.",
    hint: "Use formal sequencing language and add a little extra detail without making the paragraph too long."
  }
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
}

function compareAnswer(input: string, target: string): boolean {
  return normalize(input) === normalize(target);
}

function scoreParagraph(text: string): string[] {
  const lower = text.toLowerCase();
  const sequencingWords = [
    "first",
    "initially",
    "next",
    "after that",
    "following this",
    "subsequently",
    "finally",
    "in the final stage"
  ];
  const passiveMarkers = ["is ", "are ", "was ", "were ", "being "];

  const sequencingHit = sequencingWords.some((w) => lower.includes(w));
  const passiveHit = passiveMarkers.some((w) => lower.includes(w));
  const noteCount = ["crushed", "extracted", "filtered"].filter((w) => lower.includes(w)).length;

  const feedback: string[] = [];

  if (noteCount >= 3) {
    feedback.push("You included all the main process steps.");
  } else {
    feedback.push("Try to include all three key steps in your paragraph.");
  }

  if (sequencingHit) {
    feedback.push("Your paragraph uses sequencing language to show order.");
  } else {
    feedback.push("Add sequencing linkers such as Initially, Next, or Finally.");
  }

  if (passiveHit) {
    feedback.push("You attempted passive voice, which is important for process diagrams.");
  } else {
    feedback.push("Use passive voice to describe the process stages more appropriately.");
  }

  return feedback;
}

export default function ProcessWritingTrainingWebapp() {
  const [level, setLevel] = useState("beginner");

  const passiveSet = useMemo(() => passiveExercises[level as keyof typeof passiveExercises], [level]);
  const sequencingSet = useMemo(() => sequencingExercises[level as keyof typeof sequencingExercises], [level]);
  const paragraphSet = useMemo(() => paragraphTasks[level as keyof typeof paragraphTasks], [level]);

  const [passiveAnswers, setPassiveAnswers] = useState<Record<number, string>>({});
  const [passiveResults, setPassiveResults] = useState<Record<number, { correct: boolean; message: string; answer: string }>>({});

  const [sequencingAnswers, setSequencingAnswers] = useState<Record<number, string>>({});
  const [sequencingResults, setSequencingResults] = useState<Record<number, { correct: boolean; message: string; answer: string }>>({});

  const [paragraph, setParagraph] = useState("");
  const [paragraphFeedback, setParagraphFeedback] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showModel, setShowModel] = useState(false);

  const handlePassiveCheck = (index: number) => {
    const exercise = passiveSet[index];
    const input = passiveAnswers[index] || "";
    const correct = compareAnswer(input, exercise.answer);
    setPassiveResults((prev) => ({
      ...prev,
      [index]: {
        correct,
        message: correct
          ? "Correct. Well done."
          : `Incorrect. ${exercise.explanation}`,
        answer: exercise.answer
      }
    }));
  };

  const handleSequencingCheck = (index: number) => {
    const exercise = sequencingSet[index];
    const input = sequencingAnswers[index] || "";
    const correct = input === exercise.answer;
    setSequencingResults((prev) => ({
      ...prev,
      [index]: {
        correct,
        message: correct ? "Correct. The sequencing logic works well." : `Incorrect. ${exercise.explanation}`,
        answer: exercise.answer
      }
    }));
  };

  const handleParagraphCheck = () => {
    setParagraphFeedback(scoreParagraph(paragraph));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full">IELTS Academic Task 1</Badge>
                <Badge variant="secondary" className="rounded-full">Process Diagram</Badge>
                <Badge variant="outline" className="rounded-full">Controlled Practice</Badge>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">
                Process Writing Training Web App
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                A classroom-friendly prototype for practising passive voice, sequencing language, and paragraph building in
                process-diagram writing. This version includes rule-based feedback and reserved areas for future AI integration.
              </p>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Level Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Choose learner level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-xl border bg-slate-100 p-3 text-sm text-slate-700">
                <p className="font-medium">Suggested AI extension</p>
                <p className="mt-1 text-slate-600">
                  Replace the current feedback logic with API calls so the app can generate tasks, check answers, and offer level-
                  specific guidance dynamically.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="passive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="passive" className="rounded-xl">Part 1 Passive Voice</TabsTrigger>
            <TabsTrigger value="sequencing" className="rounded-xl">Part 2 Sequencing</TabsTrigger>
            <TabsTrigger value="paragraph" className="rounded-xl">Part 3 Paragraph Building</TabsTrigger>
          </TabsList>

          <TabsContent value="passive">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wand2 className="h-5 w-5" /> Passive Voice Transformation
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Rewrite each active sentence in the passive voice. Focus on accurate verb form and process-writing style.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {passiveSet.map((item, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Original sentence</p>
                    <p className="mt-1 text-base text-slate-900">{item.active}</p>
                    <p className="mt-4 text-sm font-medium text-slate-500">Rewrite</p>
                    <div className="mt-2 flex flex-col gap-3 md:flex-row">
                      <div className="flex-1">
                        <Input
                          className="rounded-xl"
                          value={passiveAnswers[index] || ""}
                          onChange={(e) => setPassiveAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                          placeholder={`${item.subject} ...`}
                        />
                      </div>
                      <Button className="rounded-xl" onClick={() => handlePassiveCheck(index)}>
                        Check Answer
                      </Button>
                    </div>
                    {passiveResults[index] && (
                      <div
                        className={`mt-3 rounded-xl border p-3 text-sm ${
                          passiveResults[index].correct
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {passiveResults[index].correct ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4" />
                          ) : (
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                          )}
                          <div>
                            <p>{passiveResults[index].message}</p>
                            {!passiveResults[index].correct && (
                              <p className="mt-1 font-medium">Correct answer: {passiveResults[index].answer}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sequencing">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5" /> Sequencing Language Gap Fill
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Choose the best linker to show the correct order of steps in a process.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {sequencingSet.map((item, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4">
                    <p className="text-base text-slate-900">{item.sentence}</p>
                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      {item.options.map((option) => (
                        <Button
                          key={option}
                          variant={sequencingAnswers[index] === option ? "default" : "outline"}
                          className="justify-start rounded-xl"
                          onClick={() => setSequencingAnswers((prev) => ({ ...prev, [index]: option }))}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Button className="rounded-xl" onClick={() => handleSequencingCheck(index)}>
                        Check Answer
                      </Button>
                    </div>
                    {sequencingResults[index] && (
                      <div
                        className={`mt-3 rounded-xl border p-3 text-sm ${
                          sequencingResults[index].correct
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {sequencingResults[index].correct ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4" />
                          ) : (
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                          )}
                          <div>
                            <p>{sequencingResults[index].message}</p>
                            {!sequencingResults[index].correct && (
                              <p className="mt-1 font-medium">Best answer: {sequencingResults[index].answer}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paragraph">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Sentence-to-Paragraph Building</CardTitle>
                  <p className="text-sm text-slate-600">
                    Combine the notes into one coherent paragraph. Use passive voice and sequencing language.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Task notes</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {paragraphSet.notes.map((note, index) => (
                        <li key={index}>• {note}</li>
                      ))}
                    </ul>
                  </div>

                  <Textarea
                    className="min-h-[220px] rounded-2xl"
                    placeholder="Write your paragraph here..."
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-xl" onClick={handleParagraphCheck}>
                      Check Paragraph
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowHint((prev) => !prev)}>
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setShowModel((prev) => !prev)}>
                      {showModel ? "Hide Model" : "Show Model"}
                    </Button>
                  </div>

                  {paragraphFeedback.length > 0 && (
                    <div className="rounded-2xl border bg-white p-4">
                      <p className="text-sm font-medium text-slate-700">Feedback</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        {paragraphFeedback.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    {showHint && (
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="font-medium">Hint</p>
                        <p className="mt-1 text-slate-600">{paragraphSet.hint}</p>
                      </div>
                    )}
                    {showModel && (
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="font-medium">Model answer</p>
                        <p className="mt-1 leading-6 text-slate-600">{paragraphSet.model}</p>
                      </div>
                    )}
                    {!showHint && !showModel && (
                      <div className="rounded-2xl border border-dashed bg-slate-50 p-4 text-slate-500">
                        Open Hint or Model to support learners when needed.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Integration Area</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>
                      This prototype currently uses built-in logic for demonstration. In a production version, this section can be connected to an AI endpoint for:
                    </p>
                    <ul className="space-y-2">
                      <li>• dynamic task generation based on level</li>
                      <li>• short grammar feedback on passive voice</li>
                      <li>• sequencing logic evaluation</li>
                      <li>• paragraph revision suggestions</li>
                    </ul>
                    <div className="rounded-xl bg-slate-100 p-3 font-mono text-xs text-slate-700">
                      API placeholder: /api/check-writing or /api/generate-task
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
