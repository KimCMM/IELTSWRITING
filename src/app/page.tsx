"use client";

import { memo, useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import Image from "next/image";

// =====================
// 1. TYPES
// =====================

interface StepType {
  active: string;
  passive: string;
  prompt6: string;
}

interface Band65Task {
  prompt: string;
  task: string;
  answer: string;
}

interface FillTask {
  type: "fill";
  sentence: string;
  answer: string;
}

interface CombineTask {
  type?: "combine";
  prompt: string;
  parts: string[];
  answer: string;
}

type CohesionTask = FillTask | CombineTask;

interface P2Band55Data {
  text: [number, string][];
  answers: string[];
}

interface ProcessData {
  title: string;
  task: string;
  image: string;
  steps: StepType[];
  band65: Band65Task[];
  p2Band55: P2Band55Data;
  p2Band6: CohesionTask[];
  p2Band65: CombineTask[];
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

interface HintState {
  index: number | null;
  text: string;
}

interface ScoreEntry {
  p1: boolean;
  p2: boolean;
  p3: boolean;
}

interface Band6Checklist {
  pronouns: boolean;
  details: boolean;
  structure: boolean;
}

interface Band65Checklist {
  details: boolean;
  complexStructure: boolean;
  stageLogic: boolean;
}

// =====================
// 2. HELPERS
// =====================

const useLocalStorage = (key: string, initialValue: Record<string, ScoreEntry>) => {
  const [storedValue, setStoredValue] = useState<Record<string, ScoreEntry>>(() => {
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
    (valueOrUpdater: Record<string, ScoreEntry> | ((prev: Record<string, ScoreEntry>) => Record<string, ScoreEntry>)) => {
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

  return [storedValue, setValue] as const;
};

const normalize = (text: string): string =>
  String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/[\-–]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

const fuzzyMatch = (user: string, expected: string, tolerance = 0.88): boolean => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (!userNorm || !expectedNorm) return false;
  if (userNorm === expectedNorm) return true;

  const userWords = userNorm.split(" ");
  const expectedWords = expectedNorm.split(" ");
  const matchedWords = expectedWords.filter((word: string) => userWords.includes(word)).length;
  return matchedWords / expectedWords.length >= tolerance;
};

const isAnswerCorrect = (user: string, expected: string, level: string): boolean => {
  if (level === "band65") return fuzzyMatch(user, expected, 0.82);
  return normalize(user) === normalize(expected);
};

const initialPracticeState: PracticeState = {
  p1Answers: {},
  p1Feedback: {},
  p2ParagraphAnswers: Array(10).fill(""),
  p2ParagraphFeedback: [],
  p2CohesionAnswers: {},
  p2CohesionFeedback: {},
  p3Writing: "",
  p3Submitted: false,
  p3Reflection: ["", "", ""],
};

const fixP2Band55Data = (rawData: Record<string, ProcessData>): Record<string, ProcessData> => {
  const copy: Record<string, ProcessData> = JSON.parse(JSON.stringify(rawData));
  Object.keys(copy).forEach((key: string) => {
    const item = copy[key];
    if (!item.p2Band55) return;
    const blankIndexes = item.p2Band55.text.map((chunk: [number, string]) => chunk[0]);
    item.p2Band55.answers = item.p2Band55.answers.slice(0, blankIndexes.length);
  });
  return copy;
};

// =====================
// 3. DATA
// =====================

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
      { prompt: "Bamboo plants are planted in spring.", task: "Paraphrase 'plant' with a more formal verb.", answer: "Bamboo is cultivated in spring." },
      { prompt: "Bamboo is harvested in autumn.", task: "Add how the harvesting is shown in the diagram.", answer: "The bamboo is harvested manually in autumn." },
      { prompt: "Bamboo is cut into strips.", task: "Add an adverb to show machine processing and describe the strips as narrow.", answer: "The harvested bamboo is mechanically cut into narrow strips." },
      { prompt: "The strips are crushed to make liquid pulp.", task: "Use ', doing sth' to show the result of the previous action.", answer: "The strips are crushed, producing liquid pulp." },
      { prompt: "Long fibres are separated from the liquid by a filter.", task: "Link liquid pulp to the filter and use a where-clause to describe the extraction of fibres.", answer: "The liquid pulp passes through a filter, where long fibres are extracted from the remaining liquid." },
      { prompt: "Water and amine oxide are added to soften the fibres.", task: "Use a which-clause to explain how this prepares the fibres for the next stage.", answer: "The fibres are treated with water and amine oxide, which softens them and prepares them for spinning." },
    ],
    p2Band55: {
      text: [
        [0, ", bamboo plants are planted in spring. Bamboo plants are "],
        [1, " harvested in autumn. "],
        [2, " that, bamboo plants are cut into strips. "],
        [3, " is to crush the strips to make liquid pulp. "],
        [4, ", long fibres are separated from the liquid by a filter. In the "],
        [5, " stage, water and amine oxide are added to soften the fibres. The fibres are "],
        [6, " spun to make yarn. "],
        [7, ", yarn is woven to make fabric."],
      ],
      answers: ["First", "then", "After", "The following stage", "Next", "next", "then", "Finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "In the i______ stage, bamboo plants are planted in spring.", answer: "initial" },
      { type: "fill", sentence: "Bamboo plants are t______ harvested in autumn.", answer: "then" },
      { type: "fill", sentence: "A______ that, bamboo plants are cut into strips.", answer: "After" },
      { type: "fill", sentence: "The f______ stage is to crush the strips to make liquid pulp.", answer: "following" },
      { type: "fill", sentence: "A__________, long fibres are separated from the liquid by a filter.", answer: "Afterwards" },
      { type: "fill", sentence: "S__________, water and amine oxide are added to soften the fibres.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The strips are crushed to make liquid pulp.", "Long fibres are separated from the liquid by a filter."], answer: "Long fibres are separated from the liquid by a filter after being crushed to make liquid pulp." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The fibres are softened.", "They are spun to make yarn."], answer: "The fibres are softened before being spun to make yarn." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["Yarn is woven to make fabric.", "It is used to make clothes."], answer: "Yarn is woven to make fabric before being used to make clothes." },
    ],
    p2Band65: [
      { prompt: "Use 'Once ... has/have been done, ...' to connect two steps.", parts: ["Bamboo is harvested manually in autumn.", "It is mechanically cut into narrow strips."], answer: "Once the bamboo has been harvested manually in autumn, it is mechanically cut into narrow strips." },
      { prompt: "Combine using before doing.", parts: ["Bamboo is cut into narrow strips.", "It is crushed to make liquid pulp."], answer: "Bamboo is cut into narrow strips before being crushed to make liquid pulp." },
      { prompt: "Combine using after which.", parts: ["The strips are crushed to make liquid pulp.", "Long fibres are extracted from the remaining liquid by a filter."], answer: "The strips are crushed to make liquid pulp, after which long fibres are extracted from the remaining liquid by a filter." },
      { prompt: "Combine using which is then done.", parts: ["The fibres are spun into yarn.", "The yarn is woven into bamboo fabric."], answer: "The fibres are spun into yarn, which is then woven into bamboo fabric." },
      { prompt: "Combine using followed by + noun phrase.", parts: ["The softened fibres are spun into yarn.", "The yarn is woven into fabric."], answer: "The softened fibres are spun into yarn, followed by the weaving of the yarn into fabric." },
    ],
  },

  sugar: {
    title: "Sugar Canes",
    task: "The diagram below shows how sugar is produced from sugar canes.",
    image: "https://daxue-oss.koocdn.com/upload/ti/sardine/2521000-2522000/2521817/3395c3236ee34b9089e15f2ce4dfc9a9.png",
    steps: [
      { active: "Farmers grow sugar canes for 12-18 months.", passive: "Sugar canes are grown for 12-18 months.", prompt6: "sugar canes / grow / 12-18 months" },
      { active: "Workers or machines harvest the sugar canes.", passive: "The sugar canes are harvested by workers or machines.", prompt6: "sugar canes / harvest / workers or machines" },
      { active: "Machines crush the sugar canes to make juice.", passive: "The sugar canes are crushed to make juice.", prompt6: "sugar canes / crush / juice" },
      { active: "A limestone filter purifies the juice.", passive: "The juice is purified by a limestone filter.", prompt6: "juice / purify / limestone filter" },
      { active: "An evaporator turns the juice into syrup.", passive: "The juice is turned into syrup by an evaporator.", prompt6: "juice / turn / syrup / evaporator" },
      { active: "A centrifuge separates sugar crystals from the syrup.", passive: "Sugar crystals are separated from the syrup by a centrifuge.", prompt6: "sugar crystals / separate / syrup / centrifuge" },
      { active: "A machine dries and cools the sugar.", passive: "The sugar is dried and cooled by a machine.", prompt6: "sugar / dry and cool / machine" },
    ],
    band65: [
      { prompt: "Sugar canes are grown for 12-18 months.", task: "Paraphrase 'grow' with a more formal verb.", answer: "Sugar canes are cultivated for 12-18 months." },
      { prompt: "The sugar canes are harvested by workers or machines.", task: "Use either...or... and add manually / mechanically to show the two harvesting methods.", answer: "The mature sugar canes are harvested either manually by workers or mechanically by machines." },
      { prompt: "The sugar canes are crushed to make juice.", task: "Use ', doing sth' to show the result of the previous action.", answer: "The sugar canes are crushed, producing juice." },
      { prompt: "The juice is purified by a limestone filter.", task: "Add the purpose of the filter using in order to.", answer: "The juice then passes through a limestone filter in order to remove impurities." },
      { prompt: "The juice is turned into syrup by an evaporator.", task: "Use a where-clause to explain what happens in the evaporator.", answer: "The juice is then heated in an evaporator, where excess water is removed and the liquid is converted into syrup." },
      { prompt: "Sugar crystals are separated from the syrup by a centrifuge.", task: "Use a which-clause to explain the function of the centrifuge.", answer: "The syrup is then placed in a centrifuge, which separates sugar crystals from the remaining liquid." },
      { prompt: "The sugar is dried and cooled by a machine.", task: "Add the detail about where the sugar is dried and cooled.", answer: "Finally, the sugar is dried and cooled in a large container." },
    ],
    p2Band55: {
      text: [
        [0, ", sugar canes are grown for 12-18 months. The sugar canes are "],
        [1, " harvested by workers or machines. "],
        [2, " that, the sugar canes are crushed to make juice. "],
        [3, ", the juice is purified by a limestone filter. In the "],
        [4, " stage, the juice is turned into syrup by an evaporator. "],
        [5, " is to separate sugar crystals from the syrup by a centrifuge. "],
        [6, ", the sugar is dried and cooled by a machine."],
      ],
      answers: ["First", "then", "After", "Next", "next", "The following stage", "Finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "In the i______ stage, sugar canes are grown for 12-18 months.", answer: "initial" },
      { type: "fill", sentence: "The sugar canes are t______ harvested by workers or machines.", answer: "then" },
      { type: "fill", sentence: "A______ that, the sugar canes are crushed to make juice.", answer: "After" },
      { type: "fill", sentence: "The f______ stage is to purify the juice by a limestone filter.", answer: "following" },
      { type: "fill", sentence: "A__________, the juice is turned into syrup by an evaporator.", answer: "Afterwards" },
      { type: "fill", sentence: "S__________, sugar crystals are separated from the syrup by a centrifuge.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The juice is purified by a limestone filter.", "It is turned into syrup by an evaporator."], answer: "The juice is turned into syrup by an evaporator after being purified by a limestone filter." },
      { type: "combine", prompt: "Combine using after doing.", parts: ["Sugar crystals are separated from the syrup by a centrifuge.", "The sugar is dried and cooled by a machine."], answer: "The sugar is dried and cooled by a machine after the crystals are separated from the syrup by a centrifuge." },
    ],
    p2Band65: [
      { prompt: "Use 'Once ... has/have been done, ...' to connect two steps.", parts: ["Sugar canes are harvested by workers or machines.", "They are crushed to make juice."], answer: "Once the sugar canes have been harvested by workers or machines, they are crushed to make juice." },
      { prompt: "Combine using before doing.", parts: ["Sugar canes are grown for 12-18 months.", "They are harvested by workers or machines."], answer: "Sugar canes are grown for 12-18 months before being harvested by workers or machines." },
      { prompt: "Combine using after which.", parts: ["The juice is purified by a limestone filter.", "It is turned into syrup by an evaporator."], answer: "The juice is purified by a limestone filter, after which it is turned into syrup by an evaporator." },
      { prompt: "Combine using which is then done.", parts: ["The juice is turned into syrup by an evaporator.", "The syrup is processed in a centrifuge."], answer: "The juice is turned into syrup by an evaporator, which is then processed in a centrifuge." },
      { prompt: "Combine using followed by + noun phrase.", parts: ["The sugar canes are crushed to make juice.", "The juice is purified by a limestone filter."], answer: "The sugar canes are crushed to make juice, followed by the purification of the juice by a limestone filter." },
    ],
  },

  noodles: {
    title: "Instant Noodles",
    task: "The diagram below shows the manufacturing process for instant noodles.",
    image: "https://daxue-oss.koocdn.com/upload/ti/sardine/2493000-2494000/2493115/259d8b9f612e40819d37e0fb928b572f.png",
    steps: [
      { active: "A truck transports flour from storage silos.", passive: "Flour is transported from storage silos by truck.", prompt6: "flour / transport / storage silos / truck" },
      { active: "Workers mix flour with water and oil in a mixer.", passive: "Flour is mixed with water and oil in a mixer.", prompt6: "flour / mix / water and oil / mixer" },
      { active: "Rollers press the dough into sheets.", passive: "The dough is pressed into sheets by rollers.", prompt6: "dough / press / sheets / rollers" },
      { active: "Machines cut the dough sheets into strips.", passive: "The dough sheets are cut into strips.", prompt6: "dough sheets / cut / strips" },
      { active: "Machines make the dough strips into noodle discs.", passive: "The dough strips are made into noodle discs.", prompt6: "dough strips / make / noodle discs" },
      { active: "Machines cook the noodle discs in oil and dry them.", passive: "The noodle discs are cooked in oil and then dried.", prompt6: "noodle discs / cook / oil / dry" },
      { active: "Machines put noodle discs, vegetables and spices into cups.", passive: "The noodle discs, vegetables and spices are put into cups.", prompt6: "noodle discs vegetables spices / put / cups" },
      { active: "Machines label and seal the cups.", passive: "The cups are labelled and sealed.", prompt6: "cups / label and seal" },
    ],
    band65: [
      { prompt: "Flour is transported from storage silos by truck.", task: "Add the destination shown in the diagram.", answer: "Flour is transported from storage silos to the production line by truck." },
      { prompt: "Flour is mixed with water and oil in a mixer.", task: "Use a where-clause to explain what happens in the mixer.", answer: "The flour is transferred to a mixer, where it is combined with water and oil to form dough." },
      { prompt: "The dough is pressed into sheets by rollers.", task: "Use pass through and a which-clause to explain the function of the rollers.", answer: "The dough passes through a series of rollers, which press it into thin sheets." },
      { prompt: "The dough sheets are cut into strips.", task: "Use a more specific verb and a so that-clause to link this step with the next one.", answer: "The dough sheets are sliced into strips so that they can be shaped into noodle discs." },
      { prompt: "The noodle discs, vegetables and spices are put into cups.", task: "Replace 'put' with a more natural verb and use together with.", answer: "The dried noodle discs are placed into cups together with vegetables and spices." },
    ],
    p2Band55: {
      text: [
        [0, ", flour is transported from storage silos by truck. Flour is "],
        [1, " mixed with water and oil in a mixer. "],
        [2, ", the dough is pressed into sheets by rollers. "],
        [3, " that, the dough sheets are cut into strips. "],
        [4, " is to make the dough strips into noodle discs. In the "],
        [5, " stage, the noodle discs are cooked in oil and then dried. The noodle discs, vegetables and spices are "],
        [6, " put into cups. "],
        [7, ", the cups are labelled and sealed."],
      ],
      answers: ["First", "then", "Next", "After", "The following stage", "next", "then", "Finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "In the i______ stage, flour is transported from storage silos by truck.", answer: "initial" },
      { type: "fill", sentence: "Flour is t______ mixed with water and oil in a mixer.", answer: "then" },
      { type: "fill", sentence: "A______ that, the dough is pressed into sheets by rollers.", answer: "After" },
      { type: "fill", sentence: "The f______ stage is to cut the dough sheets into strips.", answer: "following" },
      { type: "fill", sentence: "A__________, the dough strips are made into noodle discs.", answer: "Afterwards" },
      { type: "fill", sentence: "S__________, the noodle discs are cooked in oil and then dried.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The dough sheets are cut into strips.", "The dough strips are made into noodle discs."], answer: "The dough strips are made into noodle discs after being cut into strips." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil before being dried." },
      { type: "combine", prompt: "Combine using after doing.", parts: ["The noodle discs, vegetables and spices are put into cups.", "The cups are labelled and sealed."], answer: "The cups are labelled and sealed after the noodle discs, vegetables and spices are put into them." },
    ],
    p2Band65: [
      { prompt: "Use 'Once ... has/have been done, ...' to connect two steps.", parts: ["Flour is transported from storage silos by truck.", "It is mixed with water and oil in a mixer."], answer: "Once the flour has been transported from storage silos by truck, it is mixed with water and oil in a mixer." },
      { prompt: "Combine using before doing.", parts: ["The noodle discs are cooked in oil.", "They are dried."], answer: "The noodle discs are cooked in oil before being dried." },
      { prompt: "Combine using after which.", parts: ["Flour is mixed with water and oil in a mixer.", "The dough is pressed into sheets by rollers."], answer: "Flour is mixed with water and oil in a mixer, after which the dough is pressed into sheets by rollers." },
      { prompt: "Combine using which are then done.", parts: ["The dough is pressed into sheets by rollers.", "The sheets are cut into strips."], answer: "The dough is pressed into sheets by rollers, which are then cut into strips." },
      { prompt: "Combine using followed by + noun phrase.", parts: ["The dough sheets are cut into strips.", "The dough strips are made into noodle discs."], answer: "The dough sheets are cut into strips, followed by the formation of the strips into noodle discs." },
    ],
  },

  recycling: {
    title: "Plastic Bottle Recycling",
    task: "The diagram below shows the process for recycling plastic bottles.",
    image: "https://images.writing9.com/646839d3f987923ffa686b743b1950f9.png",
    steps: [
      { active: "People put plastic bottles in recycling bins.", passive: "Plastic bottles are placed in recycling bins.", prompt6: "plastic bottles / place / recycling bins" },
      { active: "A truck collects and transports plastic bottles.", passive: "Plastic bottles are collected and transported by truck.", prompt6: "plastic bottles / collect and transport / truck" },
      { active: "Workers sort plastic bottles in a recycling centre.", passive: "Plastic bottles are sorted in a recycling centre.", prompt6: "plastic bottles / sort / recycling centre" },
      { active: "Machines compress plastic bottles into blocks.", passive: "Plastic bottles are compressed into blocks.", prompt6: "plastic bottles / compress / blocks" },
      { active: "Machines crush the blocks and wash the pieces.", passive: "The blocks are crushed and the pieces are washed.", prompt6: "blocks / crush / pieces / wash" },
      { active: "Machines produce plastic pellets.", passive: "Plastic pellets are produced.", prompt6: "plastic pellets / produce" },
      { active: "People heat the pellets to form raw material.", passive: "The pellets are heated to form raw material.", prompt6: "pellets / heat / raw material" },
      { active: "People pack the raw material.", passive: "The raw material is packed.", prompt6: "raw material / pack" },
      { active: "Factories produce end products.", passive: "End products are produced.", prompt6: "end products / produce" },
    ],
    band65: [
      { prompt: "Plastic bottles are put in recycling bins.", task: "Replace 'put' with a more natural verb.", answer: "Plastic bottles are placed in recycling bins." },
      { prompt: "Plastic bottles are collected and transported by truck.", task: "Use a which-clause to show how the bottles are moved to the next location.", answer: "The bins are emptied into a collection truck, which transports the bottles to a recycling centre." },
      { prompt: "Plastic bottles are sorted in a recycling centre.", task: "Add the conveyor belt detail and use a where-clause with manually and recyclable.", answer: "At the recycling centre, the bottles move along a conveyor belt, where recyclable bottles are manually sorted." },
      { prompt: "Plastic bottles are compressed into blocks.", task: "Use a so that-clause to explain the purpose of compression.", answer: "The recyclable bottles are compressed into blocks so that they can be handled and processed more easily." },
      { prompt: "The blocks are crushed into small pieces.", task: "Add the detail about the machine used to crush the blocks.", answer: "The blocks pass through a grinder, where they are crushed into small pieces." },
      { prompt: "The pieces are washed.", task: "Add the purpose of washing.", answer: "The small pieces are washed to remove dirt and impurities." },
      { prompt: "Plastic pellets are produced.", task: "Use ', doing sth' to show the result of the previous action.", answer: "The cleaned pieces are processed, producing plastic pellets." },
      { prompt: "The pellets are heated to form raw material.", task: "Replace 'form' with a more formal verb.", answer: "The pellets are heated and converted into raw material." },
      { prompt: "The raw material is packed.", task: "Add a phrase showing that the material is ready for the next stage.", answer: "The raw material is packed and prepared for manufacturing." },
      { prompt: "End products are produced.", task: "Use 'end products, including...' and add a final result phrase.", answer: "Finally, end products, including T-shirts, bags, pencils and containers, are manufactured, completing the recycling cycle." },
    ],
    p2Band55: {
      text: [
        [0, ", plastic bottles are placed in recycling bins. "],
        [1, " that, the plastic bottles are collected and transported by truck. "],
        [2, " is to sort the plastic bottles in a recycling centre. "],
        [3, ", the plastic bottles are compressed into blocks. The blocks are "],
        [4, " crushed and the pieces are washed. In the "],
        [5, " stage, plastic pellets are produced. The pellets are "],
        [6, " heated to form raw material. "],
        [7, ", end products are produced."],
      ],
      answers: ["First", "After", "The following stage", "Next", "then", "next", "then", "Finally"],
    },
    p2Band6: [
      { type: "fill", sentence: "In the i______ stage, plastic bottles are placed in recycling bins.", answer: "initial" },
      { type: "fill", sentence: "Plastic bottles are t______ collected and transported by truck.", answer: "then" },
      { type: "fill", sentence: "A______ that, plastic bottles are sorted in a recycling centre.", answer: "After" },
      { type: "fill", sentence: "The f______ stage is to compress the plastic bottles into blocks.", answer: "following" },
      { type: "fill", sentence: "A__________, the blocks are crushed and the pieces are washed.", answer: "Afterwards" },
      { type: "fill", sentence: "S__________, plastic pellets are produced.", answer: "Subsequently" },
      { type: "combine", prompt: "Combine using after doing.", parts: ["Plastic bottles are compressed into blocks.", "The blocks are crushed and the pieces are washed."], answer: "The blocks are crushed and the pieces are washed after being compressed into blocks." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." },
      { type: "combine", prompt: "Combine using before doing.", parts: ["The raw material is packed.", "It is used to produce end products."], answer: "The raw material is packed before being used to produce end products." },
    ],
    p2Band65: [
      { prompt: "Use 'Once ... has/have been done, ...' to connect two steps.", parts: ["Plastic bottles are collected and transported by truck.", "They are sorted in a recycling centre."], answer: "Once the plastic bottles have been collected and transported by truck, they are sorted in a recycling centre." },
      { prompt: "Combine using before doing.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced before being heated to form raw material." },
      { prompt: "Combine using after which.", parts: ["Plastic bottles are compressed into blocks.", "The blocks are crushed and the pieces are washed."], answer: "Plastic bottles are compressed into blocks, after which the blocks are crushed and the pieces are washed." },
      { prompt: "Combine using which are then done.", parts: ["Plastic pellets are produced.", "They are heated to form raw material."], answer: "Plastic pellets are produced, which are then heated to form raw material." },
      { prompt: "Combine using followed by + noun phrase.", parts: ["Plastic bottles are sorted in a recycling centre.", "They are compressed into blocks."], answer: "Plastic bottles are sorted in a recycling centre, followed by the compression of the bottles into blocks." },
    ],
  },
};

// =====================
// 4. LIGHTWEIGHT UI COMPONENTS
// =====================

const Card = memo(function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );
});

const Tab = memo(function Tab({ value, label, activePractice, onSelect }: { value: string; label: string; activePractice: string; onSelect: (v: string) => void }) {
  return (
    <button
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

// =====================
// 5. MAIN COMPONENT
// =====================

export default function IELTSProcessTrainerFullSystem() {
  const processData = useMemo(() => fixP2Band55Data(rawProcessData), []);

  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage("ielts-process-scores", {});
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [p1Hint, setP1Hint] = useState<HintState>({ index: null, text: "" });
  const [p2Hint, setP2Hint] = useState<HintState>({ index: null, text: "" });
  const [writingHint, setWritingHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ errors?: { type: string; original?: string }[] } | null>(null);
  const [band6SelfCheckVisible, setBand6SelfCheckVisible] = useState(false);
  const [band6Checklist, setBand6Checklist] = useState<Band6Checklist>({
    pronouns: false,
    details: false,
    structure: false,
  });
  const [band65SelfCheckVisible, setBand65SelfCheckVisible] = useState(false);
  const [band65Checklist, setBand65Checklist] = useState<Band65Checklist>({
    details: false,
    complexStructure: false,
    stageLogic: false,
  });
  const [p3TimerStarted, setP3TimerStarted] = useState(false);
  const [p3ElapsedSeconds, setP3ElapsedSeconds] = useState(0);
  const suggestedWritingSeconds = 20 * 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!p3TimerStarted) return;
    const timer = setInterval(() => {
      setP3ElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [p3TimerStarted]);

  const current = processData[processKey];
  const steps = current.steps;
  const scoreKey = `${processKey}-${level}`;
  const earned: ScoreEntry = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore <= 3 ? "Bronze" : totalScore <= 7 ? "Silver" : "Gold";

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint({ index: null, text: "" });
    setP2Hint({ index: null, text: "" });
    setWritingHint("");
    setAiFeedback(null);
    setAiLoading(false);
    setBand6SelfCheckVisible(false);
    setBand6Checklist({ pronouns: false, details: false, structure: false });
    setBand65SelfCheckVisible(false);
    setBand65Checklist({ details: false, complexStructure: false, stageLogic: false });
    setDragItem(null);
    setP3TimerStarted(false);
    setP3ElapsedSeconds(0);
  }, []);

  const handleProcessOrLevelChange = useCallback(
    (newProcess: string, newLevel: string) => {
      setProcessKey(newProcess || processKey);
      setLevel(newLevel || level);
      resetAllPracticeStates();
    },
    [processKey, level, resetAllPracticeStates]
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
      return steps.map((s: StepType) => ({ prompt: s.active, answer: s.passive, instruction: "Rewrite the active sentence in the passive voice." }));
    }
    if (level === "band6") {
      return steps.map((s: StepType) => ({ prompt: s.prompt6, answer: s.passive, instruction: "Use the words and the diagram to write a complete passive sentence." }));
    }
    return current.band65.map((s: Band65Task) => ({ prompt: s.prompt, answer: s.answer, instruction: s.task }));
  }, [level, current, steps]);

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
      if (level === "band55") {
        setP1Hint({ index, text: "Move the object to the subject position and use be + past participle." });
      } else if (level === "band6") {
        setP1Hint({ index, text: "Use be + past participle. Check the diagram for prepositions and details." });
      } else {
        setP1Hint({ index, text: practice1Tasks[index].instruction });
      }
    },
    [level, practice1Tasks]
  );

  // =====================
  // PRACTICE 2
  // =====================

  const linkerOptions = ["After", "Next", "then", "Finally", "The following stage", "next", "First"];

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
    const feedback = expected.map((answer: string, i: number) => {
      return practiceState.p2ParagraphAnswers[i] === answer;
    });
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    if (feedback.length > 0 && feedback.every(Boolean)) {
      award("p2");
    }
  }, [current, practiceState.p2ParagraphAnswers, award]);

  const getCohesionTasks = useCallback((): CohesionTask[] => (level === "band6" ? current.p2Band6 : current.p2Band65), [level, current]);

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
      setP2Hint({ index: null, text: "Structure: 'then' can go inside a sentence; 'after' goes before 'that'; 'the following stage is to + verb'; 'in the next stage' fits the pattern 'In the ___ stage'." });
    } else if (level === "band6") {
      setP2Hint({ index: null, text: "Band 6: For linker fill-ins, pay attention to position. Some linkers go at the beginning of a sentence, while 'then' can go after the be verb in a passive sentence. For combining, use before/after + being + past participle." });
    } else {
      setP2Hint({ index: null, text: "Band 6.5: check the target structure: followed by + noun phrase, before/after + being done, or after which + clause." });
    }
  }, [level]);

  const renderBlank = (index: number) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        onDragOver={(e: React.DragEvent) => e.preventDefault()}
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
      {current.p2Band55.text.map((chunk: [number, string], i: number) => (
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

  const wordCount = practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordRequirement = level === "band55" ? 70 : level === "band6" ? 80 : 100;
  const wordTargetRange = level === "band55" ? "70-80" : level === "band6" ? "80-100" : "100-120";
  const reflectionComplete = practiceState.p3Reflection.every((item: string) => item.trim().length > 0);
  const aiChecked = Boolean(aiFeedback);
  const aiErrors = Array.isArray(aiFeedback?.errors) ? aiFeedback.errors : [];
  const aiGrammarCount = aiErrors.filter((e: { type: string }) => e.type === "grammar").length;
  const aiLexisCount = aiErrors.filter((e: { type: string }) => e.type === "lexis").length;
  const aiSpellingCount = aiErrors.filter((e: { type: string }) => e.type === "spelling").length;
  const aiCohesionCount = aiErrors.filter((e: { type: string }) => e.type === "cohesion").length;
  const aiTaskCount = aiErrors.filter((e: { type: string }) => e.type === "task").length;
  const band6ChecklistComplete =
    level !== "band6" ||
    (band6Checklist.pronouns && band6Checklist.details && band6Checklist.structure);
  const band65ChecklistComplete =
    level !== "band65" ||
    (band65Checklist.details && band65Checklist.complexStructure && band65Checklist.stageLogic);
  const p3Pass = aiChecked && aiErrors.length === 0 && reflectionComplete;

  const getWritingHint = useCallback(() => {
    if (!practiceState.p3Submitted) {
      if (level === "band55") {
        setWritingHint("Band 5.5: Use present simple passive to describe the process. Add basic linkers such as First, Then, Finally.");
      } else if (level === "band6") {
        setWritingHint("Band 6: Use present simple passive and a range of linkers. Use pronouns such as it, they or them to avoid repetition.");
      } else {
        setWritingHint("Band 6.5: Use present simple passive, include more diagram details, and combine sentences using complex structures such as after which, followed by, and before/after being done.");
      }
      return;
    }

    if (aiErrors.length > 0) {
      setWritingHint("AI has marked the error types only. Revise the paragraph yourself and run AI Check again.");
      return;
    }

    if (!reflectionComplete) {
      setWritingHint("No language errors were detected by AI. Complete all 3 self-reflection points to pass.");
      return;
    }

    setWritingHint("Well done. All errors corrected and reflection completed.");
  }, [practiceState.p3Submitted, level, aiErrors.length, reflectionComplete]);

  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  const handleBand6SelfCheck = useCallback(() => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your paragraph before completing the self-checklist.");
      return;
    }

    if (wordCount < wordRequirement) {
      setWritingHint(`Please write at least ${wordRequirement} words first. Target range: ${wordTargetRange} words. Current: ${wordCount}.`);
      return;
    }

    setWritingHint("");
    setBand6SelfCheckVisible(true);
  }, [practiceState.p3Writing, wordCount, wordRequirement, wordTargetRange]);

  const handleBand65SelfCheck = useCallback(() => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your paragraph before completing the self-checklist.");
      return;
    }

    if (wordCount < wordRequirement) {
      setWritingHint(`Please write at least ${wordRequirement} words first. Target range: ${wordTargetRange} words. Current: ${wordCount}.`);
      return;
    }

    setWritingHint("");
    setBand65SelfCheckVisible(true);
  }, [practiceState.p3Writing, wordCount, wordRequirement, wordTargetRange]);

  const getAIFeedback = useCallback(async () => {
    if (level === "band6" && !band6ChecklistComplete) {
      setWritingHint("Complete the self-checklist before using AI Check.");
      return;
    }

    if (level === "band65" && !band65ChecklistComplete) {
      setWritingHint("Complete the self-checklist before using AI Check.");
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processTitle: current.title,
          processTask: current.task,
          level,
          writing: practiceState.p3Writing,
          feedbackMode: "error-types-only",
          instruction: "Mark language error types only. Do not provide corrected answers or rewritten sentences. Return original phrases and error types only.",
        }),
      });

      if (!response.ok) {
        throw new Error("AI feedback request failed.");
      }

      const data = await response.json();
      setAiFeedback(data);
      setPracticeState((prev) => ({ ...prev, p3Submitted: true }));
    } catch (error) {
      console.error(error);
      setWritingHint("AI feedback is temporarily unavailable. Please check the backend API route or try again later.");
    } finally {
      setAiLoading(false);
    }
  }, [practiceState.p3Writing, current.title, current.task, level, wordCount, wordRequirement, wordTargetRange, band6ChecklistComplete, band65ChecklistComplete]);

  const p3Band6GuidingQuestions = [
    "Which repeated nouns can be replaced by it, they or them?",
    "Which useful diagram details should be included, such as time, tools, machines, materials or final products?",
    "Can you use one structure from Practice 2, such as before/after being done?",
  ];

  const p3Band65DiagramDetails: Record<string, string[]> = {
    bamboo: [
      "time details: spring and autumn",
      "material changes: bamboo plants -> strips -> liquid pulp -> fibres -> yarn -> fabric",
      "tools/materials: filter, water and amine oxide",
      "final examples: clothes and socks",
      "repeated nouns: bamboo plants / fibres / yarn / fabric",
    ],
    sugar: [
      "time detail: 12-18 months",
      "harvesting method: by workers or machines",
      "machines/equipment: crusher, limestone filter, evaporator, centrifuge",
      "material changes: sugar canes -> juice -> syrup -> sugar crystals -> sugar",
      "repeated nouns: sugar canes / juice / syrup / sugar crystals",
    ],
    noodles: [
      "starting material: flour from storage silos",
      "ingredients: water and oil",
      "machines/equipment: mixer and rollers",
      "shape changes: dough -> sheets -> strips -> noodle discs",
      "packaging details: cups, vegetables, spices, labels and seals",
      "repeated nouns: flour / dough / noodle discs / cups",
    ],
    recycling: [
      "locations: recycling bins and recycling centre",
      "transport: by truck",
      "shape changes: bottles -> blocks -> pieces -> pellets -> raw material",
      "final examples: T-shirts, bags, pencils and containers",
      "repeated nouns: plastic bottles / blocks / pieces / pellets / raw material",
    ],
  };

  const renderAIErrorMarker = (error: { type: string; original?: string }, index: number) => {
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

  const renderPractice1 = () => (
    <Card title={level === "band55" ? "Practice 1 - Active to Passive" : "Practice 1 - Passive Voice / Sentence Upgrade"}>
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{level === "band55" ? `Stage ${i + 1}` : `Task ${i + 1}`}</p>
            {level !== "band55" && <p className="mt-1 font-medium">{task.instruction}</p>}
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            {p1Hint.index === i && p1Hint.text && <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p1Hint.text}</div>}
            <input
              value={practiceState.p1Answers[i] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPracticeState((prev) => ({ ...prev, p1Answers: { ...prev.p1Answers, [i]: e.target.value } }))}
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
    </Card>
  );

  const renderPractice2 = () => {
    if (level === "band55") {
      return (
        <Card title="Practice 2 - Cohesive Devices">
          <div className="rounded-2xl border bg-slate-50 p-5">{renderBand55Paragraph()}</div>
          {p2Hint.text && <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint.text}</div>}
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
          {practiceState.p2ParagraphFeedback.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {practiceState.p2ParagraphFeedback.map((ok: boolean, i: number) => (
                <div key={i} className={`rounded-xl border p-3 text-sm ${ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  Blank {i + 1}: {ok ? "Correct" : "Check again"}
                </div>
              ))}
            </div>
          )}
        </Card>
      );
    }

    const tasks: CohesionTask[] = level === "band6" ? current.p2Band6 : current.p2Band65;
    return (
      <Card title="Practice 2 - Cohesive Devices">
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
              {task.type === "fill" ? (
                <p className="mt-2 rounded-lg bg-white p-3">{task.sentence}</p>
              ) : (
                <div className="mt-2 rounded-lg bg-white p-3">
                  <p className="font-semibold">{task.prompt}</p>
                  {Array.isArray(task.parts) && (
                    <>
                      <p>1. {task.parts[0]}</p>
                      <p>2. {task.parts[1]}</p>
                    </>
                  )}
                </div>
              )}
              {p2Hint.text && <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint.text}</div>}
              <input
                value={practiceState.p2CohesionAnswers[i] || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPracticeState((prev) => ({ ...prev, p2CohesionAnswers: { ...prev.p2CohesionAnswers, [i]: e.target.value } }))}
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
      </Card>
    );
  };

  const renderPractice3 = () => (
    <Card title="Practice 3 - Timed Writing - Body Paragraph">
      <div className="mb-4 rounded-2xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-800">Suggested time: within 20 minutes</p>
            <p className="mt-1 text-sm text-slate-600">
              Timer: {formatTime(p3ElapsedSeconds)} / 20:00
            </p>
          </div>
          <button
            onClick={() => {
              setP3TimerStarted(false);
              setP3ElapsedSeconds(0);
            }}
            className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
          >
            Reset Timer
          </button>
        </div>

        {p3ElapsedSeconds > suggestedWritingSeconds && (
          <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
            You have passed the suggested 20-minute limit. Try to finish and review your paragraph.
          </div>
        )}
      </div>
      {level === "band6" && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-800">Before AI Check</p>
              <p className="mt-1 text-sm text-slate-600">Tick the boxes only if you have checked your paragraph carefully.</p>
            </div>
            <button
              onClick={handleBand6SelfCheck}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            >
              Submit for Self-check
            </button>
          </div>

          {band6SelfCheckVisible && (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band6Checklist.pronouns}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand6Checklist((prev) => ({ ...prev, pronouns: e.target.checked }))}
                />
                <span>Have you replaced repeated nouns with pronouns such as it, they or them?</span>
              </label>
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band6Checklist.details}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand6Checklist((prev) => ({ ...prev, details: e.target.checked }))}
                />
                <span>Have you included useful diagram details, such as time, tools, machines, materials or final products?</span>
              </label>
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band6Checklist.structure}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand6Checklist((prev) => ({ ...prev, structure: e.target.checked }))}
                />
                <span>Have you used at least one structure from Practice 2, such as before/after being done?</span>
              </label>
            </div>
          )}
        </div>
      )}

      {level === "band65" && (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-800">Before AI Check</p>
              <p className="mt-1 text-sm text-slate-600">Tick the boxes only if you have checked your paragraph carefully.</p>
            </div>
            <button
              onClick={handleBand65SelfCheck}
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            >
              Submit for Self-check
            </button>
          </div>

          {band65SelfCheckVisible && (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band65Checklist.details}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand65Checklist((prev) => ({ ...prev, details: e.target.checked }))}
                />
                <span>Have you included specific diagram details, such as tools, machines, materials, locations or final examples?</span>
              </label>
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band65Checklist.complexStructure}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand65Checklist((prev) => ({ ...prev, complexStructure: e.target.checked }))}
                />
                <span>Have you used at least one structure from Practice 2, such as &apos;Once ... has/have been done&apos;, &apos;after which&apos;, or &apos;which is/are then done&apos;?</span>
              </label>
              <label className="flex gap-2 rounded-xl border bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={band65Checklist.stageLogic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBand65Checklist((prev) => ({ ...prev, stageLogic: e.target.checked }))}
                />
                <span>Have you grouped neighbouring steps logically instead of listing every step mechanically?</span>
              </label>
            </div>
          )}
        </div>
      )}

      <textarea
        value={practiceState.p3Writing}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const value = e.target.value;
          setPracticeState((prev) => ({ ...prev, p3Writing: value, p3Submitted: false }));
          if (!p3TimerStarted && value.trim().length > 0) {
            setP3TimerStarted(true);
          }
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
          disabled={aiLoading || !practiceState.p3Writing.trim() || wordCount < wordRequirement || (level === "band6" && !band6ChecklistComplete) || (level === "band65" && !band65ChecklistComplete)}
          className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${aiLoading || !practiceState.p3Writing.trim() || wordCount < wordRequirement || (level === "band6" && !band6ChecklistComplete) || (level === "band65" && !band65ChecklistComplete) ? "bg-slate-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
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
            <input key={i} value={item} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPracticeState((prev) => { const copy = [...prev.p3Reflection]; copy[i] = e.target.value; return { ...prev, p3Reflection: copy }; })} className="w-full rounded-xl border p-2" placeholder={`Reflection ${i + 1}`} />
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
            <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">IELTS Academic Writing Task 1</p><h1 className="mt-1 text-3xl font-bold">Diagrams Writing Training System</h1></div>
            <div className="flex flex-wrap gap-3">
              <select value={processKey} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProcessOrLevelChange(e.target.value, level)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><option value="bamboo">Bamboo fabric</option><option value="sugar">Sugar canes</option><option value="noodles">Instant noodles</option><option value="recycling">Recycling</option></select>
              <select value={level} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProcessOrLevelChange(processKey, e.target.value)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"><option value="band55">Band 5.5</option><option value="band6">Band 6</option><option value="band65">Band 6.5</option></select>
            </div>
          </div>
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold">{current.title}</p>
            <p className="text-sm text-slate-600">{current.task}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${totalScore * 10}%` }} />
            </div>
            <p className="mt-2 text-lg font-bold text-blue-700">Score: {totalScore} / 10 - {achievement}</p>
            <p className="text-sm text-slate-500">Practice 1: {earned.p1 ? "+2 earned" : "2 pts"} - Practice 2: {earned.p2 ? "+3 earned" : "3 pts"} - Practice 3: {earned.p3 ? "+5 earned" : "5 pts"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Diagram</h2>
            <Image
              src={current.image}
              alt={current.title}
              width={600}
              height={400}
              className="w-full rounded-xl border object-contain"
              unoptimized
            />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist">
              <Tab value="practice1" label="Practice 1" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice2" label="Practice 2" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice3" label="Practice 3" activePractice={activePractice} onSelect={setActivePractice} />
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
