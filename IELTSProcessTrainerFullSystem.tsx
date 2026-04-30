import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

type BandLevel = "band55" | "band6" | "band65";
type PracticeId = "practice1" | "practice2" | "practice3";
type ScorePractice = "p1" | "p2" | "p3";

interface Step {
  active: string;
  passive: string;
  prompt6: string;
}

interface UpgradeTask {
  prompt: string;
  task: string;
  answer: string;
}

interface ParagraphTask {
  text: [number, string][];
  answers: string[];
}

interface CohesionTask {
  type: "fill" | "combine";
  sentence?: string;
  prompt?: string;
  parts?: [string, string];
  answer: string;
}

interface ProcessInfo {
  title: string;
  task: string;
  image: string;
  steps: Step[];
  band65: UpgradeTask[];
  p2Band55: ParagraphTask;
  p2Band6: CohesionTask[];
  p2Band65: CohesionTask[];
}

interface PracticeState {
  p1Answers: Record<number, string>;
  p1Feedback: Record<number, boolean>;
  p2ParagraphAnswers: string[];
  p2ParagraphFeedback: boolean[];
  p2CohesionAnswers: Record<number, string>;
  p2CohesionFeedback: Record<number, boolean>;
  p3Writing: string;
  p3Submitted: boolean;
  p3Reflection: string[];
}

interface ErrorRule {
  id: string;
  type: "grammar" | "lexis";
  pattern: RegExp;
  message: string;
}

interface ScoreState {
  [key: string]: {
    p1?: boolean;
    p2?: boolean;
    p3?: boolean;
  };
}

const initialPracticeState: PracticeState = {
  p1Answers: {},
  p1Feedback: {},
  p2ParagraphAnswers: Array(8).fill(""),
  p2ParagraphFeedback: [],
  p2CohesionAnswers: {},
  p2CohesionFeedback: {},
  p3Writing: "",
  p3Submitted: false,
  p3Reflection: ["", "", ""],
};

const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];

const buildBand55Paragraph = (steps: Step[]): ParagraphTask => {
  const answers = steps.map((_, index) => {
    if (index === 0) return "first";
    if (index === 1) return "then";
    if (index === 2) return "after";
    if (index === steps.length - 1) return "finally";
    return index % 2 === 0 ? "then" : "next";
  });

  const text: [number, string][] = steps.map((step, index) => {
    if (index === 2) return [index, ` that, ${step.passive} `];
    return [index, `, ${step.passive} `];
  });

  return { text, answers };
};

const buildProcess = (
  title: string,
  task: string,
  image: string,
  _noun: string,
  steps: Step[]
): ProcessInfo => ({
  title,
  task,
  image,
  steps,
  band65: steps.slice(0, 4).map((step) => ({
    prompt: step.passive,
    task: "Upgrade the sentence with a more formal or precise expression.",
    answer: step.passive,
  })),
  p2Band55: buildBand55Paragraph(steps),
  p2Band6: [
    { type: "fill", sentence: "N____, the material is processed further.", answer: "Next" },
    { type: "fill", sentence: "A____ that, it is shaped into a final form.", answer: "After" },
    {
      type: "combine",
      prompt: "Combine the two sentences with after being.",
      parts: ["The material is filtered.", "It is dried."],
      answer: "After being filtered, the material is dried.",
    },
  ],
  p2Band65: [
    {
      type: "combine",
      prompt: "Combine the sentences with followed by.",
      parts: ["The material is crushed.", "The separation of fibres takes place."],
      answer: "The material is crushed, followed by the separation of fibres.",
    },
    {
      type: "combine",
      prompt: "Combine the sentences with after which.",
      parts: ["The material is softened.", "It is spun into yarn."],
      answer: "The material is softened, after which it is spun into yarn.",
    },
  ],
});

