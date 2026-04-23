"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Wand2, Sparkles, Clock3, FileText } from "lucide-react";

const processData = {
  title: "How bamboo fabric is made",
  steps: [
    "Bamboo is planted in spring.",
    "It is harvested in autumn.",
    "It is cut into strips.",
    "The strips are crushed.",
    "The fibres are filtered.",
    "The fibres are softened.",
    "The fibres are spun into yarn.",
    "The yarn is woven into fabric."
  ]
};

const passiveExercises = {
  beginner: [
    {
      prompt: "People plant bamboo in spring.",
      subject: "Bamboo",
      answer: "Bamboo is planted in spring.",
      explanation: "Use the present simple passive: is + past participle."
    },
    {
      prompt: "Workers harvest bamboo in autumn.",
      subject: "Bamboo",
      answer: "Bamboo is harvested in autumn.",
      explanation: "Use passive voice to focus on the process stage."
    },
    {
      prompt: "People cut bamboo into strips.",
      subject: "Bamboo",
      answer: "Bamboo is cut into strips.",
      explanation: "Use the object of the active sentence as the new subject."
    }
  ],
  intermediate: [
    {
      prompt: "Bamboo / plant / in spring",
      subject: "Bamboo",
      answer: "Bamboo is planted in spring.",
      explanation: "Write a full passive sentence using the given prompts."
    },
    {
      prompt: "Bamboo / harvest / in autumn",
      subject: "Bamboo",
      answer: "Bamboo is harvested in autumn.",
      explanation: "Use passive voice and keep the time expression."
    },
    {
      prompt: "Bamboo / cut / into strips",
      subject: "Bamboo",
      answer: "Bamboo is cut into strips.",
      explanation: "Use the correct passive form and complete the whole sentence."
    }
  ],
  advanced: [
    {
      prompt: "plant / spring",
      subject: "Bamboo",
      answer: "Bamboo is planted in spring.",
      explanation: "Write a full passive sentence with an appropriate subject."
    },
    {
      prompt: "harvest / autumn",
      subject: "Bamboo",
      answer: "Bamboo is harvested in autumn.",
      explanation: "Remember to supply the subject and the passive verb form yourself."
    },
    {
      prompt: "cut / into strips",
      subject: "Bamboo",
      answer: "Bamboo is cut into strips.",
      explanation: "Check whether the whole sentence is in passive voice."
    }
  ]
};

const sequencingExercises = {
  beginner: [
    {
      type: "gap",
      sentence: "__________, bamboo is planted in spring.",
      options: ["Firstly", "However", "In contrast"],
      answer: "Firstly",
      explanation: "Use Firstly to introduce the first stage."
    },
    {
      type: "gap",
      sentence: "Bamboo is harvested in autumn. __________, it is cut into strips.",
      options: ["Next", "Similarly", "On the other hand"],
      answer: "Next",
      explanation: "Next shows the following step in sequence."
    },
    {
      type: "gap",
      sentence: "The strips are crushed. __________, the fibres are filtered.",
      options: ["After that", "In contrast", "For example"],
      answer: "After that",
      explanation: "After that continues the process logically."
    },
    {
      type: "gap",
      sentence: "The fibres are filtered. __________ soften the fibres.",
      options: ["The next stage is to", "However", "Similarly"],
      answer: "The next stage is to",
      explanation: "Use the frame 'the next stage is to + verb'."
    },
    {
      type: "gap",
      sentence: "The fibres are spun into yarn. __________, fabric is produced.",
      options: ["Finally", "However", "Similarly"],
      answer: "Finally",
      explanation: "Finally is used for the last stage."
    }
  ],
  intermediate: [
    {
      type: "gap",
      sentence: "The strips are crushed. __________, the fibres are filtered.",
      options: ["Next", "After that", "Subsequently"],
      answer: "Subsequently",
      explanation: "Subsequently is a more formal linker for later stages."
    },
    {
      type: "gap",
      sentence: "The fibres are filtered. __________, they are softened.",
      options: ["Next", "Finally", "Subsequently"],
      answer: "Subsequently",
      explanation: "Use subsequently to show the next stage in a more academic way."
    },
    {
      type: "combine",
      prompt: "Combine the sentences using 'before doing':",
      parts: ["Bamboo is planted in spring.", "It is harvested in autumn."],
      answer: "Bamboo is planted in spring before being harvested in autumn.",
      explanation: "Use before + being + past participle."
    },
    {
      type: "combine",
      prompt: "Combine the sentences using 'after doing':",
      parts: ["The strips are cut.", "They are crushed."],
      answer: "The strips are cut after being crushed.",
      explanation: "Use after + being + past participle and check order carefully."
    }
  ],
  advanced: [
    {
      type: "combine",
      prompt: "Combine the sentences using 'after doing':",
      parts: ["The fibres are filtered.", "They are softened."],
      answer: "The fibres are filtered after being softened.",
      explanation: "Use after + being + past participle."
    },
    {
      type: "combine",
      prompt: "Combine the ideas using 'followed by':",
      parts: ["The strips are crushed.", "The fibres are filtered."],
      answer: "The strips are crushed, followed by the filtering of the fibres.",
      explanation: "Use followed by + noun or gerund phrase, not a full clause."
    },
    {
      type: "combine",
      prompt: "Combine the sentences using 'after which':",
      parts: ["The fibres are softened.", "They are spun into yarn."],
      answer: "The fibres are softened, after which they are spun into yarn.",
      explanation: "Use after which to connect two sequential clauses."
    }
  ]
};

