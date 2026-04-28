"use client";

import { useMemo, useState, useCallback, useEffect, ReactNode } from "react";

// =====================
// 1. HELPERS
// =====================

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev: T) => {
          const value = typeof valueOrUpdater === "function" ? (valueOrUpdater as (prev: T) => T)(prev) : valueOrUpdater;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
          return value;
        });
      } catch {
        // Silent fail
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

function normalize(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/[\-–]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(user: string, expected: string, tolerance = 0.88): boolean {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (!userNorm || !expectedNorm) return false;
  if (userNorm === expectedNorm) return true;

  const userWords = userNorm.split(" ");
  const expectedWords = expectedNorm.split(" ");
  const matchedWords = expectedWords.filter((word) => userWords.includes(word)).length;
  return matchedWords / expectedWords.length >= tolerance;
}

function isAnswerCorrect(user: string, expected: string, level: string): boolean {
  if (level === "band65") return fuzzyMatch(user, expected, 0.82);
  return normalize(user) === normalize(expected);
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

interface ErrorRule {
  id: string;
  type: "grammar" | "lexis" | "spelling";
  pattern: RegExp;
  message: string;
  examples?: string[];
}

function createErrorRules(processKey: string): ErrorRule[] {
  const baseRules: ErrorRule[] = [
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
      pattern: /\b(fibres|bottles|pellets|crystals|plants)\s+is\b/gi,
      message: "Use a plural verb with plural nouns, e.g. fibres are / bottles are.",
      examples: ["fibres are", "plastic bottles are"],
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
      pattern: /botles|bottels/gi,
      message: "Spelling: use 'bottles'.",
      examples: ["bottles"],
    },
    {
      id: "sp2",
      type: "spelling",
      pattern: /recyling|recylcing/gi,
      message: "Spelling: use 'recycling'.",
      examples: ["recycling"],
    },
    {
      id: "sp3",
      type: "spelling",
      pattern: /vegatables|vegetabels/gi,
      message: "Spelling: use 'vegetables'.",
      examples: ["vegetables"],
    },
    {
      id: "sp4",
      type: "spelling",
      pattern: /materail|matrial/gi,
      message: "Spelling: use 'material'.",
      examples: ["material"],
    },
    {
      id: "sp5",
      type: "spelling",
      pattern: /produts|prodcts/gi,
      message: "Spelling: use 'products'.",
      examples: ["products"],
    },
    {
      id: "sp6",
      type: "spelling",
      pattern: /liqued|liqid/gi,
      message: "Spelling: use 'liquid'.",
      examples: ["liquid"],
    },
  ];

  const specific: Record<string, ErrorRule[]> = {
    bamboo: [
      {
        id: "b1",
        type: "lexis",
        pattern: /\bfabric\s+(is\s+)?manufacture\b/gi,
        message: "Use 'is manufactured' or 'is made', not 'manufacture'.",
        examples: ["fabric is manufactured"],
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
    ],
  };

  return [...baseRules, ...(specific[processKey] || [])];
}

function fixP2Band55Data<T extends Record<string, unknown>>(rawData: T): T {
  const copy = JSON.parse(JSON.stringify(rawData)) as T;
  Object.keys(copy).forEach((key) => {
    const item = copy[key] as { p2Band55?: { answers: string[] } };
    if (!item.p2Band55) return;
    while (item.p2Band55.answers.length < 8) item.p2Band55.answers.push("");
    if (item.p2Band55.answers.length > 8) item.p2Band55.answers = item.p2Band55.answers.slice(0, 8);
  });
  return copy;
}

// =====================
// 2. DATA
// =====================

interface Step {
  active: string;
  passive: string;
  prompt6: string;
}

interface Band65Task {
  prompt: string;
  task: string;
  answer: string;
}

interface P2Band55 {
  text: [number, string][];
  answers: string[];
}

interface P2Band6Task {
  type: "fill";
  sentence: string;
  answer: string;
}

interface P2Band65Task {
  prompt: string;
  parts: string[];
  answer: string;
}

interface ProcessData {
  title: string;
  task: string;
  image: string;
  steps: Step[];
  band65: Band65Task[];
  p2Band55: P2Band55;
  p2Band6: P2Band6Task[];
  p2Band65: P2Band65Task[];
}

const rawProcessData: Record<string, ProcessData> = {
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
      { prompt: "Bamboo plants are grown in spring.", task: "Use a more formal verb.", answer: "Bamboo plants are cultivated in spring." },
      { prompt: "The strips are crushed.", task: "Add the result shown in the diagram.", answer: "The strips are crushed, producing liquid pulp." },
      { prompt: "Long fibres are separated from the liquid.", task: "Use a more formal verb.", answer: "Long fibres are extracted from the liquid." },
      { prompt: "The fibres are softened.", task: "Add detail from the diagram.", answer: "The fibres are softened by adding water and amine oxide." },
      { prompt: "Yarn is woven to make fabric.", task: "Use a more natural result structure.", answer: "Yarn is woven into fabric." },
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
      { type: "fill", sentence: "N______, bamboo plants are harvested in autumn.", answer: "Next" },
      { type: "fill", sentence: "A______ that, bamboo plants are cut into strips.", answer: "After" },
      { type: "fill", sentence: "S__________, the fibres are spun to make yarn.", answer: "Subsequently" },
      { type: "fill", sentence: "Combine using before doing.", answer: "They are cut into strips before being crushed to make liquid pulp." },
      { type: "fill", sentence: "Combine using after doing.", answer: "They are spun to make yarn after being softened." },
    ],
    p2Band65: [
      { prompt: "Combine using followed by + noun phrase.", parts: ["The strips are crushed, producing liquid pulp.", "Long fibres are extracted from the liquid."], answer: "The strips are crushed, producing liquid pulp, followed by the extraction of long fibres from the liquid." },
      { prompt: "Combine using after which.", parts: ["The fibres are softened by adding water and amine oxide.", "They are spun into yarn."], answer: "The fibres are softened by adding water and amine oxide, after which they are spun into yarn." },
      { prompt: "Combine using before doing.", parts: ["Yarn is woven into fabric.", "Fabric is used to make clothes."], answer: "Yarn is woven into fabric before being used to make clothes." },
    ],
  },

  sugar: {
    title: "Sugar Cane",
    task: "The diagram below shows how sugar is produced from sugar cane.",
    image: "https://daxue-oss.koocdn.com/upload/ti/sardine/2521000-2522000/2521817/3395c3236ee34b9089e15f2ce4dfc9a9.png",
    steps: [
      { active: "Farmers grow sugar cane for 12-18 months.", passive: "Sugar cane is grown for 12-18 months.", prompt6: "sugar cane / grow / 12-18 months" },
      { active: "Workers or machines harvest the sugar cane.", passive: "The sugar cane is harvested by workers or machines.", prompt6: "sugar cane / harvest / workers or machines" },
      { active: "Machines crush the sugar cane to make juice.", passive: "Sugar cane is crushed to make juice.", prompt6: "sugar cane / crush / juice" },
      { active: "A limestone filter purifies the juice.", passive: "The juice is purified by a limestone filter.", prompt6: "juice / purify / limestone filter" },
      { active: "An evaporator turns the juice into syrup.", passive: "The juice is turned into syrup by an evaporator.", prompt6: "juice / turn / syrup / evaporator" },
      { active: "A centrifuge separates sugar crystals from syrup.", passive: "Sugar crystals are separated from syrup by a centrifuge.", prompt6: "sugar crystals / separate / syrup / centrifuge" },
      { active: "A machine dries and cools the sugar.", passive: "The sugar is dried and cooled by a machine.", prompt6: "sugar / dry and cool / machine" },
    ],
    band65: [
      { prompt: "Sugar cane is grown for 12-18 months.", task: "Use a more formal verb.", answer: "Sugar cane is cultivated for 12-18 months." },
      { prompt: "The sugar cane is crushed to make juice.", task: "Use a more formal verb.", answer: "The sugar cane is crushed to produce juice." },
      { prompt: "The juice is purified.", task: "Add detail from the diagram.", answer: "The juice is purified using a limestone filter." },
      { prompt: "The juice is heated.", task: "Add the result shown in the diagram.", answer: "The juice is heated, forming syrup." },
      { prompt: "Sugar crystals are separated from the syrup.", task: "Use a more formal verb.", answer: "Sugar crystals are extracted from the syrup." },
    ],
    p2Band55: {
      text: [
        [0, " sugar cane is grown for 12-18 months. The sugar cane is "],
        [1, " harvested by workers or machines. "],
        [2, " that, sugar cane is crushed to make juice. "],
        [3, " is to purify the juice by a limestone filter. "],
        [4, ", the juice is turned into syrup by an evaporator. In the "],
        [5, " stage, sugar crystals are separated from syrup by a centrifuge. "],
        [6, ", the sugar is dried and cooled by a machine."],
        [7, ""],
      ],
      answers: ["first", "then", "after", "the following stage", "next", "next", "finally", ""],
    },
    p2Band6: [
      { type: "fill", sentence: "N______, the sugar cane is harvested by workers or machines.", answer: "Next" },
      { type: "fill", sentence: "A______ that, sugar cane is crushed to make juice.", answer: "After" },
      { type: "fill", sentence: "S__________, sugar crystals are separated from syrup by a centrifuge.", answer: "Subsequently" },
      { type: "fill", sentence: "Combine using before doing.", answer: "It is harvested before being crushed to make juice." },
      { type: "fill", sentence: "Combine using after doing.", answer: "It is turned into syrup by an evaporator after being purified by a limestone filter." },
    ],
    p2Band65: [
      { prompt: "Combine using followed by + noun phrase.", parts: ["The sugar cane is crushed to produce juice.", "The juice is purified using a limestone filter."], answer: "The sugar cane is crushed to produce juice, followed by the purification of the juice using a limestone filter." },
      { prompt: "Combine using after which.", parts: ["The juice is heated, forming syrup.", "Sugar crystals are extracted from the syrup."], answer: "The juice is heated, forming syrup, after which sugar crystals are extracted from the syrup." },
      { prompt: "Combine using after doing.", parts: ["Sugar crystals are extracted from the syrup.", "The sugar is dried and cooled."], answer: "The sugar is dried and cooled after being extracted from the syrup." },
    ],
  },

  noodles: {
    title: "Instant Noodles",
    task: "The diagram below shows the manufacturing process for instant noodles.",
    image: "https://daxue-oss.koocdn.com/upload/ti/sardine/2493000-2494000/2493115/259d8b9f612e40819d37e0fb928b572f.png",
    steps: [
      { active: "A truck transports flour from storage silos.", passive: "Flour is transported from storage silos by a truck.", prompt6: "flour / transport / storage silos / truck" },
      { active: "Workers mix flour with water and oil in a mixer.", passive: "Flour is mixed with water and oil in a mixer.", prompt6: "flour / mix / water and oil / mixer" },
      { active: "Rollers press the dough into sheets.", passive: "The dough is pressed into sheets by rollers.", prompt6: "dough / press / sheets / rollers" },
      { active: "Machines cut the dough sheets into strips.", passive: "The dough sheets are cut into strips.", prompt6: "dough sheets / cut / strips" },
      { active: "Machines make the dough strips into noodle discs.", passive: "The dough strips are made into noodle discs.", prompt6: "dough strips / make / noodle discs" },
      { active: "Machines cook the noodle discs in oil and dry them.", passive: "The noodle discs are cooked in oil and then dried.", prompt6: "noodle discs / cook / oil / dry" },
      { active: "Machines put noodle discs, vegetables and spices into cups.", passive: "The noodle discs, vegetables and spices are put into cups.", prompt6: "noodle discs vegetables spices / put / cups" },
      { active: "Machines label and seal the cups.", passive: "The cups are labelled and sealed.", prompt6: "cups / label and seal" },
    ],
    band65: [
      { prompt: "Flour is put in storage silos.", task: "Use a more natural verb.", answer: "Flour is placed in storage silos." },
      { prompt: "The dough strips are made into noodle discs.", task: "Use a more precise verb phrase.", answer: "The dough strips are formed into noodle discs." },
      { prompt: "The noodle discs are cooked.", task: "Add detail from the diagram.", answer: "The noodle discs are cooked in oil." },
      { prompt: "Vegetables and spices are put into cups.", task: "Use a more natural verb.", answer: "Vegetables and spices are added to the cups." },
      { prompt: "The cups are sealed.", task: "Add another action shown in the diagram.", answer: "The cups are labelled and sealed." },
    ],
    p2Band55: {
      text: [
        [0, " flour is transported from storage silos by a truck. Flour is "],
        [1, " mixed with water and oil in a mixer. "],
        [2, " that, the dough is pressed into sheets by rollers. "],
        [3, " is to cut the dough sheets into strips. "],
        [4, ", the dough strips are made into noodle discs. In the "],
        [5, " stage, the noodle discs are cooked in oil and then dried. The noodle discs, vegetables and spices are "],
        [6, " put into cups. "],
        [7, ", the cups are labelled and sealed."],
      ],
      answers: ["first", "then", "after", "the following stage", "next", "next", "then", "finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "N______, flour is mixed with water and oil in a mixer.", answer: "Next" },
      { type: "fill", sentence: "A______ that, the dough is pressed into sheets by rollers.", answer: "After" },
      { type: "fill", sentence: "S__________, the noodle discs are cooked in oil and then dried.", answer: "Subsequently" },
      { type: "fill", sentence: "Combine using after doing.", answer: "The dough is pressed into sheets by rollers after being mixed with water and oil in a mixer." },
      { type: "fill", sentence: "Combine using before doing.", answer: "The noodle discs are cooked in oil before being dried." },
    ],
    p2Band65: [
      { prompt: "Combine using followed by + noun phrase.", parts: ["The dough strips are formed into noodle discs.", "The noodle discs are cooked in oil."], answer: "The dough strips are formed into noodle discs, followed by the cooking of the noodle discs in oil." },
      { prompt: "Combine using after which.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil, after which they are dried." },
      { prompt: "Combine using after doing.", parts: ["Vegetables and spices are added to the cups.", "The cups are labelled and sealed."], answer: "The cups are labelled and sealed after vegetables and spices are added to them." },
    ],
  },

  recycling: {
    title: "Plastic Bottle Recycling",
    task: "The diagram below shows the process for recycling plastic bottles.",
    image: "https://images.writing9.com/646839d3f987923ffa686b743b1950f9.png",
    steps: [
      { active: "People put plastic bottles in recycling bins.", passive: "Plastic bottles are placed in recycling bins.", prompt6: "plastic bottles / place / recycling bins" },
      { active: "A truck collects and transports plastic bottles.", passive: "Plastic bottles are collected and transported by a truck.", prompt6: "plastic bottles / collect and transport / truck" },
      { active: "Workers sort plastic bottles in a recycling centre.", passive: "Plastic bottles are sorted in a recycling centre.", prompt6: "plastic bottles / sort / recycling centre" },
      { active: "Machines compress plastic bottles into blocks.", passive: "Plastic bottles are compressed into blocks.", prompt6: "plastic bottles / compress / blocks" },
      { active: "Machines crush the blocks and wash the pieces.", passive: "The blocks are crushed and the pieces are washed.", prompt6: "blocks / crush / pieces / wash" },
      { active: "Machines produce plastic pellets.", passive: "Plastic pellets are produced.", prompt6: "plastic pellets / produce" },
      { active: "People heat the pellets to form raw material.", passive: "The pellets are heated to form raw material.", prompt6: "pellets / heat / raw material" },
      { active: "People pack the raw material.", passive: "The raw material is packed.", prompt6: "raw material / pack" },
      { active: "Factories produce end products.", passive: "End products are produced.", prompt6: "end products / produce" },
    ],
    band65: [
      { prompt: "Plastic bottles are put in recycling bins.", task: "Use a more natural verb.", answer: "Plastic bottles are placed in recycling bins." },
      { prompt: "Plastic bottles are collected.", task: "Add detail from the diagram.", answer: "Plastic bottles are collected by a truck." },
      { prompt: "Plastic bottles are compressed.", task: "Add the result shown in the diagram.", answer: "Plastic bottles are compressed into blocks." },
      { prompt: "The blocks are crushed.", task: "Add the result shown in the diagram.", answer: "The blocks are crushed, producing smaller pieces." },
      { prompt: "End products are produced.", task: "Use a more formal verb.", answer: "End products are manufactured." },
    ],
    p2Band55: {
      text: [
        [0, " plastic bottles are placed in recycling bins. The plastic bottles are "],
        [1, " collected and transported by a truck. "],
        [2, " is to sort the plastic bottles in a recycling centre. "],
        [3, ", the plastic bottles are compressed into blocks. "],
        [4, ", the blocks are crushed and the pieces are washed. In the "],
        [5, " stage, plastic pellets are produced. "],
        [6, ", the pellets are heated to form raw material. "],
        [7, ", end products are produced."],
      ],
      answers: ["first", "then", "the following stage", "next", "then", "next", "then", "finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "N______, plastic bottles are collected and transported by a truck.", answer: "Next" },
      { type: "fill", sentence: "A______ that, plastic bottles are sorted in a recycling centre.", answer: "After" },
      { type: "fill", sentence: "S__________, plastic pellets are produced.", answer: "Subsequently" },
      { type: "fill", sentence: "Combine using before doing.", answer: "They are sorted in a recycling centre before being compressed into blocks." },
      { type: "fill", sentence: "Combine using after doing.", answer: "They are sorted in a recycling centre after being collected and transported by a truck." },
    ],
    p2Band65: [
      { prompt: "Combine using followed by + noun phrase.", parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."], answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks." },
      { prompt: "Combine using after which.", parts: ["The blocks are crushed, producing smaller pieces.", "The pieces are washed."], answer: "The blocks are crushed, producing smaller pieces, after which the pieces are washed." },
      { prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." },
    ],
  },
};

// =====================
// UI COMPONENTS
// =====================

interface CardProps {
  title: string;
  children: ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  label: string;
  activePractice: string;
  setActivePractice: (value: string) => void;
}

function Tab({ value, label, activePractice, setActivePractice }: TabProps) {
  return (
    <button
      onClick={() => setActivePractice(value)}
      role="tab"
      aria-selected={activePractice === value}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
    >
      {label}
    </button>
  );
}

// =====================
// 3. MAIN COMPONENT
// =====================

interface EarnedScores {
  p1: boolean;
  p2: boolean;
  p3: boolean;
}

interface ScoreMap {
  [key: string]: EarnedScores;
}

interface CohesionTask {
  type?: string;
  sentence?: string;
  prompt?: string;
  parts?: string[];
  answer: string;
}

interface AIFeedbackData {
  estimatedBand?: string;
  summary?: string;
  errors?: Array<{
    type: string;
    original: string;
    suggestion: string;
    explanation: string;
  }>;
  strengths?: string[];
  nextSteps?: string[];
}

export default function IELTSProcessTrainerFullSystem() {
  const processData = useMemo(() => fixP2Band55Data(rawProcessData), []);

  const [processKey, setProcessKey] = useState<string>("bamboo");
  const [level, setLevel] = useState<string>("band55");
  const [activePractice, setActivePractice] = useState<string>("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage<ScoreMap>("ielts-process-scores", {});
  const [practiceState, setPracticeState] = useState<PracticeState>(initialPracticeState);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [p1Hint, setP1Hint] = useState<string>("");
  const [p2Hint, setP2Hint] = useState<string>("");
  const [writingHint, setWritingHint] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackData | null>(null);

  const current = processData[processKey];
  const steps = current.steps;
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore <= 3 ? "Beginner" : totalScore <= 7 ? "Developing" : "Advanced";

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint("");
    setP2Hint("");
    setWritingHint("");
    setDragItem(null);
  }, []);

  const handleProcessOrLevelChange = useCallback(
    (newProcess: string | null, newLevel: string | null) => {
      if (newProcess !== null) setProcessKey(newProcess);
      if (newLevel !== null) setLevel(newLevel);
      resetAllPracticeStates();
    },
    [resetAllPracticeStates]
  );

  const award = useCallback(
    (practice: "p1" | "p2" | "p3") => {
      setScoreMap((prev) => {
        const currentEarned = prev[scoreKey] || { p1: false, p2: false, p3: false };
        if (currentEarned[practice]) return prev;
        return { ...prev, [scoreKey]: { ...currentEarned, [practice]: true } };
      });
    },
    [scoreKey, setScoreMap]
  );

  // =====================
  // PRACTICE 1
  // =====================

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return steps.map((s: Step) => ({ prompt: s.active, answer: s.passive, instruction: "Rewrite the active sentence in the passive voice." }));
    }
    if (level === "band6") {
      return steps.map((s: Step) => ({ prompt: s.prompt6, answer: s.passive, instruction: "Use the words and the diagram to write a complete passive sentence." }));
    }
    return current.band65.map((s: Band65Task) => ({ prompt: s.prompt, answer: s.answer, instruction: s.task }));
  }, [level, processKey, current, steps]);

  const checkP1 = useCallback(
    (index: number) => {
      const updatedAnswers = { ...practiceState.p1Answers };
      const userAnswer = updatedAnswers[index] || "";
      const ok = isAnswerCorrect(userAnswer, practice1Tasks[index].answer, level);
      const updatedFeedback = { ...practiceState.p1Feedback, [index]: ok };

      setPracticeState((prev) => ({ ...prev, p1Feedback: updatedFeedback }));

      const allCorrect = practice1Tasks.every((task, i) => isAnswerCorrect(updatedAnswers[i] || "", task.answer, level));
      if (allCorrect) award("p1");
    },
    [practiceState.p1Answers, practiceState.p1Feedback, practice1Tasks, level, award]
  );

  const getP1Hint = useCallback(
    (index: number) => {
      if (level === "band55") setP1Hint(`Task ${index + 1}: Move the object to the subject position and use be + past participle.`);
      else if (level === "band6") setP1Hint(`Task ${index + 1}: Use be + past participle. Check the diagram for prepositions and details.`);
      else setP1Hint(`Task ${index + 1}: ${practice1Tasks[index].instruction}`);
    },
    [level, practice1Tasks]
  );

  // =====================
  // PRACTICE 2
  // =====================

  const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];

  const dropToBlank = useCallback(
    (index: number) => {
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

  const getCohesionTasks = useCallback((): CohesionTask[] => {
    if (level === "band6") {
      return current.p2Band6.map((t: P2Band6Task) => ({ ...t, answer: t.answer }));
    }
    return current.p2Band65.map((t: P2Band65Task) => ({ ...t, answer: t.answer }));
  }, [level, current]);

  const checkCohesion = useCallback(
    (index: number) => {
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

  const renderBlank = (index: number) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        role="textbox"
        aria-label={`Blank ${index + 1} for linker word`}
        aria-readonly={true}
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

  interface DetectedError extends ErrorRule {
    match: string;
    index: number;
  }

  const detectedErrors = useMemo((): DetectedError[] => {
    if (!practiceState.p3Submitted) return [];
    const found: DetectedError[] = [];
    errorRules.forEach((rule) => {
      const matches = practiceState.p3Writing.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          found.push({ ...rule, match: match[0], index: match.index });
        }
      }
    });
    return found.sort((a, b) => a.index - b.index);
  }, [practiceState.p3Submitted, practiceState.p3Writing, errorRules]);

  const highlightedWriting = useMemo((): React.ReactNode => {
    if (!practiceState.p3Submitted || detectedErrors.length === 0) return practiceState.p3Writing;
    const output: (string | React.ReactElement)[] = [];
    let cursor = 0;
    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(practiceState.p3Writing.slice(cursor, error.index));
      output.push(
        <strong
          key={`${error.id}-${index}`}
          className={`rounded px-1 font-bold ${
            error.type === "grammar" ? "bg-red-100 text-red-700" : 
            error.type === "spelling" ? "bg-purple-100 text-purple-700" : 
            "bg-yellow-100 text-yellow-700"
          }`}
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

  const wordCount = practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(" ").filter(Boolean).length : 0;
  const wordRequirement = level === "band55" ? 80 : level === "band6" ? 100 : 120;
  const grammarErrorCount = detectedErrors.filter((e) => e.type === "grammar").length;
  const lexisErrorCount = detectedErrors.filter((e) => e.type === "lexis").length;
  const spellingErrorCount = detectedErrors.filter((e) => e.type === "spelling").length;
  const reflectionComplete = practiceState.p3Reflection.every((item) => item.trim().length > 0);
  const canSubmitP3 = wordCount >= wordRequirement;
  const p3Pass = practiceState.p3Submitted && detectedErrors.length === 0 && reflectionComplete;

  const submitWriting = useCallback(() => {
    if (!canSubmitP3) {
      setWritingHint(`Please write at least ${wordRequirement} words. Current: ${wordCount}.`);
      return;
    }
    setPracticeState((prev) => ({ ...prev, p3Submitted: true }));
  }, [canSubmitP3, wordCount, wordRequirement]);

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      if (level === "band55") {
        setWritingHint("Band 5.5: Use present simple passive to describe the process. Add basic linkers such as First, Then, Finally.");
      } else if (level === "band6") {
        setWritingHint("Band 6: Use present simple passive and a range of linkers. Use pronouns (it, they) to avoid repetition.");
      } else {
        setWritingHint("Band 6.5: Use present simple passive, include more diagram details, and combine sentences using complex structures such as after which, followed by, and before/after being done.");
      }
    } else if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      const example = first.examples?.[0] ? ` Example: ${first.examples[0]}.` : "";
      setWritingHint(`Focus on ${first.type.toUpperCase()}: ${first.message}${example}`);
    }
  }, [practiceState.p3Submitted, detectedErrors, reflectionComplete, wordCount, level]);

  const getAIFeedback = useCallback(async () => {
    if (!practiceState.p3Writing.trim() || aiLoading) return;

    setAiLoading(true);
    setAiFeedback(null);

    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          writing: practiceState.p3Writing,
          level: level,
          processTitle: current.title,
          processDescription: current.task,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI feedback");
      }

      const data = await response.json();
      setAiFeedback(data);
    } catch (error) {
      console.error("AI Feedback Error:", error);
      setAiFeedback({
        summary: "Failed to generate AI feedback. Please try again.",
        errors: [],
        strengths: [],
        nextSteps: [],
      });
    } finally {
      setAiLoading(false);
    }
  }, [practiceState.p3Writing, level, current, aiLoading]);

  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderPractice1 = () => (
    <Card title="Practice 1 - Passive Voice / Sentence Upgrade">
      <p className="mb-4 text-sm text-slate-600">5.5: active to passive - 6: diagram words to passive sentence - 6.5: synonym, detail and complex sentence.</p>
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
            <p className="mt-1 font-medium">{task.instruction}</p>
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
        <Card title="Practice 2 - Controlled Paragraph Cohesion">
          <p className="mb-4 text-sm text-slate-600">Drag the correct linker into each blank. This task trains position, fixed expressions and stage language.</p>
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

    const tasks = getCohesionTasks();
    return (
      <Card title={level === "band6" ? "Practice 2 - Band 6 Cohesion" : "Practice 2 - Band 6.5 Complex Cohesion"}>
        <p className="mb-4 text-sm text-slate-600">{level === "band6" ? "First-letter linker tasks + before/after being done." : "Use followed by + noun phrase, before/after doing, and after which."}</p>
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
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

  const renderPractice3 = () => (
    <Card title="Practice 3 - Timed Writing + Self-correction">
      <p className="mb-4 text-sm text-slate-600">Write a body paragraph. Band 5.5 requires 80+ words, Band 6 requires 100+ words, and Band 6.5 requires 120+ words. Submit, correct highlighted errors, and complete three reflection points before passing.</p>
      <textarea
        value={practiceState.p3Writing}
        onChange={(e) => setPracticeState((prev) => ({ ...prev, p3Writing: e.target.value, p3Submitted: false }))}
        className="h-56 w-full rounded-2xl border p-3"
        placeholder="Write your process paragraph here..."
      />
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span>Word count: <strong>{wordCount}</strong></span>
        <span>Target: <strong>{wordRequirement}+ words</strong></span>
        {practiceState.p3Submitted && (
          <>
            <span>Grammar errors: <strong>{grammarErrorCount}</strong></span>
            <span>Lexical errors: <strong>{lexisErrorCount}</strong></span>
            <span>Spelling errors: <strong>{spellingErrorCount}</strong></span>
          </>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={submitWriting} disabled={!canSubmitP3} className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${canSubmitP3 ? "bg-blue-600" : "bg-slate-400 cursor-not-allowed"}`}>Submit</button>
        <button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
        <button
          onClick={getAIFeedback}
          disabled={aiLoading || !practiceState.p3Writing.trim()}
          className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${aiLoading || !practiceState.p3Writing.trim() ? "bg-slate-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {aiLoading ? "Checking..." : "AI Feedback"}
        </button>
      </div>
      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}
      
      {aiFeedback && (
        <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold">AI Feedback</p>
            {aiFeedback.estimatedBand && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700">
                Estimated Band: {aiFeedback.estimatedBand}
              </span>
            )}
          </div>

          {aiFeedback.summary && <p className="mt-3 leading-6">{aiFeedback.summary}</p>}

          {Array.isArray(aiFeedback.errors) && aiFeedback.errors.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Errors and suggestions</p>
              <div className="mt-2 space-y-2">
                {aiFeedback.errors.map((error, index) => (
                  <div key={index} className="rounded-xl border bg-white p-3">
                    <p><strong>Type:</strong> {error.type}</p>
                    <p><strong>Original:</strong> {error.original}</p>
                    <p><strong>Suggestion:</strong> {error.suggestion}</p>
                    <p><strong>Why:</strong> {error.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(aiFeedback.strengths) && aiFeedback.strengths.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Strengths</p>
              <ul className="mt-2 list-disc pl-5">
                {aiFeedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}

          {Array.isArray(aiFeedback.nextSteps) && aiFeedback.nextSteps.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Next steps</p>
              <ul className="mt-2 list-disc pl-5">
                {aiFeedback.nextSteps.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {practiceState.p3Submitted && <div className="mt-4 rounded-2xl border bg-slate-50 p-4 whitespace-pre-wrap leading-7">{highlightedWriting || "No writing submitted."}</div>}
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <p className="font-semibold">Self-reflection</p>
        <p className="mt-1 text-sm text-slate-600">Write 3 reflection points. You may reflect on: passive forms, basic linkers, advanced linkers, pronoun use, spelling accuracy, or your estimated level.</p>
        <div className="mt-3 space-y-2">
          {practiceState.p3Reflection.map((item, i) => (
            <input 
              key={i} 
              value={item} 
              onChange={(e) => setPracticeState((prev) => { 
                const copy = [...prev.p3Reflection]; 
                copy[i] = e.target.value; 
                return { ...prev, p3Reflection: copy }; 
              })} 
              className="w-full rounded-xl border p-2" 
              placeholder={`Reflection ${i + 1}`} 
            />
          ))}
        </div>
      </div>
      {p3Pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS - +5 points</div>}
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
              <p className="mt-2 text-sm text-slate-600">Four process diagrams - three bands - sentence, cohesion and writing training.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={processKey} onChange={(e) => handleProcessOrLevelChange(e.target.value, null)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
                <option value="bamboo">Bamboo fabric</option>
                <option value="sugar">Sugar cane</option>
                <option value="noodles">Instant noodles</option>
                <option value="recycling">Recycling</option>
              </select>
              <select value={level} onChange={(e) => handleProcessOrLevelChange(null, e.target.value)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
                <option value="band55">Band 5.5</option>
                <option value="band6">Band 6</option>
                <option value="band65">Band 6.5</option>
              </select>
            </div>
          </div>
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold">{current.title}</p>
            <p className="text-sm text-slate-600">{current.task}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${totalScore * 10}%` }} />
            </div>
            <p className="mt-2 text-lg font-bold text-blue-700">Score: {totalScore} / 10 - {achievement}</p>
            <p className="text-sm text-slate-500">P1: {earned.p1 ? "+2 earned" : "2pts"} - P2: {earned.p2 ? "+3 earned" : "3pts"} - P3: {earned.p3 ? "+5 earned" : "5pts"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Process Diagram</h2>
            <img src={current.image} alt={current.title} className="w-full rounded-xl border object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }} />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Tab value="practice1" label="Practice 1" activePractice={activePractice} setActivePractice={setActivePractice} />
              <Tab value="practice2" label="Practice 2" activePractice={activePractice} setActivePractice={setActivePractice} />
              <Tab value="practice3" label="Practice 3" activePractice={activePractice} setActivePractice={setActivePractice} />
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