const processData: Record<string, ProcessInfo> = {
  bamboo: buildProcess(
    "Bamboo Fabric",
    "The diagram below shows how fabric is manufactured from bamboo.",
    "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
    "bamboo plants",
    [
      { active: "People plant bamboo plants in spring.", passive: "Bamboo plants are planted in spring.", prompt6: "bamboo plants / plant / spring" },
      { active: "People harvest bamboo plants in autumn.", passive: "Bamboo plants are harvested in autumn.", prompt6: "bamboo plants / harvest / autumn" },
      { active: "Workers cut bamboo plants into strips.", passive: "Bamboo plants are cut into strips.", prompt6: "bamboo plants / cut / strips" },
      { active: "Machines crush the strips into pulp.", passive: "The strips are crushed into pulp.", prompt6: "strips / crush / pulp" },
      { active: "Workers separate long fibres.", passive: "Long fibres are separated.", prompt6: "long fibres / separate" },
      { active: "Machines spin the fibres into yarn.", passive: "The fibres are spun into yarn.", prompt6: "fibres / spin / yarn" },
      { active: "Workers weave yarn into fabric.", passive: "Yarn is woven into fabric.", prompt6: "yarn / weave / fabric" },
    ]
  ),
  sugar: buildProcess(
    "Sugar Cane",
    "The diagram below shows how sugar is produced from sugar cane.",
    "https://via.placeholder.com/900x520?text=Sugar+Cane+Process",
    "sugar canes",
    [
      { active: "Farmers grow sugar cane.", passive: "Sugar cane is grown.", prompt6: "sugar cane / grow" },
      { active: "Farmers harvest the cane.", passive: "The cane is harvested.", prompt6: "cane / harvest" },
      { active: "Machines crush the cane.", passive: "The cane is crushed.", prompt6: "cane / crush" },
      { active: "Workers purify the juice.", passive: "The juice is purified.", prompt6: "juice / purify" },
      { active: "Machines evaporate the liquid.", passive: "The liquid is evaporated.", prompt6: "liquid / evaporate" },
    ]
  ),
  noodles: buildProcess(
    "Instant Noodles",
    "The diagram below shows how instant noodles are manufactured.",
    "https://via.placeholder.com/900x520?text=Instant+Noodles+Process",
    "noodles",
    [
      { active: "Workers store flour in silos.", passive: "Flour is stored in silos.", prompt6: "flour / store / silos" },
      { active: "Machines mix flour with water and oil.", passive: "Flour is mixed with water and oil.", prompt6: "flour / mix / water and oil" },
      { active: "Machines roll the dough.", passive: "The dough is rolled.", prompt6: "dough / roll" },
      { active: "Machines cut the noodles.", passive: "The noodles are cut.", prompt6: "noodles / cut" },
      { active: "Workers pack the noodles in cups.", passive: "The noodles are packed in cups.", prompt6: "noodles / pack / cups" },
    ]
  ),
  recycling: buildProcess(
    "Recycling",
    "The diagram below shows how plastic bottles are recycled.",
    "https://via.placeholder.com/900x520?text=Recycling+Process",
    "plastic bottles",
    [
      { active: "People collect plastic bottles.", passive: "Plastic bottles are collected.", prompt6: "plastic bottles / collect" },
      { active: "Workers sort the bottles.", passive: "The bottles are sorted.", prompt6: "bottles / sort" },
      { active: "Machines compress the bottles.", passive: "The bottles are compressed.", prompt6: "bottles / compress" },
      { active: "Machines crush the plastic.", passive: "The plastic is crushed.", prompt6: "plastic / crush" },
      { active: "Factories produce new products.", passive: "New products are produced.", prompt6: "new products / produce" },
    ]
  ),
};

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/[\-–]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

const fuzzyMatch = (user: string, expected: string, tolerance = 0.85): boolean => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (userNorm === expectedNorm) return true;
  if (!userNorm || !expectedNorm) return false;

  const longer = userNorm.length > expectedNorm.length ? userNorm : expectedNorm;
  const shorter = longer === userNorm ? expectedNorm : userNorm;
  let matches = 0;
  for (let i = 0; i < shorter.length; i += 1) {
    if (longer[i] === shorter[i]) matches += 1;
  }
  return matches / longer.length >= tolerance;
};