const paragraphTasks = {
  beginner: {
    title: "Band 5.5 Timed Paragraph Writing",
    instruction:
      "Write one body paragraph about the process. Reuse the passive sentences and basic linkers from Practice 1 and Practice 2.",
    notes: [
      "Bamboo is planted in spring.",
      "It is harvested in autumn.",
      "It is cut into strips.",
      "The strips are crushed.",
      "The fibres are filtered.",
      "The next stage is to soften the fibres.",
      "Finally, the fibres are spun into yarn."
    ],
    hint:
      "Use basic linkers such as firstly, next, after that, the next stage is to, and finally. Keep the verbs in passive voice.",
    model:
      "Firstly, bamboo is planted in spring. Next, it is harvested in autumn. After that, it is cut into strips. The strips are then crushed, and the fibres are filtered. The next stage is to soften the fibres. Finally, the fibres are spun into yarn.",
    targetLength: "45-65 words"
  },
  intermediate: {
    title: "Band 6 Timed Paragraph Writing",
    instruction:
      "Write one body paragraph describing the process. Reuse the sentence-combining patterns and include subsequently at least once.",
    notes: [
      "Bamboo is planted in spring before being harvested in autumn.",
      "Subsequently, it is cut into strips.",
      "The strips are crushed.",
      "The fibres are then filtered.",
      "After being filtered, the fibres are softened.",
      "Finally, they are spun into yarn."
    ],
    hint:
      "Combine short ideas using before/after doing. Include subsequently to make the sequence sound more formal.",
    model:
      "Bamboo is planted in spring before being harvested in autumn. Subsequently, it is cut into strips, and the strips are crushed. The fibres are then filtered, and after being filtered, they are softened. Finally, they are spun into yarn.",
    targetLength: "50-70 words"
  },
  advanced: {
    title: "Band 6.5 Timed Paragraph Writing",
    instruction:
      "Write one body paragraph in a more academic style. Reuse advanced linking structures such as after which, followed by, and after doing.",
    notes: [
      "Bamboo is planted in spring.",
      "It is harvested in autumn.",
      "It is cut into strips.",
      "The strips are crushed, followed by the filtering of the fibres.",
      "The fibres are softened, after which they are spun into yarn."
    ],
    hint:
      "Use at least two advanced linking structures from earlier practice, such as followed by and after which.",
    model:
      "Bamboo is planted in spring and harvested in autumn, after which it is cut into strips. The strips are then crushed, followed by the filtering of the fibres. After being filtered and softened, the fibres are spun into yarn.",
    targetLength: "55-75 words"
  }
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
}

function compareAnswer(input: string, target: string): boolean {
  return normalize(input) === normalize(target);
}

function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function scoreParagraph(text: string, level: string): string[] {
  const lower = text.toLowerCase();
  const sequencingWords = [
    "firstly",
    "next",
    "after that",
    "the next stage is to",
    "subsequently",
    "finally",
    "after which",
    "followed by"
  ];
  const passiveMarkers = ["is ", "are ", "was ", "were ", "being ", "been "];
  const stages = ["planted", "harvested", "cut", "crushed", "filtered", "softened", "spun", "woven"];
  const stageCount = stages.filter((w) => lower.includes(w)).length;
  const wordCount = getWordCount(text);
  const feedback: string[] = [];

  if (stageCount >= 5) {
    feedback.push("You included most of the main process stages.");
  } else {
    feedback.push("Try to include more of the important stages from the process.");
  }

  if (sequencingWords.some((w) => lower.includes(w))) {
    feedback.push("Your paragraph uses linking language to show sequence clearly.");
  } else {
    feedback.push("Add clearer sequencing language to guide the reader through the process.");
  }

  if (passiveMarkers.some((w) => lower.includes(w))) {
    feedback.push("You used passive structures, which are appropriate for process diagrams.");
  } else {
    feedback.push("Use passive voice more consistently in this process paragraph.");
  }

  if (level === "beginner" && wordCount < 45) {
    feedback.push("Try to write a little more so that your paragraph reaches the suggested length.");
  }

  if (level === "intermediate" && wordCount < 50) {
    feedback.push("Add more detail or combine more ideas so the paragraph feels more developed.");
  }

  if (level === "advanced" && !lower.includes("after which") && !lower.includes("followed by")) {
    feedback.push("Try to include at least one advanced linking structure such as 'after which' or 'followed by'.");
  }

  return feedback;
}

