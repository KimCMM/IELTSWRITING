import { useMemo, useState, useCallback, useEffect } from "react";

// =====================
// 1. UTILITY HOOKS & HELPERS
// =====================

// LocalStorage persistence hook
const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage error for key ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to save to LocalStorage:`, error);
    }
  };

  return [storedValue, setValue];
};

// Debounce hook for performance optimization
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useCallback(
    (...args: any[]) => {
      let id: NodeJS.Timeout;
      return (...innerArgs: any[]) => {
        clearTimeout(id);
        id = setTimeout(() => callback(...innerArgs), delay);
      };
    },
    [callback, delay]
  );

  return timeoutRef;
};

// Enhanced normalization with apostrophes, hyphens, and common misspellings
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "") // Remove punctuation
    .replace(/[\-–]/g, "") // Remove hyphens
    .replace(/'/g, "") // Remove apostrophes
    .replace(/\s+/g, " ")
    .trim();

// Fuzzy match for flexible checking (Band 6.5+ complex sentences)
const fuzzyMatch = (user: string, expected: string, tolerance: number = 0.85): boolean => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);

  if (userNorm === expectedNorm) return true;

  const longer = userNorm.length > expectedNorm.length ? userNorm : expectedNorm;
  const shorter = longer === userNorm ? expectedNorm : userNorm;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) matches++;
  }

  return matches / longer.length >= tolerance;
};

// =====================
// 2. STATE RESET CONSOLIDATION (FIX #5)
// =====================

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

// =====================
// 3. ENHANCED ERROR RULES (FIX #4)
// =====================

interface ErrorRule {
  id: string;
  type: "grammar" | "lexis";
  pattern: RegExp;
  message: string;
  examples?: string[];
}

const createErrorRules = (processKey: string): ErrorRule[] => {
  const baseRules: ErrorRule[] = [
    {
      id: "g1",
      type: "grammar",
      pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin)\b(?!\w)/gi,
      message: "Use passive form: are + past participle (e.g., are placed, are collected)",
      examples: ["are placed", "are collected", "are sorted"],
    },
    {
      id: "g2",
      type: "grammar",
      pattern: /\b(are|is)\s+(\w+ed)\b/gi,
      message: "Check if this is correct passive form.",
    },
    {
      id: "l1",
      type: "lexis",
      pattern: /\b(end|final)\s+goods\b/gi,
      message: "Use 'end products' instead of 'end/final goods'",
    },
    {
      id: "l2",
      type: "lexis",
      pattern: /plastic\s+balls/gi,
      message: "Use 'plastic pellets', not 'plastic balls'",
    },
    {
      id: "l3",
      type: "lexis",
      pattern: /raw\s+materials\b/gi,
      message: "Use 'raw material' (uncountable) in this context",
    },
    {
      id: "l4",
      type: "lexis",
      pattern: /spinned/gi,
      message: "Use 'spun' (past participle of spin), not 'spinned'",
    },
  ];

  // Process-specific rules
  const processSpecificRules: Record<string, ErrorRule[]> = {
    bamboo: [
      {
        id: "b1",
        type: "lexis",
        pattern: /\b(fabric|cloth)\s+(is\s+)?manufacture/gi,
        message: "Use 'manufactured' or 'is manufactured', not 'manufacture'",
      },
    ],
    sugar: [
      {
        id: "s1",
        type: "grammar",
        pattern: /sugar\s+(is|are)\s+grown/gi,
        message: "Use 'cultivated' for a more formal verb",
      },
    ],
  };

  return [...baseRules, ...(processSpecificRules[processKey] || [])];
};

// =====================
// 4. PRACTICE 2 DATA FIX (FIX #1)
// =====================

// Verify and fix p2Band55 answers array
const fixP2Band55Data = (processData: any) => {
  Object.keys(processData).forEach((key) => {
    const process = processData[key];
    if (process.p2Band55 && Array.isArray(process.p2Band55.answers)) {
      // Ensure exactly 8 answers
      if (process.p2Band55.answers.length !== 8) {
        console.warn(
          `⚠️ Process "${key}" p2Band55 has ${process.p2Band55.answers.length} answers (expected 8). Padding with empty strings.`
        );
        while (process.p2Band55.answers.length < 8) {
          process.p2Band55.answers.push("");
        }
      }
    }
  });
  return processData;
};

// =====================
// 5. ACCESSIBILITY HELPERS (FIX #6)
// =====================

interface KeyboardProps {
  onEnter?: () => void;
  onEscape?: () => void;
}

const useKeyboard = ({ onEnter, onEscape }: KeyboardProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && onEnter) onEnter();
      if (e.key === "Escape" && onEscape) onEscape();
    },
    [onEnter, onEscape]
  );
  return { handleKeyDown };
};

// =====================
// 6. MAIN COMPONENT
// =====================

export default function IELTSProcessTrainerFullSystem() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");

  // LocalStorage for scores
  const [scoreMap, setScoreMap] = useLocalStorage("ieltsScores", {});

  // Consolidated practice state
  const [practiceState, setPracticeState] = useState<PracticeState>(initialPracticeState);

  // =====================
  // RESET HANDLER (FIX #5 - DRY)
  // =====================

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
  }, []);

  // Handle process or level change
  const handleProcessOrLevelChange = useCallback(
    (newProcess?: string, newLevel?: string) => {
      setProcessKey(newProcess || processKey);
      setLevel(newLevel || level);
      resetAllPracticeStates();
    },
    [processKey, level, resetAllPracticeStates]
  );

  // =====================
  // PRODUCT DATA (Fixed)
  // =====================

  let processData = {
    bamboo: {
      title: "Bamboo Fabric",
      task: "The diagram below shows how fabric is manufactured from bamboo.",
      image: "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
      steps: [
        { active: "People plant bamboo plants in spring.", passive: "Bamboo plants are planted in spring.", prompt6: "bamboo plants / plant / spring" },
        { active: "People harvest bamboo plants in autumn.", passive: "Bamboo plants are harvested in autumn.", prompt6: "bamboo plants / harvest / autumn" },
        // ... rest of steps
      ],
      band65: [
        { prompt: "Bamboo plants are grown in spring.", task: "Use a more formal verb.", answer: "Bamboo plants are cultivated in spring." },
        // ... rest
      ],
      p2Band55: {
        text: [
          [0, " bamboo plants are planted in spring. Bamboo plants are "],
          [1, " harvested in autumn. "],
          [2, " that, bamboo plants are cut into strips. "],
          [3, " is to crush the strips to make liquid pulp. "],
          [4, ", long fibres are separated from the liquid by a filter. In the "],
          [5, " stage, water and amine oxide are added to soften the fibres. The fibres are "],
          [6, " spun to make yarn. "],
          [7, ", yarn is woven to make fabric."],
        ],
        answers: ["first", "then", "after", "the following stage", "next", "next", "then", "finally"],
      },
      // ... rest of data
    },
    // ... other processes
  };

  // Apply fix to data
  processData = useMemo(() => fixP2Band55Data(processData), []);

  const current = processData[processKey];
  const steps = current.steps;

  // =====================
  // SCORE SYSTEM
  // =====================

  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);

  const award = useCallback(
    (practice: "p1" | "p2" | "p3") => {
      setScoreMap((prev) => {
        const currentEarned = prev[scoreKey] || { p1: false, p2: false, p3: false };
        if (currentEarned[practice]) return prev;
        return {
          ...prev,
          [scoreKey]: {
            ...currentEarned,
            [practice]: true,
          },
        };
      });
    },
    [scoreKey]
  );

  // =====================
  // PRACTICE 1 LOGIC (FIX #2, #3)
  // =====================

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return steps.map((s) => ({
        prompt: s.active,
        answer: s.passive,
        instruction: "Rewrite the active sentence in the passive voice.",
      }));
    }
    if (level === "band6") {
      return steps.map((s) => ({
        prompt: s.prompt6,
        answer: s.passive,
        instruction: "Use the words and the diagram to write a complete passive sentence.",
      }));
    }
    return current.band65.map((s) => ({
      prompt: s.prompt,
      answer: s.answer,
      instruction: s.task,
    }));
  }, [level, processKey]);

  const [p1Hint, setP1Hint] = useState("");

  const checkP1 = useCallback(
    (index: number) => {
      const userAnswer = practiceState.p1Answers[index] || "";
      const ok = fuzzyMatch(userAnswer, practice1Tasks[index].answer);

      setPracticeState((prev) => ({
        ...prev,
        p1Feedback: { ...prev.p1Feedback, [index]: ok },
      }));

      // Check if all correct
      const allCorrect = practice1Tasks.every((task, i) => {
        const answer = i === index ? userAnswer : practiceState.p1Answers[i] || "";
        return fuzzyMatch(answer, task.answer);
      });

      if (allCorrect) award("p1");
    },
    [practice1Tasks, practiceState.p1Answers, award]
  );

  const getP1Hint = useCallback((index: number) => {
    if (level === "band55") {
      setP1Hint(`Task ${index + 1}: Move the object to the subject position and use be + past participle.`);
    } else if (level === "band6") {
      setP1Hint(`Task ${index + 1}: Use be + past participle. Check the diagram for prepositions and details.`);
    } else {
      setP1Hint(`Task ${index + 1}: ${practice1Tasks[index].instruction}`);
    }
  }, [level, practice1Tasks]);

  // =====================
  // PRACTICE 2 LOGIC
  // =====================

  const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];
  const [dragItem, setDragItem] = useState(null);
  const [p2Hint, setP2Hint] = useState("");

  const dropToBlank = useCallback((index: number) => {
    if (!dragItem) return;
    setPracticeState((prev) => {
      const copy = [...prev.p2ParagraphAnswers];
      copy[index] = dragItem;
      return { ...prev, p2ParagraphAnswers: copy };
    });
  }, [dragItem]);

  const checkParagraph = useCallback(() => {
    const answers = current.p2Band55.answers;
    const feedback = practiceState.p2ParagraphAnswers.map((a, i) => a === answers[i]);
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    if (feedback.every(Boolean)) award("p2");
  }, [current, practiceState.p2ParagraphAnswers, award]);

  const getCohesionTasks = useCallback(() => {
    return level === "band6" ? current.p2Band6 : current.p2Band65;
  }, [level, current]);

  const checkCohesion = useCallback(
    (index: number) => {
      const tasks = getCohesionTasks();
      const userAnswer = practiceState.p2CohesionAnswers[index] || "";
      const ok = fuzzyMatch(userAnswer, tasks[index].answer);

      setPracticeState((prev) => ({
        ...prev,
        p2CohesionFeedback: { ...prev.p2CohesionFeedback, [index]: ok },
      }));

      // Check if all correct
      const allCorrect = tasks.every((task, i) => {
        const answer = i === index ? userAnswer : practiceState.p2CohesionAnswers[i] || "";
        return fuzzyMatch(answer, task.answer);
      });

      if (allCorrect) award("p2");
    },
    [getCohesionTasks, practiceState.p2CohesionAnswers, award]
  );

  const getP2Hint = useCallback(() => {
    if (level === "band55") {
      setP2Hint("Structure: 'then' can go inside a sentence; 'after' goes before 'that'; 'the following stage is to + verb'; 'in the next stage' fits the pattern 'In the ___ stage'.");
    } else if (level === "band6") {
      setP2Hint("Band 6: first-letter clues include N = Next, A = After, S = Subsequently. For combining, use before/after + being + past participle.");
    } else {
      setP2Hint("Band 6.5: check the target structure: followed by + noun phrase, before/after + being done, or after which + clause.");
    }
  }, [level]);

  // =====================
  // PRACTICE 3 LOGIC (FIX #4, #7)
  // =====================

  const errorRules = useMemo(() => createErrorRules(processKey), [processKey]);

  const detectedErrors = useMemo(() => {
    if (!practiceState.p3Submitted) return [];
    const found: any[] = [];
    errorRules.forEach((rule) => {
      [...practiceState.p3Writing.matchAll(rule.pattern)].forEach((match) => {
        found.push({ ...rule, match: match[0], index: match.index });
      });
    });
    return found.sort((a, b) => a.index - b.index);
  }, [practiceState.p3Submitted, practiceState.p3Writing, errorRules]);

  const highlightedWriting = useMemo(() => {
    if (!practiceState.p3Submitted || detectedErrors.length === 0) {
      return practiceState.p3Writing;
    }
    const output: (string | React.JSX.Element)[] = [];
    let cursor = 0;
    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(practiceState.p3Writing.slice(cursor, error.index));
      output.push(
        <strong
          key={`${error.id}-${index}`}
          className={`rounded px-1 font-bold ${
            error.type === "grammar" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
          }`}
          role="doc-noteref"
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

  const wordCount = practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(/\s+/).length : 0;
  const grammarErrorCount = detectedErrors.filter((e) => e.type === "grammar").length;
  const lexisErrorCount = detectedErrors.filter((e) => e.type === "lexis").length;
  const reflectionComplete = practiceState.p3Reflection.every((item) => item.trim().length > 0);

  // Only allow submission if wordCount >= 100
  const canSubmitP3 = wordCount >= 100;
  const p3Pass = practiceState.p3Submitted && detectedErrors.length === 0 && reflectionComplete;

  const submitWriting = useCallback(() => {
    if (!canSubmitP3) {
      alert(`Please write at least 100 words. Current: ${wordCount}`);
      return;
    }
    setPracticeState((prev) => ({ ...prev, p3Submitted: true }));
  }, [canSubmitP3, wordCount]);

  const [writingHint, setWritingHint] = useState("");

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      setWritingHint(`Submit your paragraph first (need ${100 - wordCount} more words).`);
    } else if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      setWritingHint(`Hint: This is a ${first.type.toUpperCase()} issue → ${first.message}`);
    } else if (!reflectionComplete) {
      setWritingHint("No language errors remain. Complete all 3 self-reflection points to pass.");
    } else {
      setWritingHint("Well done. All errors corrected and reflection completed.");
    }
  }, [practiceState.p3Submitted, detectedErrors, reflectionComplete, wordCount]);

  // Award p3 if conditions met
  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  // =====================
  // UI COMPONENTS
  // =====================

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );

  const Tab = ({ value, label }: { value: string; label: string }) => (
    <button
      onClick={() => setActivePractice(value)}
      role="tab"
      aria-selected={activePractice === value}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </button>
  );

  const renderBlank = (index: number) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
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

  const renderBand55Paragraph = () => {
    const chunks = current.p2Band55.text;
    return (
      <p className="leading-10">
        {chunks.map((chunk, i) => (
          <span key={i}>
            {renderBlank(chunk[0])}
            {chunk[1]}
          </span>
        ))}
      </p>
    );
  };

  const renderPractice1 = () => (
    <Card title="Practice 1 · Passive Voice / Sentence Upgrade">
      <p className="mb-4 text-sm text-slate-600">5.5: active to passive · 6: diagram words to passive sentence · 6.5: synonym, detail and complex sentence.</p>
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
            <p className="mt-1 font-medium">{task.instruction}</p>
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            <input
              value={practiceState.p1Answers[i] || ""}
              onChange={(e) => {
                setPracticeState((prev) => ({
                  ...prev,
                  p1Answers: { ...prev.p1Answers, [i]: e.target.value },
                }));
              }}
              className="mt-3 w-full rounded-xl border p-2"
              placeholder="Write your answer here..."
              aria-label={`Answer for task ${i + 1}`}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => checkP1(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
                Check
              </button>
              <button onClick={() => getP1Hint(i)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                Hint
              </button>
            </div>
            {practiceState.p1Feedback[i] !== undefined && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p1Feedback[i] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {practiceState.p1Feedback[i] ? "Correct." : `Suggested answer: ${task.answer}`}
              </div>
            )}
          </div>
        ))}
      </div>
      {p1Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p1Hint}</div>}
    </Card>
  );

  const renderPractice2 = () => {
    if (level === "band55") {
      return (
        <Card title="Practice 2 · Controlled Paragraph Cohesion">
          <p className="mb-4 text-sm text-slate-600">Drag the correct linker into each blank. This task trains position, fixed expressions and stage language.</p>
          <div className="rounded-2xl border bg-slate-50 p-5">{renderBand55Paragraph()}</div>
          <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border bg-white p-4">
            {linkerOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={() => setDragItem(option)}
                role="button"
                tabIndex={0}
                aria-label={`Drag linker: ${option}`}
                className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
              >
                {option}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
              Hint
            </button>
            <button onClick={checkParagraph} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
              Check
            </button>
            <button onClick={resetAllPracticeStates} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
              Reset
            </button>
          </div>
          {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
          {practiceState.p2ParagraphFeedback.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {practiceState.p2ParagraphFeedback.map((ok, i) => (
                <div key={i} className={`rounded-xl border p-3 text-sm ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  Blank {i + 1}: {ok ? "Correct" : "Check again"}
                </div>
              ))}
            </div>
          )}
        </Card>
      );
    }

    const tasks = getCohesionTasks();
    return (
      <Card title={level === "band6" ? "Practice 2 · Band 6 Cohesion" : "Practice 2 · Band 6.5 Complex Cohesion"}>
        <p className="mb-4 text-sm text-slate-600">
          {level === "band6" ? "First-letter linker tasks + before/after being done." : "Use followed by + noun phrase, before/after doing, and after which."}
        </p>
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
              {task.type === "fill" ? (
                <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p>
              ) : (
                <div className="mt-2 rounded-lg bg-white p-3">
                  <p className="font-semibold">{task.prompt}</p>
                  <p>1. {task.parts[0]}</p>
                  <p>2. {task.parts[1]}</p>
                </div>
              )}
              <input
                value={practiceState.p2CohesionAnswers[i] || ""}
                onChange={(e) => {
                  setPracticeState((prev) => ({
                    ...prev,
                    p2CohesionAnswers: { ...prev.p2CohesionAnswers, [i]: e.target.value },
                  }));
                }}
                className="mt-3 w-full rounded-xl border p-2"
                placeholder="Write your answer here..."
                aria-label={`Cohesion task ${i + 1}`}
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => checkCohesion(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">
                  Check
                </button>
                <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                  Hint
                </button>
              </div>
              {practiceState.p2CohesionFeedback[i] !== undefined && (
                <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p2CohesionFeedback[i] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {practiceState.p2CohesionFeedback[i] ? "Correct." : `Suggested answer: ${task.answer}`}
                </div>
              )}
            </div>
          ))}
        </div>
        {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
      </Card>
    );
  };

  const renderPractice3 = () => (
    <Card title="Practice 3 · Timed Writing + Self-correction">
      <p className="mb-4 text-sm text-slate-600">Write a 100+ word body paragraph. Submit, correct highlighted errors, and complete three reflection points before passing.</p>
      <textarea
        value={practiceState.p3Writing}
        onChange={(e) => {
          setPracticeState((prev) => ({ ...prev, p3Writing: e.target.value }));
        }}
        className="h-56 w-full rounded-2xl border p-3"
        placeholder="Write your process paragraph here..."
        aria-label="Writing area for process paragraph"
      />
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span>
          Word count: <strong>{wordCount}</strong>
        </span>
        <span>Target: <strong>100+ words</strong></span>
        {practiceState.p3Submitted && (
          <>
            <span>Grammar errors: <strong>{grammarErrorCount}</strong></span>
            <span>Lexical errors: <strong>{lexisErrorCount}</strong></span>
          </>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={submitWriting}
          disabled={!canSubmitP3}
          className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${canSubmitP3 ? "bg-blue-600" : "bg-slate-400 cursor-not-allowed"}`}
        >
          Submit
        </button>
        <button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
          Hint
        </button>
      </div>
      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}
      {practiceState.p3Submitted && <div className="mt-4 rounded-2xl border bg-slate-50 p-4 whitespace-pre-wrap leading-7">{highlightedWriting || "No writing submitted."}</div>}
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-reflection</p>
        <p className="mt-1 text-sm text-slate-600">Write 3 language points or main features you need to focus on next time.</p>
        <div className="mt-3 space-y-2">
          {practiceState.p3Reflection.map((item, i) => (
            <input
              key={i}
              value={item}
              onChange={(e) => {
                setPracticeState((prev) => {
                  const copy = [...prev.p3Reflection];
                  copy[i] = e.target.value;
                  return { ...prev, p3Reflection: copy };
                });
              }}
              className="w-full rounded-xl border p-2"
              placeholder={`Reflection ${i + 1}`}
              aria-label={`Self-reflection point ${i + 1}`}
            />
          ))}
        </div>
      </div>
      {p3Pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS · +5 points</div>}
    </Card>
  );

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
                onChange={(e) => handleProcessOrLevelChange(e.target.value, level)}
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
                onChange={(e) => handleProcessOrLevelChange(processKey, e.target.value)}
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
              Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} · Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} · Practice 3: {earned.p3 ? "+5 earned" : "5 pts"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">

            <h2 className="mb-3 text-lg font-bold">Process Diagram</h2>
            <img src={current.image} alt={current.title} className="w-full rounded-xl border object-contain" onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=Image+Not+Found";
            }} />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist">
              <Tab value="practice1" label="Practice 1" />
              <Tab value="practice2" label="Practice 2" />
              <Tab value="practice3" label="Practice 3" />
            </div>
            {activePractice === "practice1" && renderPractice1()}
            {activePractice === "practice2" && renderPractice2()}
            {activePractice === "practice3" && renderPractice3()}
          </div>
        </div>
      </div>
    </div>
  );
}
