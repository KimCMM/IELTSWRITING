"use client";

import { useMemo, useState } from "react";

export default function IELTSProcessTrainerFullSystem() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");

  // =====================
  // PRODUCT DATA: 4 PROCESS DIAGRAMS
  // =====================

  const processData: Record<string, {
    title: string;
    task: string;
    image: string;
    steps: Array<{ active: string; passive: string; prompt6: string }>;
    band65: Array<{ prompt: string; task: string; answer: string }>;
    p2Band55: {
      text: Array<[number, string, string | null]>;
      answers: string[];
    };
    p2Band6: Array<{
      type: string;
      sentence?: string;
      answer?: string;
      prompt?: string;
      parts?: string[];
    }>;
    p2Band65: Array<{
      prompt: string;
      parts: string[];
      answer: string;
    }>;
  }> = {
    bamboo: {
      title: "Bamboo Fabric",
      task: "The diagram below shows how fabric is manufactured from bamboo.",
      image: "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Waking-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
      steps: [
        { active: "People plant bamboo plants in spring.", passive: "Bamboo plants are planted in spring.", prompt6: "bamboo plants / plant / spring" },
        { active: "People harvest bamboo plants in autumn.", passive: "Bamboo plants are harvested in autumn.", prompt6: "bamboo plants / harvest / autumn" },
        { active: "A machine cuts bamboo plants into strips.", passive: "Bamboo plants are cut into strips.", prompt6: "bamboo plants / cut / strips" },
        { active: "A machine crushes the strips to make liquid pulp.", passive: "The strips are crushed to make liquid pulp.", prompt6: "strips / crush / liquid pulp" },
        { active: "A filter separates long fibres from the liquid.", passive: "Long fibres are separated from the liquid by a filter.", prompt6: "long fibres / separate / liquid / filter" },
        { active: "People add water and amine oxide to soften the fibres.", passive: "Water and amine oxide are added to soften the fibres.", prompt6: "water and amine oxide / add / soften fibres" },
        { active: "People spin fibres to make yarn.", passive: "Fibres are spun to make yarn.", prompt6: "fibres / spin / yarn" },
        { active: "People weave yarn to make fabric.", passive: "Yarn is woven to make fabric.", prompt6: "yarn / weave / fabric" },
        { active: "People use fabric to make clothes.", passive: "Fabric is used to make clothes.", prompt6: "fabric / use / clothes" }
      ],
      band65: [
        { prompt: "Bamboo plants are grown in spring.", task: "Use a more formal verb.", answer: "Bamboo plants are cultivated in spring." },
        { prompt: "The strips are crushed.", task: "Add the result shown in the diagram.", answer: "The strips are crushed, producing liquid pulp." },
        { prompt: "Long fibres are separated from the liquid.", task: "Use a more formal verb.", answer: "Long fibres are extracted from the liquid." },
        { prompt: "The fibres are softened.", task: "Add detail from the diagram.", answer: "The fibres are softened by adding water and amine oxide." },
        { prompt: "Yarn is woven to make fabric.", task: "Use a more natural result structure.", answer: "Yarn is woven into fabric." }
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
          [7, ", yarn is woven to make fabric."]
        ],
        answers: ["first", "then", "after", "the following stage", "next", "next", "then", "finally"]
      },
      p2Band6: [
        { type: "fill", sentence: "N______, bamboo plants are harvested in autumn.", answer: "Next" },
        { type: "fill", sentence: "A______ that, bamboo plants are cut into strips.", answer: "After" },
        { type: "fill", sentence: "S__________, the fibres are spun to make yarn.", answer: "Subsequently" },
        { type: "combine", prompt: "Combine using before doing.", parts: ["Bamboo plants are cut into strips.", "They are crushed to make liquid pulp."], answer: "They are cut into strips before being crushed to make liquid pulp." },
        { type: "combine", prompt: "Combine using after doing.", parts: ["The fibres are softened.", "They are spun to make yarn."], answer: "They are spun to make yarn after being softened." }
      ],
      p2Band65: [
        { prompt: "Combine using followed by + noun phrase.", parts: ["The strips are crushed, producing liquid pulp.", "Long fibres are extracted from the liquid."], answer: "The strips are crushed, producing liquid pulp, followed by the extraction of long fibres from the liquid." },
        { prompt: "Combine using after which.", parts: ["The fibres are softened by adding water and amine oxide.", "They are spun into yarn."], answer: "The fibres are softened by adding water and amine oxide, after which they are spun into yarn." },
        { prompt: "Combine using before doing.", parts: ["Yarn is woven into fabric.", "Fabric is used to make clothes."], answer: "Yarn is woven into fabric before being used to make clothes." }
      ]
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
        { active: "A machine dries and cools the sugar.", passive: "The sugar is dried and cooled by a machine.", prompt6: "sugar / dry and cool / machine" }
      ],
      band65: [
        { prompt: "Sugar cane is grown for 12-18 months.", task: "Use a more formal verb.", answer: "Sugar cane is cultivated for 12-18 months." },
        { prompt: "The sugar cane is crushed to make juice.", task: "Use a more formal verb.", answer: "The sugar cane is crushed to produce juice." },
        { prompt: "The juice is purified.", task: "Add detail from the diagram.", answer: "The juice is purified using a limestone filter." },
        { prompt: "The juice is heated.", task: "Add the result shown in the diagram.", answer: "The juice is heated, forming syrup." },
        { prompt: "Sugar crystals are separated from the syrup.", task: "Use a more formal verb.", answer: "Sugar crystals are extracted from the syrup." }
      ],
      p2Band55: {
        text: [
          [0, " sugar cane is grown for 12-18 months. The sugar cane is "],
          [1, " harvested by workers or machines. "],
          [2, " that, sugar cane is crushed to make juice. "],
          [3, " is to purify the juice by a limestone filter. "],
          [4, ", the juice is turned into syrup by an evaporator. In the "],
          [5, " stage, sugar crystals are separated from syrup by a centrifuge. "],
          [6, ", the sugar is dried and cooled by a machine.", null],
          [7, "", null]
        ],
        answers: ["first", "then", "after", "the following stage", "next", "next", "finally", ""]
      },
      p2Band6: [
        { type: "fill", sentence: "N______, the sugar cane is harvested by workers or machines.", answer: "Next" },
        { type: "fill", sentence: "A______ that, sugar cane is crushed to make juice.", answer: "After" },
        { type: "fill", sentence: "S__________, sugar crystals are separated from syrup by a centrifuge.", answer: "Subsequently" },
        { type: "combine", prompt: "Combine using before doing.", parts: ["The sugar cane is harvested.", "It is crushed to make juice."], answer: "It is harvested before being crushed to make juice." },
        { type: "combine", prompt: "Combine using after doing.", parts: ["The juice is purified by a limestone filter.", "It is turned into syrup by an evaporator."], answer: "It is turned into syrup by an evaporator after being purified by a limestone filter." }
      ],
      p2Band65: [
        { prompt: "Combine using followed by + noun phrase.", parts: ["The sugar cane is crushed to produce juice.", "The juice is purified using a limestone filter."], answer: "The sugar cane is crushed to produce juice, followed by the purification of the juice using a limestone filter." },
        { prompt: "Combine using after which.", parts: ["The juice is heated, forming syrup.", "Sugar crystals are extracted from the syrup."], answer: "The juice is heated, forming syrup, after which sugar crystals are extracted from the syrup." },
        { prompt: "Combine using after doing.", parts: ["Sugar crystals are extracted from the syrup.", "The sugar is dried and cooled."], answer: "The sugar is dried and cooled after being extracted from the syrup." }
      ]
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
        { active: "Machines label and seal the cups.", passive: "The cups are labelled and sealed.", prompt6: "cups / label and seal" }
      ],
      band65: [
        { prompt: "Flour is put in storage silos.", task: "Use a more natural verb.", answer: "Flour is placed in storage silos." },
        { prompt: "The dough strips are made into noodle discs.", task: "Use a more precise verb phrase.", answer: "The dough strips are formed into noodle discs." },
        { prompt: "The noodle discs are cooked.", task: "Add detail from the diagram.", answer: "The noodle discs are cooked in oil." },
        { prompt: "Vegetables and spices are put into cups.", task: "Use a more natural verb.", answer: "Vegetables and spices are added to the cups." },
        { prompt: "The cups are sealed.", task: "Add another action shown in the diagram.", answer: "The cups are labelled and sealed." }
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
          [7, ", the cups are labelled and sealed."]
        ],
        answers: ["first", "then", "after", "the following stage", "next", "next", "then", "finally"]
      },
      p2Band6: [
        { type: "fill", sentence: "N______, flour is mixed with water and oil in a mixer.", answer: "Next" },
        { type: "fill", sentence: "A______ that, the dough is pressed into sheets by rollers.", answer: "After" },
        { type: "fill", sentence: "S__________, the noodle discs are cooked in oil and then dried.", answer: "Subsequently" },
        { type: "combine", prompt: "Combine using after doing.", parts: ["Flour is mixed with water and oil in a mixer.", "The dough is pressed into sheets by rollers."], answer: "The dough is pressed into sheets by rollers after being mixed with water and oil in a mixer." },
        { type: "combine", prompt: "Combine using before doing.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil before being dried." }
      ],
      p2Band65: [
        { prompt: "Combine using followed by + noun phrase.", parts: ["The dough strips are formed into noodle discs.", "The noodle discs are cooked in oil."], answer: "The dough strips are formed into noodle discs, followed by the cooking of the noodle discs in oil." },
        { prompt: "Combine using after which.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil, after which they are dried." },
        { prompt: "Combine using after doing.", parts: ["Vegetables and spices are added to the cups.", "The cups are labelled and sealed."], answer: "The cups are labelled and sealed after vegetables and spices are added to them." }
      ]
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
        { active: "Factories produce end products.", passive: "End products are produced.", prompt6: "end products / produce" }
      ],
      band65: [
        { prompt: "Plastic bottles are put in recycling bins.", task: "Use a more natural verb.", answer: "Plastic bottles are placed in recycling bins." },
        { prompt: "Plastic bottles are collected.", task: "Add detail from the diagram.", answer: "Plastic bottles are collected by a truck." },
        { prompt: "Plastic bottles are compressed.", task: "Add the result shown in the diagram.", answer: "Plastic bottles are compressed into blocks." },
        { prompt: "The blocks are crushed.", task: "Add the result shown in the diagram.", answer: "The blocks are crushed, producing smaller pieces." },
        { prompt: "End products are produced.", task: "Use a more formal verb.", answer: "End products are manufactured." }
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
          [7, ", end products are produced."]
        ],
        answers: ["first", "then", "the following stage", "next", "then", "next", "then", "finally"]
      },
      p2Band6: [
        { type: "fill", sentence: "N______, plastic bottles are collected and transported by a truck.", answer: "Next" },
        { type: "fill", sentence: "A______ that, plastic bottles are sorted in a recycling centre.", answer: "After" },
        { type: "fill", sentence: "S__________, plastic pellets are produced.", answer: "Subsequently" },
        { type: "combine", prompt: "Combine using before doing.", parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."], answer: "They are sorted in a recycling centre before being compressed into blocks." },
        { type: "combine", prompt: "Combine using after doing.", parts: ["Plastic bottles are collected and transported by a truck.", "They are sorted in a recycling centre."], answer: "They are sorted in a recycling centre after being collected and transported by a truck." }
      ],
      p2Band65: [
        { prompt: "Combine using followed by + noun phrase.", parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."], answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks." },
        { prompt: "Combine using after which.", parts: ["The blocks are crushed, producing smaller pieces.", "The pieces are washed."], answer: "The blocks are crushed, producing smaller pieces, after which the pieces are washed." },
        { prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." }
      ]
    }
  };

  const current = processData[processKey];
  const steps = current.steps;

  // =====================
  // SCORE SYSTEM
  // =====================

  const [scoreMap, setScoreMap] = useState<Record<string, { p1: boolean; p2: boolean; p3: boolean }>>({});
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);

  const award = (practice: "p1" | "p2" | "p3") => {
    setScoreMap((prev) => {
      const currentEarned = prev[scoreKey] || { p1: false, p2: false, p3: false };
      if (currentEarned[practice]) return prev;
      return {
        ...prev,
        [scoreKey]: {
          ...currentEarned,
          [practice]: true
        }
      };
    });
  };

  const normalize = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // =====================
  // PRACTICE 1
  // =====================

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return steps.map((s) => ({ prompt: s.active, answer: s.passive, instruction: "Rewrite the active sentence in the passive voice." }));
    }
    if (level === "band6") {
      return steps.map((s) => ({ prompt: s.prompt6, answer: s.passive, instruction: "Use the words and the diagram to write a complete passive sentence." }));
    }
    return current.band65.map((s) => ({ prompt: s.prompt, answer: s.answer, instruction: s.task }));
  }, [level, processKey, steps, current.band65]);

  const [p1Answers, setP1Answers] = useState<Record<number, string>>({});
  const [p1Feedback, setP1Feedback] = useState<Record<number, boolean>>({});
  const [p1Hint, setP1Hint] = useState("");

  const checkP1 = (index: number) => {
    const ok = normalize(p1Answers[index] || "") === normalize(practice1Tasks[index].answer);
    const nextFeedback = { ...p1Feedback, [index]: ok };
    setP1Feedback(nextFeedback);

    const allCorrect = practice1Tasks.every((task, i) => {
      const answerToCheck = i === index ? p1Answers[index] || "" : p1Answers[i] || "";
      const result = i === index ? ok : normalize(answerToCheck) === normalize(task.answer);
      return result;
    });

    if (allCorrect) award("p1");
  };

  const getP1Hint = (index: number) => {
    if (level === "band55") setP1Hint(`Task ${index + 1}: Move the object to the subject position and use be + past participle.`);
    else if (level === "band6") setP1Hint(`Task ${index + 1}: Use be + past participle. Check the diagram for prepositions and details.`);
    else setP1Hint(`Task ${index + 1}: ${practice1Tasks[index].instruction}`);
  };

  // =====================
  // PRACTICE 2
  // =====================

  const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [paragraphAnswers, setParagraphAnswers] = useState<string[]>(Array(8).fill(""));
  const [paragraphFeedback, setParagraphFeedback] = useState<boolean[]>([]);
  const [cohesionAnswers, setCohesionAnswers] = useState<Record<number, string>>({});
  const [cohesionFeedback, setCohesionFeedback] = useState<Record<number, boolean>>({});
  const [p2Hint, setP2Hint] = useState("");

  const resetP2State = () => {
    setParagraphAnswers(Array(8).fill(""));
    setParagraphFeedback([]);
    setCohesionAnswers({});
    setCohesionFeedback({});
    setP2Hint("");
  };

  const dropToBlank = (index: number) => {
    if (!dragItem) return;
    const copy = [...paragraphAnswers];
    copy[index] = dragItem;
    setParagraphAnswers(copy);
  };

  const checkParagraph = () => {
    const answers = current.p2Band55.answers;
    const feedback = paragraphAnswers.map((a, i) => a === answers[i]);
    setParagraphFeedback(feedback);
    if (feedback.every(Boolean)) award("p2");
  };

  const getCohesionTasks = () => (level === "band6" ? current.p2Band6 : current.p2Band65);

  const checkCohesion = (index: number) => {
    const tasks = getCohesionTasks();
    const ok = normalize(cohesionAnswers[index] || "") === normalize(tasks[index].answer || "");
    const next = { ...cohesionFeedback, [index]: ok };
    setCohesionFeedback(next);

    const allCorrect = tasks.every((task, i) => {
      const user = i === index ? cohesionAnswers[index] || "" : cohesionAnswers[i] || "";
      return i === index ? ok : normalize(user) === normalize(task.answer || "");
    });

    if (allCorrect) award("p2");
  };

  const getP2Hint = () => {
    if (level === "band55") {
      setP2Hint("Structure: 'then' can go inside a sentence; 'after' goes before 'that'; 'the following stage is to + verb'; 'in the next stage' fits the pattern 'In the ___ stage'.");
    } else if (level === "band6") {
      setP2Hint("Band 6: first-letter clues include N = Next, A = After, S = Subsequently. For combining, use before/after + being + past participle.");
    } else {
      setP2Hint("Band 6.5: check the target structure: followed by + noun phrase, before/after + being done, or after which + clause.");
    }
  };

  const renderBlank = (index: number) => {
    const checked = paragraphFeedback.length > 0;
    const ok = paragraphFeedback[index];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        className={`mx-1 inline-block min-w-[105px] rounded border-b-2 px-2 text-center ${checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"}`}
      >
        {paragraphAnswers[index] || "_____"}
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

  // =====================
  // PRACTICE 3
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
    { id: "g5", type: "grammar", pattern: /are harvest|is harvest/gi, message: "Use passive form: harvested." },
    { id: "g6", type: "grammar", pattern: /are spin|is spin/gi, message: "Use passive form: spun." },
    { id: "l1", type: "lexis", pattern: /end goods|final goods/gi, message: "Use end products." },
    { id: "l2", type: "lexis", pattern: /plastic balls/gi, message: "Use plastic pellets." },
    { id: "l3", type: "lexis", pattern: /raw materials/gi, message: "Use raw material as an uncountable noun here." },
    { id: "l4", type: "lexis", pattern: /spinned/gi, message: "Use spun, not spinned." }
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
        <strong key={`${error.id}-${index}`} className={`rounded px-1 font-bold ${error.type === "grammar" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
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
  const p3Pass = submitted && detectedErrors.length === 0 && reflectionComplete;

  const submitWriting = () => setSubmitted(true);

  const getWritingHint = () => {
    if (!submitted) setWritingHint("Submit your paragraph first to activate self-correction.");
    else if (detectedErrors.length > 0) {
      const first = detectedErrors[0];
      setWritingHint(`Hint: This is a ${first.type.toUpperCase()} issue - ${first.message}`);
    } else if (!reflectionComplete) setWritingHint("No language errors remain. Complete all 3 self-reflection points to pass.");
    else setWritingHint("Well done. All errors corrected and reflection completed.");
  };

  if (p3Pass && !earned.p3) award("p3");

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
    <button onClick={() => setActivePractice(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activePractice === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
      {label}
    </button>
  );

  const renderPractice1 = () => (
    <Card title="Practice 1 - Passive Voice / Sentence Upgrade">
      <p className="mb-4 text-sm text-slate-600">5.5: active to passive - 6: diagram words to passive sentence - 6.5: synonym, detail and complex sentence.</p>
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
            <p className="mt-1 font-medium">{task.instruction}</p>
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            <input value={p1Answers[i] || ""} onChange={(e) => setP1Answers((p) => ({ ...p, [i]: e.target.value }))} className="mt-3 w-full rounded-xl border p-2" placeholder="Write your answer here..." />
            <div className="mt-3 flex gap-2">
              <button onClick={() => checkP1(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
              <button onClick={() => getP1Hint(i)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            </div>
            {p1Feedback[i] !== undefined && <div className={`mt-3 rounded-xl p-3 text-sm ${p1Feedback[i] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{p1Feedback[i] ? "Correct." : `Suggested answer: ${task.answer}`}</div>}
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
            {linkerOptions.map((option) => <div key={option} draggable onDragStart={() => setDragItem(option)} className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">{option}</div>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            <button onClick={checkParagraph} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
            <button onClick={resetP2State} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Reset</button>
          </div>
          {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
          {paragraphFeedback.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">{paragraphFeedback.map((ok, i) => <div key={i} className={`rounded-xl border p-3 text-sm ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>Blank {i + 1}: {ok ? "Correct" : "Check again"}</div>)}</div>}
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
              {task.type === "fill" ? <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p> : <div className="mt-2 rounded-lg bg-white p-3"><p className="font-semibold">{task.prompt}</p><p>1. {task.parts?.[0]}</p><p>2. {task.parts?.[1]}</p></div>}
              <input value={cohesionAnswers[i] || ""} onChange={(e) => setCohesionAnswers((p) => ({ ...p, [i]: e.target.value }))} className="mt-3 w-full rounded-xl border p-2" placeholder="Write your answer here..." />
              <div className="mt-3 flex gap-2">
                <button onClick={() => checkCohesion(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
                <button onClick={getP2Hint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
              </div>
              {cohesionFeedback[i] !== undefined && <div className={`mt-3 rounded-xl p-3 text-sm ${cohesionFeedback[i] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{cohesionFeedback[i] ? "Correct." : `Suggested answer: ${task.answer}`}</div>}
            </div>
          ))}
        </div>
        {p2Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint}</div>}
      </Card>
    );
  };

  const renderPractice3 = () => (
    <Card title="Practice 3 - Timed Writing + Self-correction">
      <p className="mb-4 text-sm text-slate-600">Write a 100+ word body paragraph. Submit, correct highlighted errors, and complete three reflection points before passing.</p>
      <textarea value={writing} onChange={(e) => { setWriting(e.target.value); if (submitted) setSubmitted(false); }} className="h-56 w-full rounded-2xl border p-3" placeholder="Write your process paragraph here..." />
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600"><span>Word count: <strong>{wordCount}</strong></span><span>Target: <strong>100+ words</strong></span>{submitted && <span>Grammar errors: <strong>{grammarErrorCount}</strong></span>}{submitted && <span>Lexical errors: <strong>{lexisErrorCount}</strong></span>}</div>
      <div className="mt-4 flex gap-2"><button onClick={submitWriting} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Submit</button><button onClick={getWritingHint} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button></div>
      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}
      {submitted && <div className="mt-4 rounded-2xl border bg-slate-50 p-4 whitespace-pre-wrap leading-7">{highlightedWriting || "No writing submitted."}</div>}
      <div className="mt-5 rounded-2xl border bg-white p-4"><p className="font-semibold">Self-reflection</p><p className="mt-1 text-sm text-slate-600">Write 3 language points or main features you need to focus on next time.</p><div className="mt-3 space-y-2">{reflection.map((item, i) => <input key={i} value={item} onChange={(e) => { const copy = [...reflection]; copy[i] = e.target.value; setReflection(copy); }} className="w-full rounded-xl border p-2" placeholder={`Reflection ${i + 1}`} />)}</div></div>
      {p3Pass && <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-lg font-bold text-green-700">PASS - +5 points</div>}
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">IELTS Academic Writing Task 1</p><h1 className="mt-1 text-3xl font-bold">Process Writing Training System</h1><p className="mt-2 text-sm text-slate-600">Four process diagrams - three bands - sentence, cohesion and writing training.</p></div>
            <div className="flex flex-wrap gap-3">
              <select value={processKey} onChange={(e) => { setProcessKey(e.target.value); setParagraphAnswers(Array(8).fill("")); setParagraphFeedback([]); setCohesionAnswers({}); setCohesionFeedback({}); setP1Answers({}); setP1Feedback({}); }} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
                <option value="bamboo">Bamboo fabric</option>
                <option value="sugar">Sugar cane</option>
                <option value="noodles">Instant noodles</option>
                <option value="recycling">Recycling</option>
              </select>
              <select value={level} onChange={(e) => { setLevel(e.target.value); setParagraphAnswers(Array(8).fill("")); setParagraphFeedback([]); setCohesionAnswers({}); setCohesionFeedback({}); setP1Answers({}); setP1Feedback({}); }} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">
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
            <p className="text-sm text-slate-500">Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} - Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} - Practice 3: {earned.p3 ? "+5 earned" : "5 pts"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Process Diagram</h2>
            <img src={current.image} alt={current.title} className="w-full rounded-xl border object-contain" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
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