export default function ProcessWritingTrainingWebappFinal() {
  const [level, setLevel] = useState("beginner");

  const passiveSet = useMemo(() => passiveExercises[level as keyof typeof passiveExercises], [level]);
  const sequencingSet = useMemo(() => sequencingExercises[level as keyof typeof sequencingExercises], [level]);
  const paragraphSet = useMemo(() => paragraphTasks[level as keyof typeof paragraphTasks], [level]);

  const [passiveAnswers, setPassiveAnswers] = useState<Record<number, string>>({});
  const [passiveResults, setPassiveResults] = useState<Record<number, { correct: boolean; message: string; answer: string }>>({});
  const [passiveHints, setPassiveHints] = useState<Record<number, string>>({});

  const [sequencingAnswers, setSequencingAnswers] = useState<Record<number, string>>({});
  const [sequencingResults, setSequencingResults] = useState<Record<number, { correct: boolean; message: string; answer: string }>>({});

  const [paragraph, setParagraph] = useState("");
  const [paragraphFeedback, setParagraphFeedback] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setPassiveAnswers({});
    setPassiveResults({});
    setPassiveHints({});
    setSequencingAnswers({});
    setSequencingResults({});
    setParagraph("");
    setParagraphFeedback([]);
    setShowHint(false);
    setShowModel(false);
    setTimeLeft(20 * 60);
    setIsRunning(false);
  }, [level]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setTimeLeft(20 * 60);
    setIsRunning(false);
  };

  const getPassiveHint = (exercise: { subject: string; answer: string }, input: string, currentLevel: string): string => {
    if (currentLevel === "beginner") {
      return `Structure: ${exercise.subject} + is/are + past participle`;
    }
    if (currentLevel === "intermediate") {
      const beForm = exercise.answer.includes(" are ") ? "are" : "is";
      return `Hint: start with '${exercise.subject}' and use '${beForm}'.`;
    }
    if (!input.toLowerCase().includes("is") && !input.toLowerCase().includes("are")) {
      return "Check whether you have used passive voice: be + past participle.";
    }
    return "Check your verb form carefully.";
  };

  const handlePassiveCheck = (index: number) => {
    const exercise = passiveSet[index];
    const input = passiveAnswers[index] || "";
    const correct = compareAnswer(input, exercise.answer);
    setPassiveResults((prev) => ({
      ...prev,
      [index]: {
        correct,
        message: correct ? "Correct. Well done." : `Incorrect. ${exercise.explanation}`,
        answer: exercise.answer
      }
    }));
  };

  const handlePassiveHint = (index: number) => {
    const exercise = passiveSet[index];
    const input = passiveAnswers[index] || "";
    setPassiveHints((prev) => ({
      ...prev,
      [index]: getPassiveHint(exercise, input, level)
    }));
  };

  const handleSequencingCheck = (index: number) => {
    const exercise = sequencingSet[index];
    const input = sequencingAnswers[index] || "";
    const correct = compareAnswer(input, exercise.answer);
    setSequencingResults((prev) => ({
      ...prev,
      [index]: {
        correct,
        message: correct ? "Correct. The sequencing works well." : `Incorrect. ${exercise.explanation}`,
        answer: exercise.answer
      }
    }));
  };

  const handleParagraphCheck = () => {
    setParagraphFeedback(scoreParagraph(paragraph, level));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full">IELTS Academic Task 1</Badge>
                <Badge variant="secondary" className="rounded-full">Process Diagram</Badge>
                <Badge variant="outline" className="rounded-full">Timed Writing</Badge>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">Process Writing Training Web App</CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                A complete practice flow for process-diagram writing: passive voice transformation, sequencing practice, and a timed paragraph-writing task with band-specific support.
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
                  <SelectItem value="beginner">Band 5.5</SelectItem>
                  <SelectItem value="intermediate">Band 6</SelectItem>
                  <SelectItem value="advanced">Band 6.5</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-xl border bg-slate-100 p-3 text-sm text-slate-700">
                <p className="font-medium">Product logic</p>
                <p className="mt-1 text-slate-600">Sentence accuracy - cohesion control - timed paragraph production.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Real IELTS Process Task</CardTitle>
            <p className="text-sm text-slate-600">{processData.title}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {processData.steps.map((step, index) => (
                <div key={index} className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
                  <p className="mt-2 leading-6">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="passive" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="passive" className="rounded-xl">Practice 1 Passive Voice</TabsTrigger>
            <TabsTrigger value="sequencing" className="rounded-xl">Practice 2 Sequencing</TabsTrigger>
            <TabsTrigger value="paragraph" className="rounded-xl">Practice 3 Timed Writing</TabsTrigger>
          </TabsList>

          <TabsContent value="passive">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Wand2 className="h-5 w-5" /> Passive Voice Transformation</CardTitle>
                <p className="text-sm text-slate-600">
                  Transform the process steps into accurate passive sentences. The level changes the amount of scaffolding provided.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {passiveSet.map((item, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Task prompt</p>
                    <p className="mt-1 text-base text-slate-900">{item.prompt}</p>
                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <div className="flex-1">
                        <Input
                          className="rounded-xl"
                          value={passiveAnswers[index] || ""}
                          onChange={(e) => setPassiveAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                          placeholder={`${item.subject} ...`}
                        />
                      </div>
                      <Button className="rounded-xl" onClick={() => handlePassiveCheck(index)}>Check Answer</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => handlePassiveHint(index)}>Hint</Button>
                    </div>
                    {passiveHints[index] && (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Hint: {passiveHints[index]}</div>
                    )}
                    {passiveResults[index] && (
                      <div className={`mt-3 rounded-xl border p-3 text-sm ${passiveResults[index].correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                        <div className="flex items-start gap-2">
                          {passiveResults[index].correct ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
                          <div>
                            <p>{passiveResults[index].message}</p>
                            {!passiveResults[index].correct && <p className="mt-1 font-medium">Correct answer: {passiveResults[index].answer}</p>}
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
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5" /> Sequencing Practice</CardTitle>
                <p className="text-sm text-slate-600">
                  Recycle the passive sentences from Practice 1 and connect them with appropriate linking structures.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {sequencingSet.map((item, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4">
                    {item.type === "gap" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-500">{item.prompt}</p>
                        <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p>1. {item.parts[0]}</p>
                          <p>2. {item.parts[1]}</p>
                        </div>
                        <Input
                          className="mt-4 rounded-xl"
                          value={sequencingAnswers[index] || ""}
                          onChange={(e) => setSequencingAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                          placeholder="Write the combined sentence here..."
                        />
                      </>
                    )}
                    <div className="mt-3">
                      <Button className="rounded-xl" onClick={() => handleSequencingCheck(index)}>Check Answer</Button>
                    </div>
                    {sequencingResults[index] && (
                      <div className={`mt-3 rounded-xl border p-3 text-sm ${sequencingResults[index].correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                        <div className="flex items-start gap-2">
                          {sequencingResults[index].correct ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
                          <div>
                            <p>{sequencingResults[index].message}</p>
                            {!sequencingResults[index].correct && <p className="mt-1 font-medium">Suggested answer: {sequencingResults[index].answer}</p>}
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
                  <CardTitle className="text-xl">{paragraphSet.title}</CardTitle>
                  <p className="text-sm text-slate-600">{paragraphSet.instruction}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500"><Clock3 className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wide">Time limit</span></div>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{formatTime(timeLeft)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" className="rounded-xl" onClick={() => setIsRunning(true)}>Start</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setIsRunning(false)}>Pause</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={resetTimer}>Reset</Button>
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500"><FileText className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wide">Word count</span></div>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{getWordCount(paragraph)}</p>
                      <p className="mt-2 text-sm text-slate-600">Suggested length: {paragraphSet.targetLength}</p>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Writing goal</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">Use the outputs from the earlier two practices to build one coherent body paragraph within 20 minutes.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Sentence bank from earlier practice</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {paragraphSet.notes.map((note, index) => (
                        <li key={index}>- {note}</li>
                      ))}
                    </ul>
                  </div>

                  <Textarea
                    className="min-h-[240px] rounded-2xl"
                    placeholder="Write your paragraph here..."
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-xl" onClick={handleParagraphCheck}>Check Paragraph</Button>
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
                          <li key={index}>- {item}</li>
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
                    <CardTitle className="text-lg">Task Design Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>
                      This final writing stage is designed to recycle outputs from Practice 1 and Practice 2. Learners first build accurate passive sentences, then practise sequencing devices, and finally convert these into a timed paragraph.
                    </p>
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                      Product logic: passive accuracy - sequencing control - timed paragraph production
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
