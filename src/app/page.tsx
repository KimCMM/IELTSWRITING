"use client";

import { useMemo, useState, useCallback, useEffect } from "react";

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

const initialPracticeState = {
  p1Answers: {} as Record<number, string>,
  p1Feedback: {} as Record<number, boolean>,
  p2ParagraphAnswers: Array(8).fill(""),
  p2ParagraphFeedback: [] as boolean[],
  p2CohesionAnswers: {} as Record<number, string>,
  p2CohesionFeedback: {} as Record<number, boolean>,
  p3Writing: "",
  p3Submitted: false,
  p3Reflection: ["", "", ""],
};

const fixP2Band55Data = (rawData: typeof rawProcessData) => {
  const copy = JSON.parse(JSON.stringify(rawData));

  Object.keys(copy).forEach((key) => {
    const item = copy[key];

    if (!item.p2Band55) return;

    while (item.p2Band55.answers.length < 8) {
      item.p2Band55.answers.push("");
    }

    if (item.p2Band55.answers.length > 8) {
      item.p2Band55.answers = item.p2Band55.answers.slice(0, 8);
    }
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
      { type: "fill", sentence: "F______, bamboo plants are planted in spring.", answer: "First" },
      { type: "fill", sentence: "N______, bamboo plants are harvested in autumn.", answer: "Next" },
      { type: "fill", sentence: "A______ that, bamboo plants are cut into strips.", answer: "After" },
      { type: "fill", sentence: "S__________, the strips are crushed to make liquid pulp.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The strips are crushed to make liquid pulp.", "Long fibres are separated from the liquid by a filter."], answer: "Long fibres are separated from the liquid by a filter after being crushed to make liquid pulp." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The fibres are softened.", "They are spun to make yarn."], answer: "The fibres are softened before being spun to make yarn." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["Yarn is woven to make fabric.", "It is used to make clothes."], answer: "Yarn is woven to make fabric before being used to make clothes." },
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
      { type: "fill", sentence: "F______, sugar cane is grown for 12-18 months.", answer: "First" },
      { type: "fill", sentence: "N______, the sugar cane is harvested by workers or machines.", answer: "Next" },
      { type: "fill", sentence: "A______ that, sugar cane is crushed to make juice.", answer: "After" },
      { type: "fill", sentence: "S__________, the juice is purified by a limestone filter.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The juice is purified by a limestone filter.", "It is turned into syrup by an evaporator."], answer: "The juice is turned into syrup by an evaporator after being purified by a limestone filter." },
      { type: "combine", prompt: "Combine using after doing.", parts: ["Sugar crystals are separated from syrup by a centrifuge.", "The sugar is dried and cooled by a machine."], answer: "The sugar is dried and cooled by a machine after being separated from syrup by a centrifuge." },
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
      { type: "fill", sentence: "F______, flour is transported from storage silos by a truck.", answer: "First" },
      { type: "fill", sentence: "N______, flour is mixed with water and oil in a mixer.", answer: "Next" },
      { type: "fill", sentence: "A______ that, the dough is pressed into sheets by rollers.", answer: "After" },
      { type: "fill", sentence: "S__________, the dough sheets are cut into strips.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The dough sheets are cut into strips.", "The dough strips are made into noodle discs."], answer: "The dough strips are made into noodle discs after being cut into strips." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil before being dried." },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The noodle discs, vegetables and spices are put into cups.", "The cups are labelled and sealed."], answer: "The cups are labelled and sealed after the noodle discs, vegetables and spices are put into them." },
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
      { type: "fill", sentence: "F______, plastic bottles are placed in recycling bins.", answer: "First" },
      { type: "fill", sentence: "N______, plastic bottles are collected and transported by a truck.", answer: "Next" },
      { type: "fill", sentence: "A______ that, plastic bottles are sorted in a recycling centre.", answer: "After" },
      { type: "fill", sentence: "S__________, plastic bottles are compressed into blocks.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["Plastic bottles are compressed into blocks.", "The blocks are crushed and the pieces are washed."], answer: "The blocks are crushed and the pieces are washed after being compressed into blocks." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The raw material is packed.", "End products are produced."], answer: "The raw material is packed before end products are produced." },
    ],
    p2Band65: [
      { prompt: "Combine using followed by + noun phrase.", parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."], answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks." },
      { prompt: "Combine using after which.", parts: ["The blocks are crushed, producing smaller pieces.", "The pieces are washed."], answer: "The blocks are crushed, producing smaller pieces, after which the pieces are washed." },
      { prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." },
    ],
  },
} as const;