const createErrorRules = (processKey: string): ErrorRule[] => {
  const baseRules: ErrorRule[] = [
    {
      id: "g1",
      type: "grammar",
      pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin)\b(?!\w)/gi,
      message: "Use passive form: are/is + past participle.",
    },
    {
      id: "l1",
      type: "lexis",
      pattern: /\b(end|final)\s+goods\b/gi,
      message: "Use 'end products' instead of 'end/final goods'.",
    },
    {
      id: "l2",
      type: "lexis",
      pattern: /plastic\s+balls/gi,
      message: "Use 'plastic pellets', not 'plastic balls'.",
    },
    {
      id: "l3",
      type: "lexis",
      pattern: /raw\s+materials\b/gi,
      message: "Use 'raw material' in this context.",
    },
    {
      id: "l4",
      type: "lexis",
      pattern: /spinned/gi,
      message: "Use 'spun', not 'spinned'.",
    },
  ];

  if (processKey === "bamboo") {
    return [
      ...baseRules,
      {
        id: "b1",
        type: "lexis",
        pattern: /\b(fabric|cloth)\s+(is\s+)?manufacture\b/gi,
        message: "Use 'manufactured' or 'is manufactured'.",
      },
    ];
  }

  if (processKey === "sugar") {
    return [
      ...baseRules,
      {
        id: "s1",
        type: "grammar",
        pattern: /sugar\s+(is|are)\s+grown/gi,
        message: "Use 'cultivated' for a more formal verb.",
      },
    ];
  }

  return baseRules;
};

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      setStoredValue((previous) => {
        const nextValue = value instanceof Function ? value(previous) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}

const Card = memo(function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
});

