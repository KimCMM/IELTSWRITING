"use client";

import { useMemo, useState } from "react";

export default function IELTSProcessTrainer() {
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");

  // =====================
  // DATA: RECYCLING PROCESS
  // =====================

  const steps = [
    {
      active: "People put plastic bottles in recycling bins.",
      passive: "Plastic bottles are placed in recycling bins.",
      prompt6: "plastic bottles / place / recycling bins"
    },
    {
      active: "A truck collects plastic bottles.",
      passive: "Plastic bottles are collected by a truck.",
      prompt6: "plastic bottles / collect / truck"
    },
    {
      active: "Workers sort plastic bottles in a recycling centre.",
      passive: "Plastic bottles are sorted in a recycling centre.",
      prompt6: "plastic bottles / sort / recycling centre"
    },
    {
      active: "Machines compress plastic bottles into blocks.",
      passive: "Plastic bottles are compressed into blocks.",
      prompt6: "plastic bottles / compress / blocks"
    },
    {
      active: "Machines crush the blocks.",
      passive: "The blocks are crushed.",
      prompt6: "blocks / crush"
    },
    {
      active: "Machines produce plastic pellets.",
      passive: "Plastic pellets are produced.",
      prompt6: "plastic pellets / produce"
    },
    {
      active: "People heat the pellets to form raw material.",
      passive: "Raw material is formed from the pellets.",
      prompt6: "raw material / form / pellets"
    },
    {
      active: "Factories produce end products.",
      passive: "End products are produced.",
      prompt6: "end products / produce"
    }
  ];

  const practice1Band65 = [
    {
      type: "upgrade",
      prompt: "Plastic bottles are put in recycling bins.",
      task: "Use a more natural verb.",
      sample: "Plastic bottles are placed in recycling bins."
    },
    {
      type: "detail",
      prompt: "Plastic bottles are collected.",
      task: "Add detail from the diagram.",
      sample: "Plastic bottles are collected by a truck."
    },
    {
      type: "detail",
      prompt: "Plastic bottles are compressed.",
      task: "Add the result shown in the diagram.",
      sample: "Plastic bottles are compressed into blocks."
    },
    {
      type: "complex",
      prompt: "The blocks are crushed.",
      task: "Add the result within the same sentence without using sequencing linkers.",
      sample: "The blocks are crushed, producing smaller pieces."
    },
    {
      type: "upgrade",
      prompt: "End products are produced.",
      task: "Use a more formal verb.",
      sample: "End products are manufactured."
    }
  ];

  // =====================
  // PRACTICE 1 STATE
  // =====================

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return steps.map((s) => ({
        type: "rewrite",
        prompt: s.active,
        answer: s.passive,
        instruction: "Rewrite the active sentence in the passive voice."
      }));
    }

    if (level === "band6") {
      return steps.map((s) => ({
        type: "build",
        prompt: s.prompt6,
        answer: s.passive,
        instruction: "Use the keywords and the diagram to write a complete passive sentence."
      }));
    }

    return practice1Band65.map((s) => ({
      ...s,
      answer: s.sample,
      instruction: s.task
    }));
  }, [level]);

  const [practice1Answers, setPractice1Answers] = useState<Record<number, string>>({});
  const [practice1Feedback, setPractice1Feedback] = useState<Record<number, boolean>>({});
  const [practice1Hint, setPractice1Hint] = useState("");

  const normalize = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const checkPractice1 = (index: number) => {
    const user = normalize(practice1Answers[index] || "");
    const target = normalize(practice1Tasks[index].answer);
    setPractice1Feedback((prev) => ({
      ...prev,
      [index]: user === target
    }));
  };

  const getPractice1Hint = (index: number) => {
    if (level === "band55") {
      setPractice1Hint(`Task ${index + 1}: Find the object in the active sentence and make it the subject of the passive sentence.`);
      return;
    }

    if (level === "band6") {
      setPractice1Hint(`Task ${index + 1}: Use be + past participle. Decide the missing preposition from the diagram.`);
      return;
    }

    setPractice1Hint(`Task ${index + 1}: ${practice1Tasks[index].instruction}`);
  };

  // =====================
  // PRACTICE 2 DATA + STATE
  // =====================

  const linkerOptions = [
    "first",
    "next",
    "then",
    "in the next stage",
    "the following stage",
    "after",
    "finally"
  ];

  const paragraphCorrect = [
    "first",
    "then",
    "the following stage",
    "next",
    "then",
    "next",
    "then",
    "finally"
  ];

  const [dragItem, setDragItem] = useState<string | null>(null);
  const [paragraphAnswers, setParagraphAnswers] = useState<string[]>(Array(8).fill(""));
  const [paragraphFeedback, setParagraphFeedback] = useState<boolean[]>([]);
  const [practice2Hint, setPractice2Hint] = useState("");

  const band6CohesionTasks = [
    {
      type: "initial-fill",
      sentence: "N______, plastic bottles are collected by a truck.",
      answer: "Next",
      explanation: "Use Next at the beginning of the sentence."
    },
    {
      type: "initial-fill",
      sentence: "T______, plastic bottles are sorted in a recycling centre.",
      answer: "Then",
      explanation: "Use Then to show the next stage."
    },
    {
      type: "initial-fill",
      sentence: "A______ that, plastic bottles are compressed into blocks.",
      answer: "After",
      explanation: "Complete the fixed expression After that."
    },
    {
      type: "initial-fill",
      sentence: "In the n______ stage, the blocks are crushed.",
      answer: "next",
      explanation: "Complete the phrase in the next stage."
    },
    {
      type: "initial-fill",
      sentence: "S__________, plastic pellets are produced.",
      answer: "Subsequently",
      explanation: "Use a more formal sequencing adverb."
    },
    {
      type: "combine",
      prompt: "Combine using before doing.",
      parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."],
      answer: "They are sorted in a recycling centre before being compressed into blocks.",
      explanation: "Use before + being + past participle."
    },
    {
      type: "combine",
      prompt: "Combine using after doing.",
      parts: ["Plastic bottles are collected by a truck.", "They are sorted in a recycling centre."],
      answer: "They are sorted in a recycling centre after being collected by a truck.",
      explanation: "Use after + being + past participle."
    }
  ];

  const band65CohesionTasks = [
    {
      type: "combine",
      prompt: "Combine using followed by + noun phrase.",
      parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."],
      answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks.",
      explanation: "followed by should be followed by a noun phrase, not a full sentence."
    },
    {
      type: "combine",
      prompt: "Combine using before doing.",
      parts: ["Plastic pellets are produced.", "They are heated to form raw material."],
      answer: "Plastic pellets are produced before being heated to form raw material.",
      explanation: "Use before + being + past participle."
    },
    {
      type: "combine",
      prompt: "Combine using after which.",
      parts: ["The blocks are crushed.", "They are washed."],
      answer: "The blocks are crushed, after which they are washed.",
      explanation: "Use after which + clause."
    }
  ];

  const [cohesionAnswers, setCohesionAnswers] = useState<Record<number, string>>({});
  const [cohesionFeedback, setCohesionFeedback] = useState<Record<number, boolean>>({});

  const dropToBlank = (index: number) => {
    if (!dragItem) return;
    const copy = [...paragraphAnswers];
    copy[index] = dragItem;
    setParagraphAnswers(copy);
  };

  const checkParagraphDrag = () => {
    setParagraphFeedback(paragraphAnswers.map((a, i) => a === paragraphCorrect[i]));
  };

  const checkCohesionTask = (index: number, tasks: typeof band6CohesionTasks) => {
    const user = normalize(cohesionAnswers[index] || "");
    const target = normalize(tasks[index].answer);
    setCohesionFeedback((prev) => ({ ...prev, [index]: user === target }));
  };

  const getPractice2Hint = () => {
    if (level === "band55") {
      setPractice2Hint("Structure hint: use 'then' inside a sentence; use 'after' only before 'that'; use 'the following stage' to + verb; use 'in the next stage' in the pattern 'In the ___ stage'.");
      return;
    }

    if (level === "band6") {
      const taskIndex = Object.keys(cohesionFeedback).length;
      setPractice2Hint(taskIndex < 5 ? "首字母提示：N = Next, T = Then, A = After, S = Subsequently." : "合并句提示：before/after + being + past participle.");
      return;
    }

    setPractice2Hint("6.5 hint: check whether the structure is correct: followed by + noun phrase; before/after + being done; after which + clause.");
  };

  const renderBlank = (index: number) => {
    const isChecked = paragraphFeedback.length > 0;
    const isCorrect = paragraphFeedback[index];

    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        className={`mx-1 inline-block min-w-[110px] rounded border-b-2 px-2 text-center ${
          isChecked ? (isCorrect ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"
        }`}
      >
        {paragraphAnswers[index] || "_____"}
      </span>
    );
  };

  // =====================
  // PRACTICE 3 STATE
  // =====================

  const [writing, setWriting] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reflection, setReflection] = useState<string[]>(["", "", ""]);
  const [writingHint, setWritingHint] = useState("");

  interface ErrorRule {
    id: string;
    type: "grammar" | "lexis";
    pattern: RegExp;
    message: string;
  }

  const errorRules: ErrorRule[] = [
    { id: "g1", type: "grammar", pattern: /are place|is place/gi, message: "Use passive form: are placed." },
    { id: "g2", type: "grammar", pattern: /are collect|is collect/gi, message: "Use passive form: are collected." },
    { id: "g3", type: "grammar", pattern: /are sort|is sort/gi, message: "Use passive form: are sorted." },
    { id: "g4", type: "grammar", pattern: /are compress|is compress/gi, message: "Use passive form: are compressed." },
    { id: "l1", type: "lexis", pattern: /end goods|final goods/gi, message: "Use end products." },
    { id: "l2", type: "lexis", pattern: /plastic balls/gi, message: "Use plastic pellets." },
    { id: "l3", type: "lexis", pattern: /raw materials/gi, message: "Use raw material as an uncountable noun here." }
  ];

  interface DetectedError extends ErrorRule {
    match: string;
    index: number;
  }

  const detectedErrors = useMemo(() => {
    if (!submitted) return [];
    const found: DetectedError[] = [];
    errorRules.forEach((rule) => {
      const matches = writing.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          found.push({ ...rule, match: match[0], index: match.index });
        }
      }
    });
    return found.sort((a, b) => a.index - b.index);
  }, [submitted, writing]);

  const highlightedWriting = useMemo(() => {
    if (!submitted || detectedErrors.length === 0) return writing;

    const output: (string | React.ReactElement)[] = [];
    let cursor = 0;

    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(writing.slice(cursor, error.index));
      output.push(
        <strong
          key={`${error.id}-${index}`}
          className={`rounded px-1 font-bold ${error.type === "grammar" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          {writing.slice(error.index, error.index + error.match.length)}
        </strong>
      );
      cursor = error.index + error.match.length;
    });

    output.push(writing.slice(cursor));
    return output;
  }, [submitted, detectedErrors, writing]);

  const wordCount = writing.trim() ? writing.trim().split(/\s+/).length : 0;
  const grammarErrorCount = detectedErrors.filter((e) => e.type === "grammar").length;
  const lexisErrorCount = detectedErrors.filter((e) => e.type === "lexis").length;
  const reflectionComplete = reflection.every((item) => item.trim().length > 0);
  const pass = submitted && detectedErrors.length === 0 && reflectionComplete;

  const submitWriting = () => {
    setSubmitted(true);
    setWritingHint("");
  };

  const getWritingHint = () => {
    if (!submitted) {
      setWritingHint("Submit your paragraph first to activate self-correction.");
      return;
    }

    if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      setWritingHint(`Hint: This is a ${first.type.toUpperCase()} issue - ${first.message}`);
      return;
    }

    if (!reflectionComplete) {
      setWritingHint("No language errors remain. Complete all 3 self-reflection points to pass.");
      return;
    }

    setWritingHint("Well done. All errors corrected and reflection completed.");
  };

  // =====================
  // UI HELPERS
  // =====================

  const PracticeCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );

  const TabButton = ({ value, label }: { value: string; label: string }) => (
    <button
      onClick={() => setActivePractice(value)}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
    >
      {label}
    </button>
  );

  // =====================
  // RENDER PRACTICE 1
  // =====================

  const renderPractice1 = () => (
    <PracticeCard title="Practice 1 - Passive Voice and Sentence Upgrade">
      <p className="mb-4 text-sm text-slate-600">
        Band 5.5: active to passive - Band 6: keywords to passive sentence - Band 6.5: synonym, diagram detail and complex sentence.
      </p>

      <div className="space-y-4">
        {practice1Tasks.map((task, index) => (
          <div key={index} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {index + 1}</p>
            <p className="mt-1 font-medium text-slate-900">{task.instruction}</p>
            <p className="mt-2 rounded-lg bg-white p-3 text-slate-700">{task.prompt}</p>

            <input
              value={practice1Answers[index] || ""}
              onChange={(e) => setPractice1Answers((prev) => ({ ...prev, [index]: e.target.value }))}
              placeholder="Write your answer here..."
              className="mt-3 w-full rounded-xl border p-2"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => checkPractice1(index)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
              <button onClick={() => getPractice1Hint(index)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            </div>

            {practice1Feedback[index] !== undefined && (
              <div className={`mt-3 rounded-xl border p-3 text-sm ${practice1Feedback[index] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {practice1Feedback[index] ? "Correct." : `Check again. Suggested answer: ${task.answer}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {practice1Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{practice1Hint}</div>}
    </PracticeCard>
  );

  // =====================
  // RENDER PRACTICE 2
  // =====================

  const renderPractice2 = () => {
    const cohesionTasks = level === "band6" ? band6CohesionTasks : band65CohesionTasks;

    if (level === "band55") {
      return (
        <PracticeCard title="Practice 2 - Controlled Paragraph Cohesion">
          <p className="mb-4 text-sm text-slate-600">
            Drag the correct linker into each blank. This controlled task trains linker position and stage expressions.
          </p>

          <div className="rounded-2xl border bg-slate-50 p-5 leading-10">
            {renderBlank(0)} plastic bottles are placed in recycling bins. The plastic bottles are {renderBlank(1)} collected. {renderBlank(2)} is to sort the plastic bottles. {renderBlank(3)}, plastic bottles are compressed into blocks. {renderBlank(4)}, the blocks are crushed. In the {renderBlank(5)} stage, plastic pellets are produced. {renderBlank(6)}, raw material is formed from the pellets. {renderBlank(7)}, end products are produced.
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Drag options</p>
            <div className="flex flex-wrap gap-2">
              {linkerOptions.map((option) => (
                <div
                  key={option}
                  draggable
                  onDragStart={() => setDragItem(option)}
                  className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={getPractice2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            <button onClick={checkParagraphDrag} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
            <button
              onClick={() => {
                setParagraphAnswers(Array(8).fill(""));
                setParagraphFeedback([]);
                setPractice2Hint("");
              }}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            >
              Reset
            </button>
          </div>

          {practice2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{practice2Hint}</div>}

          {paragraphFeedback.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {paragraphFeedback.map((ok, i) => (
                <div key={i} className={`rounded-xl border p-3 text-sm ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  Blank {i + 1}: {ok ? "Correct" : "Check again"}
                </div>
              ))}
            </div>
          )}
        </PracticeCard>
      );
    }

    return (
      <PracticeCard title={level === "band6" ? "Practice 2 - Band 6 Cohesion" : "Practice 2 - Band 6.5 Complex Cohesion"}>
        <p className="mb-4 text-sm text-slate-600">
          {level === "band6"
            ? "Complete first-letter linker tasks and combine sentences with before/after + being done."
            : "Combine sentences using followed by + noun phrase, before/after doing, and after which clauses."}
        </p>

        <div className="space-y-4">
          {cohesionTasks.map((task, index) => (
            <div key={index} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {index + 1}</p>
              {task.type === "initial-fill" ? (
                <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p>
              ) : (
                <div className="mt-2 rounded-lg bg-white p-3">
                  <p className="font-semibold">{task.prompt}</p>
                  <p>1. {task.parts[0]}</p>
                  <p>2. {task.parts[1]}</p>
                </div>
              )}

              <input
                value={cohesionAnswers[index] || ""}
                onChange={(e) => setCohesionAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                placeholder="Write your answer here..."
                className="mt-3 w-full rounded-xl border p-2"
              />

              <div className="mt-3 flex gap-2">
                <button onClick={() => checkCohesionTask(index, cohesionTasks)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
                <button onClick={getPractice2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
              </div>

              {cohesionFeedback[index] !== undefined && (
                <div className={`mt-3 rounded-xl border p-3 text-sm ${cohesionFeedback[index] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {cohesionFeedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}
                </div>
              )}
            </div>
          ))}
        </div>

        {practice2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{practice2Hint}</div>}
      </PracticeCard>
    );
  };

  // =====================
  // RENDER PRACTICE 3
  // =====================

  const renderPractice3 = () => (
    <PracticeCard title="Practice 3 - Timed Paragraph Writing + Self-correction">
      <p className="mb-4 text-sm text-slate-600">
        Write a 100+ word body paragraph. Submit it, correct highlighted errors, and complete three reflection points before passing.
      </p>

      <textarea
        value={writing}
        onChange={(e) => {
          setWriting(e.target.value);
          if (submitted) setSubmitted(false);
        }}
        className="h-56 w-full rounded-2xl border p-3"
        placeholder="Write your process paragraph here..."
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>Word count: <strong>{wordCount}</strong></span>
        <span>Target: <strong>100+ words</strong></span>
        {submitted && <span>Grammar errors: <strong>{grammarErrorCount}</strong></span>}
        {submitted && <span>Lexical errors: <strong>{lexisErrorCount}</strong></span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={submitWriting} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Submit</button>
        <button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
      </div>

      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}

      {submitted && (
        <div className="mt-4 rounded-2xl border bg-slate-50 p-4 whitespace-pre-wrap leading-7">
          {highlightedWriting || "No writing submitted."}
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold text-slate-800">Self-reflection</p>
        <p className="mt-1 text-sm text-slate-600">Write 3 language points or main features you need to focus on next time.</p>
        <div className="mt-3 space-y-2">
          {reflection.map((item, index) => (
            <input
              key={index}
              value={item}
              onChange={(e) => {
                const copy = [...reflection];
                copy[index] = e.target.value;
                setReflection(copy);
              }}
              className="w-full rounded-xl border p-2"
              placeholder={`Reflection ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS - Errors corrected and reflection completed.</div>}
    </PracticeCard>
  );

  // =====================
  // MAIN UI
  // =====================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">IELTS Academic Writing Task 1</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Process Writing Training System</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                A scaffolded process-diagram writing trainer: passive sentence building, cohesion control, timed writing, self-correction and self-reflection.
              </p>
            </div>

            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPractice1Feedback({});
                setPractice1Hint("");
                setPractice2Hint("");
                setCohesionFeedback({});
                setParagraphFeedback([]);
              }}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
            >
              <option value="band55">Band 5.5</option>
              <option value="band6">Band 6</option>
              <option value="band65">Band 6.5</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <TabButton value="practice1" label="Practice 1 - Sentence" />
          <TabButton value="practice2" label="Practice 2 - Cohesion" />
          <TabButton value="practice3" label="Practice 3 - Writing" />
        </div>

        {activePractice === "practice1" && renderPractice1()}
        {activePractice === "practice2" && renderPractice2()}
        {activePractice === "practice3" && renderPractice3()}
      </div>
    </div>
  );
}