type ProcessKey = keyof typeof rawProcessData;
type LevelKey = "band55" | "band6" | "band65";

// =====================
// 3. MAIN COMPONENT
// =====================

export default function IELTSProcessTrainerFullSystem() {
  const processData = useMemo(() => fixP2Band55Data(rawProcessData), []);

  const [processKey, setProcessKey] = useState<ProcessKey>("bamboo");
  const [level, setLevel] = useState<LevelKey>("band55");
  const [activePractice, setActivePractice] = useState<"practice1" | "practice2" | "practice3">("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage<Record<string, { p1: boolean; p2: boolean; p3: boolean }>>("ielts-process-scores-v2", {});
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [p1Hint, setP1Hint] = useState("");
  const [p2Hint, setP2Hint] = useState("");
  const [writingHint, setWritingHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    estimatedBand?: string;
    summary?: string;
    errors: Array<{ type: string; original?: string; suggestion?: string; explanation?: string }>;
    strengths?: string[];
    nextSteps?: string[];
  } | null>(null);

  const current = processData[processKey];

  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore <= 3 ? "Beginner" : totalScore <= 7 ? "Developing" : "Advanced";

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint("");
    setP2Hint("");
    setWritingHint("");
    setAiFeedback(null);
    setAiLoading(false);
    setDragItem(null);
  }, []);

  const handleProcessOrLevelChange = useCallback(
    (newProcess: ProcessKey, newLevel: LevelKey) => {
      setProcessKey(newProcess);
      setLevel(newLevel);
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
      return current.steps.map((s: typeof current.steps[0]) => ({ prompt: s.active, answer: s.passive, instruction: "Rewrite the active sentence in the passive voice." }));
    }
    if (level === "band6") {
      return current.steps.map((s: typeof current.steps[0]) => ({ prompt: s.prompt6, answer: s.passive, instruction: "Use the words and the diagram to write a complete passive sentence." }));
    }
    return current.band65.map((s: typeof current.band65[0]) => ({ prompt: s.prompt, answer: s.answer, instruction: s.task }));
  }, [level, current]);

  const checkP1 = useCallback(
    (index: number) => {
      const userAnswer = practiceState.p1Answers[index] || "";
      const ok = isAnswerCorrect(userAnswer, practice1Tasks[index].answer, level);
      const updatedFeedback = { ...practiceState.p1Feedback, [index]: ok };

      setPracticeState((prev) => ({ ...prev, p1Feedback: updatedFeedback }));

      const allCorrect = practice1Tasks.every((task: typeof practice1Tasks[0], i: number) => isAnswerCorrect(practiceState.p1Answers[i] || "", task.answer, level));
      if (allCorrect) award("p1");
    },
    [practiceState.p1Answers, practiceState.p1Feedback, practice1Tasks, level, award]
  );

  const getP1Hint = useCallback(
    (index: number) => {
      if (level === "band55") {
        setP1Hint(`Stage ${index + 1}: Move the object to the subject position and use be + past participle.`);
      } else if (level === "band6") {
        setP1Hint(`Task ${index + 1}: Use be + past participle. Check the diagram for prepositions and details.`);
      } else {
        setP1Hint(`Task ${index + 1}: ${practice1Tasks[index].instruction}`);
      }
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
    const feedback = practiceState.p2ParagraphAnswers.map((answer, i) => answer === expected[i]);
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    if (feedback.every(Boolean)) award("p2");
  }, [current, practiceState.p2ParagraphAnswers, award]);

  const checkCohesion = useCallback(
    (index: number) => {
      const tasks = level === "band6" ? current.p2Band6 : current.p2Band65;
      const userAnswer = practiceState.p2CohesionAnswers[index] || "";
      const ok = isAnswerCorrect(userAnswer, tasks[index].answer, level);
      const updatedFeedback = { ...practiceState.p2CohesionFeedback, [index]: ok };

      setPracticeState((prev) => ({ ...prev, p2CohesionFeedback: updatedFeedback }));

      const allCorrect = tasks.every((task: typeof tasks[0], i: number) => isAnswerCorrect(practiceState.p2CohesionAnswers[i] || "", task.answer, level));
      if (allCorrect) award("p2");
    },
    [level, current, practiceState.p2CohesionAnswers, award]
  );

  const getP2Hint = useCallback(() => {
    if (level === "band55") {
      setP2Hint("Structure: 'then' can go inside a sentence; 'after' goes before 'that'; 'the following stage is to + verb'; 'in the next stage' fits the pattern 'In the ___ stage'.");
    } else if (level === "band6") {
      setP2Hint("Band 6: first-letter clues include F = First, N = Next, A = After, S = Subsequently. For combining, use before/after + being + past participle.");
    } else {
      setP2Hint("Band 6.5: check the target structure: followed by + noun phrase, before/after + being done, or after which + clause.");
    }
  }, [level]);

  // =====================
  // PRACTICE 3
  // =====================

  const wordCount = practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordRequirement = level === "band55" ? 70 : level === "band6" ? 80 : 100;
  const wordTargetRange = level === "band55" ? "70-80" : level === "band6" ? "80-100" : "100-120";
  const canSubmitP3 = wordCount >= wordRequirement;

  const aiChecked = Boolean(aiFeedback);
  const aiErrors = aiFeedback?.errors || [];
  const aiGrammarCount = aiErrors.filter((e) => e.type === "grammar").length;
  const aiLexisCount = aiErrors.filter((e) => e.type === "lexis").length;
  const aiSpellingCount = aiErrors.filter((e) => e.type === "spelling").length;
  const aiCohesionCount = aiErrors.filter((e) => e.type === "cohesion").length;
  const aiTaskCount = aiErrors.filter((e) => e.type === "task").length;
  const reflectionComplete = practiceState.p3Reflection.every((item) => item.trim().length > 0);
  const p3Pass = aiChecked && aiErrors.length === 0 && reflectionComplete;

  const getAIFeedback = useCallback(async () => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your paragraph first before requesting AI feedback.");
      return;
    }
    if (wordCount < wordRequirement) {
      setWritingHint(`Please write at least ${wordRequirement} words before AI checking. Target range: ${wordTargetRange} words. Current: ${wordCount}.`);
      return;
    }

    setAiLoading(true);
    setWritingHint("");
    setAiFeedback(null);

    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processTitle: current.title,
          processTask: current.task,
          level,
          writing: practiceState.p3Writing,
          feedbackMode: "error-types-only",
        }),
      });

      if (!response.ok) throw new Error("AI feedback request failed.");
      const data = await response.json();
      setAiFeedback(data);
      setPracticeState((prev) => ({ ...prev, p3Submitted: true }));
    } catch {
      setWritingHint("AI feedback is temporarily unavailable. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  }, [practiceState.p3Writing, current.title, current.task, level, wordCount, wordRequirement, wordTargetRange]);

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      if (level === "band55") setWritingHint("Band 5.5: Use present simple passive to describe the process. Add basic linkers such as First, Then, Finally.");
      else if (level === "band6") setWritingHint("Band 6: Use present simple passive and a range of linkers. Use pronouns such as it, they or them to avoid repetition.");
      else setWritingHint("Band 6.5: Use present simple passive, include more diagram details, and combine sentences using complex structures.");
      return;
    }
    if (aiErrors.length > 0) {
      setWritingHint("AI has marked the error types only. Revise the paragraph yourself and run AI Check again.");
      return;
    }
    if (!reflectionComplete) {
      setWritingHint("No language errors detected by AI. Complete all 3 self-reflection points to pass.");
      return;
    }
    setWritingHint("Well done. All errors corrected and reflection completed.");
  }, [practiceState.p3Submitted, level, aiErrors.length, reflectionComplete]);

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
      onClick={() => setActivePractice(value as typeof activePractice)}
      role="tab"
      aria-selected={activePractice === value}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
    >
      {label}
    </button>
  );

  const p3Band6GuidingQuestions = [
    "Which 2-3 neighbouring steps can be combined into one sentence?",
    "Which repeated nouns can be replaced by it, they or them?",
    "Which steps share the same subject and can be written together?",
    "Which useful diagram details should be kept (time, tools, machines, materials)?",
    "Can you use one structure from Practice 2, such as before/after being done?",
  ];

  const p3Band65DiagramDetails: Record<ProcessKey, string[]> = {
    bamboo: ["time: spring and autumn", "changes: plants → strips → liquid pulp → fibres → yarn → fabric", "materials: filter, water and amine oxide", "examples: clothes and socks"],
    sugar: ["time: 12-18 months", "method: by workers or machines", "machines: crusher, filter, evaporator, centrifuge", "changes: cane → juice → syrup → crystals"],
    noodles: ["materials: flour, water and oil", "machines: mixer and rollers", "changes: dough → sheets → strips → discs", "packaging: cups, vegetables, spices"],
    recycling: ["locations: bins and centre", "transport: a truck", "changes: bottles → blocks → pieces → pellets", "examples: T-shirts, bags, containers"],
  };

  // =====================
  // RENDER PRACTICE 1
  // =====================

  const renderPractice1 = () => (
    <Card title={level === "band55" ? "Practice 1 · Active to Passive" : "Practice 1 · Passive Voice / Sentence Upgrade"}>
      <div className="space-y-4">
        {practice1Tasks.map((task: typeof practice1Tasks[0], index: number) => (
          <div key={index} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{level === "band55" ? `Stage ${index + 1}` : `Task ${index + 1}`}</p>
            {level !== "band55" && <p className="mt-1 font-medium">{task.instruction}</p>}
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            <input
              value={practiceState.p1Answers[index] || ""}
              onChange={(e) => setPracticeState((prev) => ({ ...prev, p1Answers: { ...prev.p1Answers, [index]: e.target.value } }))}
              className="mt-3 w-full rounded-xl border p-2"
              placeholder="Write your answer here..."
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => checkP1(index)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
              <button onClick={() => getP1Hint(index)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            </div>
            {practiceState.p1Feedback[index] !== undefined && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p1Feedback[index] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {practiceState.p1Feedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}
              </div>
            )}
          </div>
        ))}
      </div>
      {p1Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p1Hint}</div>}
    </Card>
  );

  // =====================
  // RENDER PRACTICE 2
  // =====================

  const renderBlank = (index: number) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        role="textbox"
        aria-label={`Blank ${index + 1}`}
        aria-readonly={true}
        className={`mx-1 inline-block min-w-[105px] rounded border-b-2 px-2 text-center ${checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"}`}
      >
        {practiceState.p2ParagraphAnswers[index] || "_____"}
      </span>
    );
  };

  const renderBand55Paragraph = () => (
    <p className="leading-10">
      {current.p2Band55.text.map((chunk: [number, string], i: number) => (
        <span key={i}>{renderBlank(chunk[0])}{chunk[1]}</span>
      ))}
    </p>
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
          {tasks.map((task: typeof tasks[0], index: number) => (
            <div key={index} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {index + 1}</p>
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
                value={practiceState.p2CohesionAnswers[index] || ""}
                onChange={(e) => setPracticeState((prev) => ({ ...prev, p2CohesionAnswers: { ...prev.p2CohesionAnswers, [index]: e.target.value } }))}
                className="mt-3 w-full rounded-xl border p-2"
                placeholder="Write your answer here..."
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => checkCohesion(index)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
                <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
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
    );
  };

  // =====================
  // RENDER PRACTICE 3
  // =====================

  const renderAIErrorMarker = (error: { type: string; original?: string }, index: number) => {
    const typeColor = error.type === "grammar" ? "bg-red-100 text-red-700 border-red-200"
      : error.type === "spelling" ? "bg-purple-100 text-purple-700 border-purple-200"
      : error.type === "lexis" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
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
            {p3Band6GuidingQuestions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}

      {level === "band65" && (
        <div className="mb-4 rounded-2xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-900">
          <p className="font-semibold">Useful diagram details to consider</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {p3Band65DiagramDetails[processKey].map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}

      <textarea
        value={practiceState.p3Writing}
        onChange={(e) => {
          setPracticeState((prev) => ({ ...prev, p3Writing: e.target.value, p3Submitted: false }));
          setAiFeedback(null);
        }}
        className="h-56 w-full rounded-2xl border p-3"
        placeholder="Write your process paragraph here..."
      />

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span>Word count: <strong>{wordCount}</strong></span>
        <span>Target: <strong>{wordTargetRange} words</strong></span>
        {aiChecked && (
          <span>AI check: <strong>{aiErrors.length === 0 ? "No language errors detected" : `${aiErrors.length} issue(s)`}</strong></span>
        )}
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
          disabled={aiLoading || !practiceState.p3Writing.trim() || !canSubmitP3}
          className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${aiLoading || !practiceState.p3Writing.trim() || !canSubmitP3 ? "cursor-not-allowed bg-slate-400" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {aiLoading ? "Checking..." : "AI Check"}
        </button>
        <button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
      </div>

      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}

      {aiChecked && aiErrors.length > 0 && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <p className="font-bold text-slate-800">AI language error labels</p>
          <p className="mt-1 text-sm text-slate-600">Only error types are shown. No corrections provided - revise yourself.</p>
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
        <p className="mt-1 text-sm text-slate-600">Write 3 reflection points on: passive forms, linkers, pronoun use, spelling, or estimated level.</p>
        <div className="mt-3 space-y-2">
          {practiceState.p3Reflection.map((item, i) => (
            <input
              key={i}
              value={item}
              onChange={(e) => setPracticeState((prev) => { const copy = [...prev.p3Reflection]; copy[i] = e.target.value; return { ...prev, p3Reflection: copy }; })}
              className="w-full rounded-xl border p-2"
              placeholder={`Reflection ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {p3Pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS · +5 points</div>}
    </Card>
  );

  // =====================
  // MAIN UI
  // =====================

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
              <select value={processKey} onChange={(e) => handleProcessOrLevelChange(e.target.value as ProcessKey, level)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
                <option value="bamboo">Bamboo fabric</option>
                <option value="sugar">Sugar cane</option>
                <option value="noodles">Instant noodles</option>
                <option value="recycling">Recycling</option>
              </select>
              <select value={level} onChange={(e) => handleProcessOrLevelChange(processKey, e.target.value as LevelKey)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
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
            <p className="mt-2 text-lg font-bold text-blue-700">Score: {totalScore} / 10 · {achievement}</p>
            <p className="text-sm text-slate-500">
              Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} · Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} · Practice 3: {earned.p3 ? "+5 earned" : "5 pts"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Process Diagram</h2>
            <img src={current.image} alt={current.title} className="w-full rounded-xl border object-contain" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400?text=Image+Not+Found"; }} />
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