const Tab = memo(function Tab({
  value,
  label,
  activePractice,
  onSelect,
}: {
  value: PracticeId;
  label: string;
  activePractice: PracticeId;
  onSelect: (value: PracticeId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      role="tab"
      aria-selected={activePractice === value}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </button>
  );
});

export default function IELTSProcessTrainerFullSystem() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState<BandLevel>("band55");
  const [activePractice, setActivePractice] = useState<PracticeId>("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage<ScoreState>("ieltsScores", {});
  const [practiceState, setPracticeState] = useState<PracticeState>(initialPracticeState);
  const [p1Hints, setP1Hints] = useState<Record<number, string>>({});
  const [dragItem, setDragItem] = useState("");
  const [p2Hint, setP2Hint] = useState("");
  const [writingHint, setWritingHint] = useState("");

  const current = processData[processKey] ?? processData.bamboo;
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState({ ...initialPracticeState, p2ParagraphAnswers: Array(8).fill(""), p3Reflection: ["", "", ""] });
    setP1Hints({});
    setP2Hint("");
    setWritingHint("");
  }, []);

  const handleProcessOrLevelChange = useCallback(
    (newProcess: string, newLevel: BandLevel) => {
      setProcessKey(newProcess);
      setLevel(newLevel);
      resetAllPracticeStates();
    },
    [resetAllPracticeStates]
  );

  const award = useCallback(
    (practice: ScorePractice) => {
      setScoreMap((previous) => {
        const currentEarned = previous[scoreKey] || { p1: false, p2: false, p3: false };
        if (currentEarned[practice]) return previous;
        return {
          ...previous,
          [scoreKey]: {
            ...currentEarned,
            [practice]: true,
          },
        };
      });
    },
    [scoreKey, setScoreMap]
  );

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return current.steps.map((step) => ({
        prompt: step.active,
        answer: step.passive,
        instruction: "Rewrite the active sentence in the passive voice.",
      }));
    }
    if (level === "band6") {
      return current.steps.map((step) => ({
        prompt: step.prompt6,
        answer: step.passive,
        instruction: "Use the words and the diagram to write a complete passive sentence.",
      }));
    }
    return current.band65.map((task) => ({
      prompt: task.prompt,
      answer: task.answer,
      instruction: task.task,
    }));
  }, [current, level]);

  const getCohesionTasks = useCallback(() => {
    return level === "band6" ? current.p2Band6 : current.p2Band65;
  }, [current, level]);

  const errorRules = useMemo(() => createErrorRules(processKey), [processKey]);

  const detectedErrors = useMemo(() => {
    if (!practiceState.p3Submitted) return [];
    const found: Array<ErrorRule & { match: string; index: number }> = [];
    errorRules.forEach((rule) => {
      for (const match of practiceState.p3Writing.matchAll(rule.pattern)) {
        found.push({ ...rule, match: match[0], index: match.index ?? 0 });
      }
    });
    return found.sort((a, b) => a.index - b.index);
  }, [practiceState.p3Submitted, practiceState.p3Writing, errorRules]);

  const wordCount = useMemo(() => {
    const writing = practiceState.p3Writing.trim();
    return writing ? writing.split(/\s+/).length : 0;
  }, [practiceState.p3Writing]);

  const grammarErrorCount = detectedErrors.filter((error) => error.type === "grammar").length;
  const lexisErrorCount = detectedErrors.filter((error) => error.type === "lexis").length;
  const reflectionComplete = practiceState.p3Reflection.every((item) => item.trim().length > 0);
  const canSubmitP3 = wordCount >= 100;
  const p3Pass = practiceState.p3Submitted && detectedErrors.length === 0 && reflectionComplete;

  const highlightedWriting = useMemo(() => {
    if (!practiceState.p3Submitted || detectedErrors.length === 0) return practiceState.p3Writing;

    const output: React.ReactNode[] = [];
    let cursor = 0;
    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(practiceState.p3Writing.slice(cursor, error.index));
      output.push(
        <strong
          key={`${error.id}-${index}`}
          className={`rounded px-1 font-bold ${error.type === "grammar" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
          aria-label={`${error.type} error: ${error.message}`}
        >
          {practiceState.p3Writing.slice(error.index, error.index + error.match.length)}
        </strong>
      );
      cursor = error.index + error.match.length;
    });
    output.push(practiceState.p3Writing.slice(cursor));
    return output;
  }, [practiceState.p3Submitted, practiceState.p3Writing, detectedErrors]);

  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  const updateP1Answer = useCallback((index: number, value: string) => {
    setPracticeState((previous) => {
      const nextFeedback = { ...previous.p1Feedback };
      delete nextFeedback[index];
      return {
        ...previous,
        p1Answers: { ...previous.p1Answers, [index]: value },
        p1Feedback: nextFeedback,
      };
    });
  }, []);

  const checkP1 = useCallback(
    (index: number) => {
      const userAnswer = practiceState.p1Answers[index] || "";
      const ok = fuzzyMatch(userAnswer, practice1Tasks[index].answer);

      setPracticeState((previous) => ({
        ...previous,
        p1Feedback: { ...previous.p1Feedback, [index]: ok },
      }));

      const allCorrect = practice1Tasks.every((task, taskIndex) => {
        const answer = taskIndex === index ? userAnswer : practiceState.p1Answers[taskIndex] || "";
        return fuzzyMatch(answer, task.answer);
      });

      if (allCorrect) award("p1");
    },
    [practice1Tasks, practiceState.p1Answers, award]
  );

  const getP1Hint = useCallback(
    (index: number) => {
      let hint: string;
      if (level === "band55") {
        hint = `Task ${index + 1}: Use the present simple passive voice: is/are + past participle (done). Move the object to the subject position, then choose is or are.`;
      } else if (level === "band6") {
        hint = `Task ${index + 1}: Use present simple passive voice: is/are + past participle. Check prepositions and details.`;
      } else {
        hint = `Task ${index + 1}: ${practice1Tasks[index].instruction}`;
      }
      setP1Hints((previous) => ({ ...previous, [index]: hint }));
    },
    [level, practice1Tasks]
  );

  const dropToBlank = useCallback(
    (index: number) => {
      if (!dragItem) return;
      setPracticeState((previous) => {
        const copy = [...previous.p2ParagraphAnswers];
        copy[index] = dragItem;
        return { ...previous, p2ParagraphAnswers: copy, p2ParagraphFeedback: [] };
      });
    },
    [dragItem]
  );

  const checkParagraph = useCallback(() => {
    const answers = current.p2Band55.answers;
    const feedback = answers.map((expected, index) => normalize(practiceState.p2ParagraphAnswers[index] || "") === normalize(expected));
    setPracticeState((previous) => ({ ...previous, p2ParagraphFeedback: feedback }));
    if (feedback.length === answers.length && feedback.every(Boolean)) award("p2");
  }, [current, practiceState.p2ParagraphAnswers, award]);

  const checkCohesion = useCallback(
    (index: number) => {
      const tasks = getCohesionTasks();
      const userAnswer = practiceState.p2CohesionAnswers[index] || "";
      const ok = fuzzyMatch(userAnswer, tasks[index].answer);

      setPracticeState((previous) => ({
        ...previous,
        p2CohesionFeedback: { ...previous.p2CohesionFeedback, [index]: ok },
      }));

      const allCorrect = tasks.every((task, taskIndex) => {
        const answer = taskIndex === index ? userAnswer : practiceState.p2CohesionAnswers[taskIndex] || "";
        return fuzzyMatch(answer, task.answer);
      });

      if (allCorrect) award("p2");
    },
    [getCohesionTasks, practiceState.p2CohesionAnswers, award]
  );

  const getP2Hint = useCallback(() => {
    if (level === "band55") {
      setP2Hint("Structure: 'then' can go inside a sentence; 'after' goes before 'that'; 'the following stage is to + verb'.");
    } else if (level === "band6") {
      setP2Hint("Band 6: first-letter clues include N = Next and A = After. For combining, use before/after + being + past participle.");
    } else {
      setP2Hint("Band 6.5: check the target structure: followed by + noun phrase, before/after + being done, or after which + clause.");
    }
  }, [level]);

  const submitWriting = useCallback(() => {
    if (!canSubmitP3) {
      setWritingHint(`Please write at least 100 words. Current: ${wordCount}.`);
      return;
    }
    setPracticeState((previous) => ({ ...previous, p3Submitted: true }));
  }, [canSubmitP3, wordCount]);

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      setWritingHint(`Submit your paragraph first. You need ${Math.max(0, 100 - wordCount)} more words.`);
    } else if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      setWritingHint(`Hint: This is a ${first.type.toUpperCase()} issue: ${first.message}`);
    } else if (!reflectionComplete) {
      setWritingHint("No language errors remain. Complete all 3 self-reflection points to pass.");
    } else {
      setWritingHint("Well done. All errors corrected and reflection completed.");
    }
  }, [practiceState.p3Submitted, detectedErrors, reflectionComplete, wordCount]);

  const renderBlank = (index: number) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => dropToBlank(index)}
        onClick={() => dropToBlank(index)}
        role="textbox"
        aria-label={`Blank ${index + 1} for linker word`}
        aria-readonly
        className={`mx-1 inline-block min-w-[105px] rounded border-b-2 px-2 text-center ${
          checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"
        }`}
      >
        {practiceState.p2ParagraphAnswers[index] || "_____"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">IELTS Academic Writing Task 1</p>
              <h1 className="mt-1 text-3xl font-bold">Process Writing Training System</h1>
              <p className="mt-2 text-sm text-slate-600">Four process diagrams · three bands · sentence, cohesion and writing training.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={processKey}
                onChange={(event) => handleProcessOrLevelChange(event.target.value, level)}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
                aria-label="Select process diagram"
              >
                <option value="bamboo">Bamboo fabric</option>
                <option value="sugar">Sugar cane</option>
                <option value="noodles">Instant noodles</option>
                <option value="recycling">Recycling</option>
              </select>
              <select
                value={level}
                onChange={(event) => handleProcessOrLevelChange(processKey, event.target.value as BandLevel)}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
                aria-label="Select band level"
              >
                <option value="band55">Band 5.5</option>
                <option value="band6">Band 6</option>
                <option value="band65">Band 6.5</option>
              </select>
            </div>
          </div>
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold">{current.title}</p>
            <p className="text-sm text-slate-600">{current.task}</p>
            <p className="mt-2 text-lg font-bold text-blue-700">Score: {totalScore} / 10</p>
            <p className="text-sm text-slate-500">
              Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} · Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} · Practice 3:{" "}
              {earned.p3 ? "+5 earned" : "5 pts"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Process Diagram</h2>
            <img
              src={current.image}
              alt={current.title}
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border object-contain"
              onError={(event) => {
                event.currentTarget.src = "https://via.placeholder.com/900x520?text=Image+Not+Found";
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist">
              <Tab value="practice1" label="Practice 1" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice2" label="Practice 2" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice3" label="Practice 3" activePractice={activePractice} onSelect={setActivePractice} />
            </div>

            {activePractice === "practice1" && (
              <Card title="Practice 1 · Passive Voice / Sentence Upgrade">
                <div className="space-y-4">
                  {practice1Tasks.map((task, index) => (
                    <div key={`${processKey}-${level}-${index}`} className="rounded-xl border bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {index + 1}</p>
                      <p className="mt-1 font-medium">{task.instruction}</p>
                      <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
                      <input
                        value={practiceState.p1Answers[index] || ""}
                        onChange={(event) => updateP1Answer(index, event.target.value)}
                        className="mt-3 w-full rounded-xl border p-2"
                        placeholder="Write your answer here..."
                        aria-label={`Answer for task ${index + 1}`}
                      />
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => checkP1(index)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
                          Check
                        </button>
                        <button type="button" onClick={() => getP1Hint(index)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                          Hint
                        </button>
                      </div>
                      {p1Hints[index] && <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p1Hints[index]}</div>}
                      {practiceState.p1Feedback[index] !== undefined && (
                        <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p1Feedback[index] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {practiceState.p1Feedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activePractice === "practice2" && level === "band55" && (
              <Card title="Practice 2 · Controlled Paragraph Cohesion">
                <div className="rounded-2xl border bg-slate-50 p-5">
                  <p className="leading-10">
                    {current.p2Band55.text.map((chunk) => (
                      <span key={chunk[0]}>
                        {renderBlank(chunk[0])}
                        {chunk[1]}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border bg-white p-4">
                  {linkerOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      draggable
                      onClick={() => setDragItem(option)}
                      onDragStart={() => setDragItem(option)}
                      className={`cursor-grab rounded-xl border px-3 py-2 text-sm font-semibold ${
                        dragItem === option ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                    Hint
                  </button>
                  <button type="button" onClick={checkParagraph} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
                    Check
                  </button>
                  <button type="button" onClick={resetAllPracticeStates} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                    Reset
                  </button>
                </div>
                {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
              </Card>
            )}

            {activePractice === "practice2" && level !== "band55" && (
              <Card title={level === "band6" ? "Practice 2 · Band 6 Cohesion" : "Practice 2 · Band 6.5 Complex Cohesion"}>
                <div className="space-y-4">
                  {getCohesionTasks().map((task, index) => (
                    <div key={`${processKey}-${level}-${index}`} className="rounded-xl border bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {index + 1}</p>
                      {task.type === "fill" ? (
                        <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p>
                      ) : (
                        <div className="mt-2 rounded-lg bg-white p-3">
                          <p className="font-semibold">{task.prompt}</p>
                          <p>1. {task.parts?.[0]}</p>
                          <p>2. {task.parts?.[1]}</p>
                        </div>
                      )}
                      <input
                        value={practiceState.p2CohesionAnswers[index] || ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPracticeState((previous) => {
                            const nextFeedback = { ...previous.p2CohesionFeedback };
                            delete nextFeedback[index];
                            return {
                              ...previous,
                              p2CohesionAnswers: { ...previous.p2CohesionAnswers, [index]: value },
                              p2CohesionFeedback: nextFeedback,
                            };
                          });
                        }}
                        className="mt-3 w-full rounded-xl border p-2"
                        placeholder="Write your answer here..."
                        aria-label={`Cohesion task ${index + 1}`}
                      />
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => checkCohesion(index)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
                          Check
                        </button>
                        <button type="button" onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                          Hint
                        </button>
                      </div>
                      {practiceState.p2CohesionFeedback[index] !== undefined && (
                        <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p2CohesionFeedback[index] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {practiceState.p2CohesionFeedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
              </Card>
            )}

            {activePractice === "practice3" && (
              <Card title="Practice 3 · Timed Writing + Self-correction">
                <textarea
                  value={practiceState.p3Writing}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPracticeState((previous) => ({ ...previous, p3Writing: value, p3Submitted: false }));
                  }}
                  className="h-56 w-full rounded-2xl border p-3"
                  placeholder="Write your process paragraph here..."
                  aria-label="Writing area for process paragraph"
                />
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>
                    Word count: <strong>{wordCount}</strong>
                  </span>
                  <span>
                    Target: <strong>100+ words</strong>
                  </span>
                  {practiceState.p3Submitted && (
                    <>
                      <span>
                        Grammar errors: <strong>{grammarErrorCount}</strong>
                      </span>
                      <span>
                        Lexical errors: <strong>{lexisErrorCount}</strong>
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={submitWriting}
                    disabled={!canSubmitP3}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${canSubmitP3 ? "bg-blue-600" : "cursor-not-allowed bg-slate-400"}`}
                  >
                    Submit
                  </button>
                  <button type="button" onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                    Hint
                  </button>
                </div>
                {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}
                {practiceState.p3Submitted && <div className="mt-4 whitespace-pre-wrap rounded-2xl border bg-slate-50 p-4 leading-7">{highlightedWriting || "No writing submitted."}</div>}
                <div className="mt-5 rounded-2xl border bg-white p-4">
                  <p className="font-semibold">Self-reflection</p>
                  <div className="mt-3 space-y-2">
                    {practiceState.p3Reflection.map((item, index) => (
                      <input
                        key={index}
                        value={item}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPracticeState((previous) => {
                            const copy = [...previous.p3Reflection];
                            copy[index] = value;
                            return { ...previous, p3Reflection: copy };
                          });
                        }}
                        className="w-full rounded-xl border p-2"
                        placeholder={`Reflection ${index + 1}`}
                        aria-label={`Self-reflection point ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                {p3Pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS · +5 points</div>}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
