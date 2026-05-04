import { memo, useMemo, useState, useCallback, useEffect } from "react";

// =====================
// 1. HELPERS
// =====================

const useLocalStorage = (key, initialValue) => {
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

  const setValue = useCallback(
    (valueOrUpdater) => {
      try {
        setStoredValue((prev) => {
          const value = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
          return value;
        });
      } catch (error) {
        console.error("Failed to save to LocalStorage:", error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/[\-–]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

const fuzzyMatch = (user, expected, tolerance = 0.88) => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (!userNorm || !expectedNorm) return false;
  if (userNorm === expectedNorm) return true;

  const userWords = userNorm.split(" ");
  const expectedWords = expectedNorm.split(" ");
  const matchedWords = expectedWords.filter((word) => userWords.includes(word)).length;
  return matchedWords / expectedWords.length >= tolerance;
};

const isAnswerCorrect = (user, expected, level) => {
  if (level === "band65") return fuzzyMatch(user, expected, 0.82);
  return normalize(user) === normalize(expected);
};

const initialPracticeState = {
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

const createErrorRules = (processKey) => {
  const baseRules = [
    {
      id: "g1",
      type: "grammar",
      pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin|produce|pack|label|seal|crush|wash|dry|cool)\b(?!\w)/gi,
      message: "Use passive form: be + past participle, e.g. are placed / are collected.",
      examples: ["are placed", "are collected", "are sorted"],
    },
    {
      id: "g2",
      type: "grammar",
      pattern: /\b(fibres|bottles|pellets|crystals|plants|strips|cups)\s+is\b/gi,
      message: "Use a plural verb with plural nouns, e.g. fibres are / bottles are.",
      examples: ["fibres are", "plastic bottles are"],
    },
    {
      id: "g3",
      type: "grammar",
      pattern: /\b(water and amine oxide|vegetables and spices)\s+is\b/gi,
      message: "Use 'are' with a compound plural subject.",
      examples: ["water and amine oxide are added", "vegetables and spices are added"],
    },
    {
      id: "l1",
      type: "lexis",
      pattern: /\b(end|final)\s+goods\b/gi,
      message: "Use 'end products' instead of 'end/final goods'.",
      examples: ["end products"],
    },
    {
      id: "l2",
      type: "lexis",
      pattern: /plastic\s+balls/gi,
      message: "Use 'plastic pellets', not 'plastic balls'.",
      examples: ["plastic pellets"],
    },
    {
      id: "l3",
      type: "lexis",
      pattern: /raw\s+materials\b/gi,
      message: "Use 'raw material' as an uncountable noun here.",
      examples: ["raw material"],
    },
    {
      id: "l4",
      type: "lexis",
      pattern: /spinned/gi,
      message: "Use 'spun', not 'spinned'.",
      examples: ["fibres are spun"],
    },
    {
      id: "sp1",
      type: "spelling",
      pattern: /\b(botles|bottels)\b/gi,
      message: "Spelling: use 'bottles'.",
      examples: ["bottles"],
    },
    {
      id: "sp2",
      type: "spelling",
      pattern: /\b(recyling|recylcing)\b/gi,
      message: "Spelling: use 'recycling'.",
      examples: ["recycling"],
    },
    {
      id: "sp3",
      type: "spelling",
      pattern: /\b(vegatables|vegetabels)\b/gi,
      message: "Spelling: use 'vegetables'.",
      examples: ["vegetables"],
    },
    {
      id: "sp4",
      type: "spelling",
      pattern: /\b(materail|matrial)\b/gi,
      message: "Spelling: use 'material'.",
      examples: ["material"],
    },
    {
      id: "sp5",
      type: "spelling",
      pattern: /\b(produts|productions)\b/gi,
      message: "Spelling/word choice: use 'products'.",
      examples: ["products"],
    },
    {
      id: "sp6",
      type: "spelling",
      pattern: /\b(fibers|fiberrs|fibreses)\b/gi,
      message: "Use the task spelling 'fibres'.",
      examples: ["fibres"],
    },
    {
      id: "sp7",
      type: "spelling",
      pattern: /\b(liqued|liqid)\b/gi,
      message: "Spelling: use 'liquid'.",
      examples: ["liquid"],
    },
  ];

  const specific = {
    bamboo: [
      {
        id: "b1",
        type: "lexis",
        pattern: /\bfabric\s+(is\s+)?manufacture\b/gi,
        message: "Use 'is manufactured' or 'is made', not 'manufacture'.",
        examples: ["fabric is manufactured"],
      },
      {
        id: "b2",
        type: "spelling",
        pattern: /\b(autum|autemn)\b/gi,
        message: "Spelling: use 'autumn'.",
        examples: ["autumn"],
      },
    ],
    sugar: [
      {
        id: "s1",
        type: "grammar",
        pattern: /\bthe sugar cane is harvest\b/gi,
        message: "Use the past participle: harvested.",
        examples: ["The sugar cane is harvested."],
      },
      {
        id: "s2",
        type: "spelling",
        pattern: /\b(limeston|limstone)\b/gi,
        message: "Spelling: use 'limestone'.",
        examples: ["limestone"],
      },
    ],
    noodles: [
      {
        id: "n1",
        type: "spelling",
        pattern: /\b(noodels|noodls)\b/gi,
        message: "Spelling: use 'noodles'.",
        examples: ["noodles"],
      },
    ],
  };

  return [...baseRules, ...(specific[processKey] || [])];
};

const fixP2Band55Data = (rawData) => {
  const copy = JSON.parse(JSON.stringify(rawData));
  Object.keys(copy).forEach((key) => {
    const item = copy[key];
    if (!item.p2Band55) return;
    while (item.p2Band55.answers.length < 8) item.p2Band55.answers.push("");
    if (item.p2Band55.answers.length > 8) item.p2Band55.answers = item.p2Band55.answers.slice(0, 8);
  });
  return copy;
};

// =====================
// 2. DATA
// =====================

const rawProcessData = {
  bamboo: {
    title: "Bamboo Fabric",
    task: "The diagram below shows how fabric is manufactured from bamboo.",
    image: "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
    steps: [
      { active: "People plant bamboo plants in spring.", passive: "Bamboo plants are planted in spring.", prompt6: "bamboo plants / plant / spring" },
      { active: "People harvest bamboo plants in autumn.", passive: "Bamboo plants are harvested in autumn.", prompt6: "bamboo plants / harvest / autumn" },
      { active: "A machine cuts bamboo plants into strips.", passive: "Bamboo plants are cut into strips.", prompt6: "bamboo plants / cut / strips" },
      { active: "A machine crushes the strips to make liquid pulp.", passive: "The strips are crushed to make liquid pulp.", prompt6: "strips / crush / liquid pulp" },
      { active: "A filter separates long fibres from the liquid.", passive: "Long fibres are separated from the liquid by a filter.", prompt6: "long fibres / separate / liquid / filter" },
      { active: "People add water and amine oxide to soften the fibres.", passive: "Water and amine oxide are added to soften the fibres.", prompt6: "water and amine oxide / add / soften fibres" },
      { active: "People spin fibres to make yarn.", passive: "Fibres are spun to make yarn.", prompt6: "fibres / spin / yarn" },
      { active: "People weave yarn to make fabric.", passive: "Yarn is woven to make fabric.", prompt6: "yarn / weave / fabric" },
      { active: "People use fabric to make clothes.", passive: "Fabric is used to make clothes.", prompt6: "fabric / use / clothes" },
    ],
    band65: [
      { prompt: "Bamboo plants are grown in spring.", task: "Upgrade the verb.", answer: "Bamboo plants are cultivated in spring." },
      { prompt: "Bamboo plants are harvested in autumn.", task: "Combine the time detail naturally.", answer: "They are harvested in autumn." },
      { prompt: "Bamboo plants are cut into strips.", task: "Use a pronoun to avoid repetition.", answer: "They are then cut into strips." },
      { prompt: "The strips are crushed to make liquid pulp.", task: "Use a result structure.", answer: "The strips are crushed, producing liquid pulp." },
      { prompt: "Long fibres are separated from the liquid by a filter.", task: "Upgrade the verb.", answer: "Long fibres are extracted from the liquid by a filter." },
      { prompt: "Water and amine oxide are added to soften the fibres.", task: "Use a by + -ing structure.", answer: "The fibres are softened by adding water and amine oxide." },
      { prompt: "Fibres are spun to make yarn.", task: "Use a more natural result structure.", answer: "The fibres are spun into yarn." },
      { prompt: "Yarn is woven to make fabric.", task: "Use a more natural result structure.", answer: "The yarn is woven into fabric." },
      { prompt: "Fabric is used to make clothes.", task: "Add the final examples from the diagram if shown.", answer: "The fabric is used to make clothes and socks." },
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
    p2Band6: [
      // First half of the process: first-letter linker practice
      { type: "fill", sentence: "F______, bamboo plants are planted in spring.", answer: "First" },
      { type: "fill", sentence: "N______, bamboo plants are harvested in autumn.", answer: "Next" },
      { type: "fill", sentence: "A______ that, bamboo plants are cut into strips.", answer: "After" },
      { type: "fill", sentence: "S__________, the strips are crushed to make liquid pulp.", answer: "Subsequently" },
      // Second half of the process: before/after + being done practice
      { type: "combine", prompt: "Combine using after doing.", parts: ["The strips are crushed to make liquid pulp.", "Long fibres are separated from the liquid by a filter."], answer: "Long fibres are separated from the liquid by a filter after being crushed to make liquid pulp." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The fibres are softened.", "They are spun to make yarn."], answer: "The fibres are softened before being spun to make yarn." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["Yarn is woven to make fabric.", "It is used to make clothes."], answer: "Yarn is woven to make fabric before being used to make clothes." },
    ],
    p2Band65: [
      {
        prompt: "Combine using before doing.",
        parts: [
          "Plastic bottles are placed in recycling bins.",
          "They are collected and transported by a truck.",
        ],
        answer: "Plastic bottles are placed in recycling bins before being collected and transported by a truck.",
      },
      {
        prompt: "Combine using after doing.",
        parts: [
          "Plastic bottles are collected and transported by a truck.",
          "They are sorted in a recycling centre.",
        ],
        answer: "They are sorted in a recycling centre after being collected and transported by a truck.",
      },
      {
        prompt: "Combine using followed by + noun phrase.",
        parts: [
          "Plastic bottles are sorted in a recycling centre.",
          "They are compressed into blocks.",
        ],
        answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks.",
      },
      {
        prompt: "Combine using after which.",
        parts: [
          "Plastic bottles are compressed into blocks.",
          "The blocks are crushed and the pieces are washed.",
        ],
        answer: "Plastic bottles are compressed into blocks, after which the blocks are crushed and the pieces are washed.",
      },
      {
        prompt: "Combine using after doing.",
        parts: [
          "The pieces are washed.",
          "Plastic pellets are produced.",
        ],
        answer: "Plastic pellets are produced after the pieces are washed.",
      },
      {
        prompt: "Combine using before doing.",
        parts: [
          "Plastic pellets are produced.",
          "They are heated to form raw material.",
        ],
        answer: "Plastic pellets are produced before being heated to form raw material.",
      },
      {
        prompt: "Combine using before doing.",
        parts: ["The raw material is packed.", "End products are produced."],
        answer: "The raw material is packed before end products are produced.",
      },
    ],
  },
};

// =====================
// 3. MAIN COMPONENT
// =====================

export default function IELTSProcessTrainerFullSystem() {
  const processData = useMemo(() => fixP2Band55Data(rawProcessData), []);

  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage("ielts-process-scores", {});
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [dragItem, setDragItem] = useState(null);
  const [p1Hint, setP1Hint] = useState("");
  const [p2Hint, setP2Hint] = useState("");
  const [writingHint, setWritingHint] = useState("");

  const current = processData[processKey];
  const steps = current.steps;
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore <= 3 ? "Beginner" : totalScore <= 7 ? "Developing" : "Advanced";

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint({ index, text: "Use be + past participle. Check the diagram for prepositions and details." });
      else setP1Hint({ index, text: practice1Tasks[index].instruction });
    },
    [level, practice1Tasks]
  );

  // =====================
  // PRACTICE 2
  // =====================

  const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];

  const dropToBlank = useCallback(
    (index) => {
      if (!dragItem) return;
      setPracticeState((prev) => {
        const copy = [...prev.p2ParagraphAnswers];
        copy[index] = dragItem;
        return { ...prev, p2ParagraphAnswers: copy };
      });
    },
    [dragItem]
  );

  const checkParagraph = useCallback(() => {
    const expected = current.p2Band55.answers;
    const feedback = practiceState.p2ParagraphAnswers.map((a, i) => a === expected[i]);
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    if (feedback.every(Boolean)) award("p2");
  }, [current, practiceState.p2ParagraphAnswers, award]);

  const getCohesionTasks = useCallback(() => (level === "band6" ? current.p2Band6 : current.p2Band65), [level, current]);

  const checkCohesion = useCallback(
    (index) => {
      const tasks = getCohesionTasks();
      const updatedAnswers = { ...practiceState.p2CohesionAnswers };
      const userAnswer = updatedAnswers[index] || "";
      const ok = isAnswerCorrect(userAnswer, tasks[index].answer, level);
      const updatedFeedback = { ...practiceState.p2CohesionFeedback, [index]: ok };

      setPracticeState((prev) => ({ ...prev, p2CohesionFeedback: updatedFeedback }));

      const allCorrect = tasks.every((task, i) => isAnswerCorrect(updatedAnswers[i] || "", task.answer, level));
      if (allCorrect) award("p2");
    },
    [getCohesionTasks, practiceState.p2CohesionAnswers, practiceState.p2CohesionFeedback, level, award]
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

  const renderBlank = (index) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        role="textbox"
        aria-label={`Blank ${index + 1} for linker word`}
        aria-readonly="true"
        className={`mx-1 inline-block min-w-[105px] rounded border-b-2 px-2 text-center ${
          checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"
        }`}
      >
        {practiceState.p2ParagraphAnswers[index] || "_____"}
      </span>
    );
  };

  const renderBand55Paragraph = () => (
    <p className="leading-10">
      {current.p2Band55.text.map((chunk, i) => (
        <span key={i}>
          {renderBlank(chunk[0])}
          {chunk[1]}
        </span>
      ))}
    </p>
  );

  // =====================
  // PRACTICE 3
  // =====================

  const errorRules = useMemo(() => createErrorRules(processKey), [processKey]);

  const detectedErrors = useMemo(() => {
    if (!practiceState.p3Submitted) return [];
    const found = [];
    errorRules.forEach((rule) => {
      [...practiceState.p3Writing.matchAll(rule.pattern)].forEach((match) => {
        found.push({ ...rule, match: match[0], index: match.index });
      });
    });
    return found.sort((a, b) => a.index - b.index);
  }, [practiceState.p3Submitted, practiceState.p3Writing, errorRules]);

  const highlightedWriting = useMemo(() => {
    if (!practiceState.p3Submitted || detectedErrors.length === 0) return practiceState.p3Writing;
    const output = [];
    let cursor = 0;
    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(practiceState.p3Writing.slice(cursor, error.index));
      output.push(
        <strong
          key={`${error.id}-${index}`}
          className={`rounded px-1 font-bold ${error.type === "grammar" ? "bg-red-100 text-red-700" : error.type === "spelling" ? "bg-purple-100 text-purple-700" : "bg-yellow-100 text-yellow-700"}`}
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

  // Dynamic word requirement by band
  const wordRequirement = level === "band55" ? 70 : level === "band6" ? 80 : 100;
  const wordTargetRange = level === "band55" ? "70–80" : level === "band6" ? "80–100" : "100–120";
  const grammarErrorCount = detectedErrors.filter((e) => e.type === "grammar").length;
  const lexisErrorCount = detectedErrors.filter((e) => e.type === "lexis").length;
  const spellingErrorCount = detectedErrors.filter((e) => e.type === "spelling").length;
  const reflectionComplete = practiceState.p3Reflection.every((item) => item.trim().length > 0);
  const canSubmitP3 = wordCount >= wordRequirement;
  const p3Pass = practiceState.p3Submitted && detectedErrors.length === 0 && reflectionComplete;

  const writingDiagnostics = useMemo(() => {
    const text = practiceState.p3Writing.toLowerCase();
    const passiveMatches = text.match(/\b(is|are)\s+\w+(ed|en)\b|\bare\s+spun\b|\bis\s+woven\b|\bare\s+put\b/gi) || [];
    const basicLinkers = ["first", "then", "next", "after that", "finally"].filter((w) => text.includes(w));
    const advancedLinkers = ["subsequently", "after which", "followed by", "before being", "after being"].filter((w) => text.includes(w));
    const pronouns = ["it", "they", "them", "this"].filter((w) => new RegExp(`\\b${w}\\b`).test(text));

    let estimatedBand = "5.5";
    if (level === "band6" && wordCount >= wordRequirement && passiveMatches.length >= 4 && basicLinkers.length >= 2) estimatedBand = "6.0";
    if (level === "band65" && wordCount >= wordRequirement && passiveMatches.length >= 5 && advancedLinkers.length >= 1) estimatedBand = "6.5";
    if (level === "band55" && wordCount >= wordRequirement && passiveMatches.length >= 3 && basicLinkers.length >= 2) estimatedBand = "5.5";

    const feedback = [];
    if (wordCount < wordRequirement) feedback.push(`Develop the paragraph to at least ${wordRequirement} words.`);
    if (passiveMatches.length < 3) feedback.push("Use more present simple passive forms to describe process steps.");
    if (basicLinkers.length < 2) feedback.push("Add clear sequencing linkers such as first, then, next and finally.");
    if (level !== "band55" && pronouns.length < 1) feedback.push("Use pronouns such as it/they/them to reduce repetition.");
    if (level === "band65" && advancedLinkers.length < 1) feedback.push("Try at least one complex linking structure, such as after which, followed by, or before/after being done.");
    if (feedback.length === 0) feedback.push("Good control of process language for this level. Check spelling and article use before submission.");

    return {
      estimatedBand,
      passiveCount: passiveMatches.length,
      basicLinkerCount: basicLinkers.length,
      advancedLinkerCount: advancedLinkers.length,
      pronounCount: pronouns.length,
      feedback,
    };
  }, [practiceState.p3Writing, level, wordCount, wordRequirement]);

  const submitWriting = useCallback(() => {
    if (!canSubmitP3) {
      setWritingHint(`Please write at least ${wordRequirement} words. Target range: ${wordTargetRange} words. Current: ${wordCount}.`);
      return;
    }
    setPracticeState((prev) => ({ ...prev, p3Submitted: true }));
  }, [canSubmitP3, wordCount, wordRequirement, wordTargetRange]);

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      if (level === "band55") {
        setWritingHint("Band 5.5: Use present simple passive to describe the process. Add basic linkers such as First, Then, Finally.");
      } else if (level === "band6") {
        setWritingHint("Band 6: Use present simple passive and a range of linkers. Use pronouns (it, they) to avoid repetition.");
      } else {
        setWritingHint("Band 6.5: Use present simple passive, include more diagram details, and combine sentences using complex structures.");
      }
    } else if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      const example = first.examples?.[0] ? ` Example: ${first.examples[0]}.` : "";
      setWritingHint(`Focus on ${first.type.toUpperCase()}: ${first.message}${example}`);
    } else if (!reflectionComplete) {
      setWritingHint("No language errors remain. Complete all 3 self-reflection points to pass.");
    } else {
      setWritingHint("Well done. All errors corrected and reflection completed.");
    }
  }, [practiceState.p3Submitted, detectedErrors, reflectionComplete, wordCount, level, wordRequirement]);

  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  const renderPractice1 = () => (
    <Card title={level === "band55" ? "Practice 1 · Active to Passive" : "Practice 1 · Passive Voice / Sentence Upgrade"}>
      
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{level === "band55" ? `Stage ${i + 1}` : `Task ${i + 1}`}</p>
            {level !== "band55" && <p className="mt-1 font-medium">{task.instruction}</p>}
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            <input
              value={practiceState.p1Answers[i] || ""}
              onChange={(e) => setPracticeState((prev) => ({ ...prev, p1Answers: { ...prev.p1Answers, [i]: e.target.value } }))}
              className="mt-3 w-full rounded-xl border p-2"
              placeholder="Write your answer here..."
              aria-label={`Answer for task ${i + 1}`}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => checkP1(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
              <button onClick={() => getP1Hint(i)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
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
          
          <div className="rounded-2xl border bg-slate-50 p-5">{renderBand55Paragraph()}</div>
          <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border bg-white p-4">
            {linkerOptions.map((option) => (
              <div key={option} draggable onDragStart={() => setDragItem(option)} role="button" tabIndex={0} className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                {option}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            <button onClick={checkParagraph} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
            <button onClick={resetAllPracticeStates} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Reset</button>
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

    const tasks = level === "band6" ? current.p2Band6 : current.p2Band65;
    return (
      <Card title={level === "band6" ? "Practice 2 · Band 6 Cohesion" : "Practice 2 · Band 6.5 Complex Cohesion"}>
        
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
              {task.type === "fill" ? (
                <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p>
              ) : (
                <div className="mt-2 rounded-lg bg-white p-3"><p className="font-semibold">{task.prompt}</p><p>1. {task.parts[0]}</p><p>2. {task.parts[1]}</p></div>
              )}
              <input
                value={practiceState.p2CohesionAnswers[i] || ""}
                onChange={(e) => setPracticeState((prev) => ({ ...prev, p2CohesionAnswers: { ...prev.p2CohesionAnswers, [i]: e.target.value } }))}
                className="mt-3 w-full rounded-xl border p-2"
                placeholder="Write your answer here..."
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => checkCohesion(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
                <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
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

  const p3Band6GuidingQuestions = {
    bamboo: [
      "What is the purpose of crushing the bamboo strips?",
      "What is separated from the liquid by a filter?",
      "Why are water and amine oxide added?",
      "What final products can be made from the fabric?"
    ],
    sugar: [
      "How long is sugar cane grown before it is harvested?",
      "What is the purpose of crushing the sugar cane?",
      "What is the purpose of the limestone filter?",
      "Which machines are used in the later stages?"
    ],
    noodles: [
      "Where is the flour stored at the beginning?",
      "What ingredients are mixed with flour?",
      "How are noodle discs formed before cooking?",
      "What is added to the cups before they are labelled and sealed?"
    ],
    recycling: [
      "Where are plastic bottles placed at the beginning?",
      "What happens to the bottles after they are sorted?",
      "What are the pellets heated to form?",
      "What examples of final products are shown in the diagram?"
    ]
  };

  const renderAIErrorMarker = (error, index) => {
    const typeColor =
      error.type === "grammar"
        ? "bg-red-100 text-red-700 border-red-200"
        : error.type === "spelling"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : error.type === "lexis"
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : "bg-blue-100 text-blue-700 border-blue-200";

    return (
      <div key={index} className={`rounded-xl border p-3 ${typeColor}`}>
        <p className="text-xs font-bold uppercase tracking-wide">{error.type}</p>
        <p className="mt-1 font-semibold">{error.original || "A language issue was detected."}</p>
      </div>
    );
  };

  const renderPractice3 = () => (
    <Card title="Practice 3 · Timed Writing + AI Self-correction">
      
      {level === "band6" && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Planning questions for the body paragraph</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {p3Band6GuidingQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
      {level === "band65" && (
        <div className="mb-4 rounded-2xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-900">
          <p className="font-semibold">Useful diagram details to consider</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {p3Band65DiagramDetails[processKey].map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
      <textarea
        value={practiceState.p3Writing}
        onChange={(e) => {
          setPracticeState((prev) => ({ ...prev, p3Writing: e.target.value, p3Submitted: false }));
          if (aiFeedback) setAiFeedback(null);
        }}
        className="h-56 w-full rounded-2xl border p-3"
        placeholder="Write your process paragraph here..."
      />
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span>Word count: <strong>{wordCount}</strong></span>
        <span>Target: <strong>{wordTargetRange} words</strong></span>
        {aiChecked && <span>AI check: <strong>{aiErrors.length === 0 ? "No language errors detected" : `${aiErrors.length} issue(s)`}</strong></span>}
      </div>
      {aiChecked && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">Grammar: {aiGrammarCount}</span>
          <span className="rounded-full bg-yellow-50 px-3 py-1 font-semibold text-yellow-700">Lexis: {aiLexisCount}</span>
          <span className="rounded-full bg-purple-50 px-3 py-1 font-semibold text-purple-700">Spelling: {aiSpellingCount}</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">Cohesion: {aiCohesionCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Task: {aiTaskCount}</span>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={getAIFeedback}
          disabled={aiLoading || !practiceState.p3Writing.trim() || wordCount < wordRequirement}
          className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${aiLoading || !practiceState.p3Writing.trim() || wordCount < wordRequirement ? "bg-slate-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {aiLoading ? "Checking..." : "AI Check"}
        </button>
        <button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
      </div>
      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}

      {aiChecked && aiErrors.length > 0 && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <p className="font-bold text-slate-800">AI language error labels</p>
          <p className="mt-1 text-sm text-slate-600">Only error types are shown. No corrections are provided, so revise the paragraph by yourself and run AI Check again.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {aiErrors.map((error, index) => renderAIErrorMarker(error, index))}
          </div>
        </div>
      )}

      {aiChecked && aiErrors.length === 0 && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          No language errors detected by AI. Complete the self-reflection section to pass.
        </div>
      )}

      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-reflection</p>
        <p className="mt-1 text-sm text-slate-600">Write 3 reflection points. You may reflect on: passive forms, basic linkers, advanced linkers, pronoun use, spelling accuracy, or your estimated level.</p>
        <div className="mt-3 space-y-2">
          {practiceState.p3Reflection.map((item, i) => (
            <input key={i} value={item} onChange={(e) => setPracticeState((prev) => { const copy = [...prev.p3Reflection]; copy[i] = e.target.value; return { ...prev, p3Reflection: copy }; })} className="w-full rounded-xl border p-2" placeholder={`Reflection ${i + 1}`} />
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
            <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">IELTS Academic Writing Task 1</p><h1 className="mt-1 text-3xl font-bold">Process Writing Training System</h1><p className="mt-2 text-sm text-slate-600">Four process diagrams · three bands · sentence, cohesion and writing training.</p></div>
            <div className="flex flex-wrap gap-3">
              <select value={processKey} onChange={(e) => handleProcessOrLevelChange(e.target.value, level)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><option value="bamboo">Bamboo fabric</option><option value="sugar">Sugar cane</option><option value="noodles">Instant noodles</option><option value="recycling">Recycling</option></select>
              <select value={level} onChange={(e) => handleProcessOrLevelChange(processKey, e.target.value)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><option value="band55">Band 5.5</option><option value="band6">Band 6</option><option value="band65">Band 6.5</option></select>
            </div>
          </div>
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold">{current.title}</p>
            <p className="text-sm text-slate-600">{current.task}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${totalScore * 10}%` }} />
            </div>
            <p className="mt-2 text-lg font-bold text-blue-700">Score: {totalScore} / 10 · {achievement}</p>
            <p className="text-sm text-slate-500">Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} · Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} · Practice 3: {earned.p3 ? "+5 earned" : "5 pts"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm"><h2 className="mb-3 text-lg font-bold">Process Diagram</h2><img src={current.image} alt={current.title} className="w-full rounded-xl border object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400?text=Image+Not+Found"; }} /></div>
          <div className="space-y-4"><div className="flex flex-wrap gap-2" role="tablist"><Tab value="practice1" label="Practice 1" activePractice={activePractice} onSelect={setActivePractice} /><Tab value="practice2" label="Practice 2" activePractice={activePractice} onSelect={setActivePractice} /><Tab value="practice3" label="Practice 3" activePractice={activePractice} onSelect={setActivePractice} /></div>{activePractice === "practice1" && renderPractice1()}{activePractice === "practice2" && renderPractice2()}{activePractice === "practice3" && renderPractice3()}</div>
        </div>
      </div>
    </div>
  );
}
