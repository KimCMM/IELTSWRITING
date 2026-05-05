import { memo, useCallback, useEffect, useMemo, useState } from "react";

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
      setStoredValue((prev) => {
        const value =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(prev)
            : valueOrUpdater;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
        return value;
      });
    },
    [key],
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
  const matchedWords = expectedWords.filter((word) => userWords.includes(word));
  return matchedWords.length / expectedWords.length >= tolerance;
};

const isAnswerCorrect = (user, expected, level) =>
  level === "band65" ? fuzzyMatch(user, expected, 0.82) : normalize(user) === normalize(expected);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const initialPracticeState = {
  p1Answers: {},
  p1Feedback: {},
  p1ReflectionAnswers: {},
  p1ReflectionFeedback: null,
  p1ReflectionChecked: false,
  p2ParagraphAnswers: Array(10).fill(""),
  p2ParagraphFeedback: [],
  p2CohesionAnswers: {},
  p2CohesionFeedback: {},
  p2LinkerJudgementAnswers: {},
  p2LinkerJudgementFeedback: null,
  p2LinkerJudgementChecked: false,
  p2LinkerJudgementHint: null,
  p3Writing: "",
  p3Reflection: ["", "", ""],
};

const processData = {
  bamboo: {
    title: "Bamboo Fabric",
    task: "The diagram below shows how fabric is manufactured from bamboo.",
    image:
      "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
    steps: [
      ["People plant bamboo plants in spring.", "Bamboo plants are planted in spring.", "bamboo plants / plant / spring"],
      ["People harvest bamboo plants in autumn.", "Bamboo plants are harvested in autumn.", "bamboo plants / harvest / autumn"],
      ["A machine cuts bamboo plants into strips.", "Bamboo plants are cut into strips.", "bamboo plants / cut / strips"],
      ["A machine crushes the strips to make liquid pulp.", "The strips are crushed to make liquid pulp.", "strips / crush / liquid pulp"],
      ["A filter separates long fibres from the liquid.", "Long fibres are separated from the liquid by a filter.", "long fibres / separate / liquid / filter"],
      ["People add water and amine oxide to soften the fibres.", "Water and amine oxide are added to soften the fibres.", "water and amine oxide / add / soften fibres"],
      ["People spin fibres to make yarn.", "Fibres are spun to make yarn.", "fibres / spin / yarn"],
      ["People weave yarn to make fabric.", "Yarn is woven to make fabric.", "yarn / weave / fabric"],
      ["People use fabric to make clothes.", "Fabric is used to make clothes.", "fabric / use / clothes"],
    ],
    band65: [
      ["Bamboo plants are planted in spring.", "Replace 'planted' with a more formal verb.", "Bamboo plants are cultivated in spring."],
      ["Bamboo is harvested in autumn.", "Add how the harvesting is shown in the diagram.", "Bamboo is harvested manually in autumn."],
      ["Bamboo is cut into strips.", "Add an adverb to show machine processing and describe the strips as narrow.", "Bamboo is mechanically cut into narrow strips."],
      ["The strips are crushed.", "Use ', doing sth' to show the result of the action.", "The strips are crushed, producing liquid pulp."],
      ["The liquid pulp passes through a filter.", "Use a which-clause to explain the function of the filter.", "The liquid pulp passes through a filter, which extracts long fibres from the remaining liquid."],
      ["Fabric is made into clothes.", "Use 'finished fabric' and add examples from the diagram.", "The finished fabric is made into clothing items such as T-shirts and socks."],
    ],
    p2Band55: {
      text: [[0, ", bamboo plants are planted in spring. Bamboo plants are "], [1, " harvested in autumn. "], [2, " that, bamboo plants are cut into strips. "], [3, " is to crush the strips to make liquid pulp. "], [4, ", long fibres are separated from the liquid by a filter. In the "], [5, " stage, water and amine oxide are added to soften the fibres. The fibres are "], [6, " spun to make yarn. "], [7, ", yarn is woven to make fabric."]],
      answers: ["First", "then", "After", "The following stage", "Next", "next", "then", "Finally"],
    },
  },
  sugar: {
    title: "Sugar Canes",
    task: "The diagram below shows how sugar is produced from sugar canes.",
    image:
      "https://daxue-oss.koocdn.com/upload/ti/sardine/2521000-2522000/2521817/3395c3236ee34b9089e15f2ce4dfc9a9.png",
    steps: [
      ["Farmers grow sugar canes for 12-18 months.", "Sugar canes are grown for 12-18 months.", "sugar canes / grow / 12-18 months"],
      ["Workers or machines harvest the sugar canes.", "The sugar canes are harvested by workers or machines.", "sugar canes / harvest / workers or machines"],
      ["Machines crush the sugar canes to make juice.", "The sugar canes are crushed to make juice.", "sugar canes / crush / juice"],
      ["A limestone filter purifies the juice.", "The juice is purified by a limestone filter.", "juice / purify / limestone filter"],
      ["An evaporator turns the juice into syrup.", "The juice is turned into syrup by an evaporator.", "juice / turn / syrup / evaporator"],
      ["A centrifuge separates sugar crystals from the syrup.", "Sugar crystals are separated from the syrup by a centrifuge.", "sugar crystals / separate / syrup / centrifuge"],
      ["A machine dries and cools the sugar.", "The sugar is dried and cooled by a machine.", "sugar / dry and cool / machine"],
    ],
    band65: [
      ["Sugar canes are grown for 12-18 months.", "Replace 'grown' with a more formal verb.", "Sugar canes are cultivated for 12-18 months."],
      ["Sugar canes are harvested by workers or machines.", "Use 'either...or...' and add the adverbs 'manually' and 'mechanically'.", "Sugar canes are harvested either manually by workers or mechanically by machines."],
      ["The sugar canes are crushed.", "Use ', doing sth' to show the result of the action.", "The sugar canes are crushed, producing juice."],
      ["The juice passes through a limestone filter.", "Use 'in order to' to explain the purpose of filtering.", "The juice passes through a limestone filter in order to remove impurities."],
      ["The syrup is placed in a centrifuge.", "Use a which-clause to explain the function of the centrifuge.", "The syrup is placed in a centrifuge, which separates sugar crystals from the remaining liquid."],
      ["The sugar is dried and cooled.", "Add the detail about where this happens.", "The sugar is dried and cooled in a large container."],
    ],
    p2Band55: {
      text: [[0, ", sugar canes are grown for 12-18 months. The sugar canes are "], [1, " harvested by workers or machines. "], [2, " that, the sugar canes are crushed to make juice. "], [3, ", the juice is purified by a limestone filter. In the "], [4, " stage, the juice is turned into syrup by an evaporator. "], [5, " is to separate sugar crystals from the syrup by a centrifuge. "], [6, ", the sugar is dried and cooled by a machine."]],
      answers: ["First", "then", "After", "Next", "next", "The following stage", "Finally"],
    },
  },
  noodles: {
    title: "Instant Noodles",
    task: "The diagram below shows the manufacturing process for instant noodles.",
    image:
      "https://daxue-oss.koocdn.com/upload/ti/sardine/2493000-2494000/2493115/259d8b9f612e40819d37e0fb928b572f.png",
    steps: [
      ["A truck transports flour from storage silos.", "Flour is transported from storage silos by truck.", "flour / transport / storage silos / truck"],
      ["Workers mix flour with water and oil in a mixer.", "Flour is mixed with water and oil in a mixer.", "flour / mix / water and oil / mixer"],
      ["Rollers press the dough into sheets.", "The dough is pressed into sheets by rollers.", "dough / press / sheets / rollers"],
      ["Machines cut the dough sheets into strips.", "The dough sheets are cut into strips.", "dough sheets / cut / strips"],
      ["Machines make the dough strips into noodle discs.", "The dough strips are made into noodle discs.", "dough strips / make / noodle discs"],
      ["Machines cook the noodle discs in oil and dry them.", "The noodle discs are cooked in oil and then dried.", "noodle discs / cook / oil / dry"],
      ["Machines put noodle discs, vegetables and spices into cups.", "The noodle discs, vegetables and spices are put into cups.", "noodle discs vegetables spices / put / cups"],
      ["Machines label and seal the cups.", "The cups are labelled and sealed.", "cups / label and seal"],
    ],
    band65: [
      ["Flour is transported from storage silos by truck.", "Add the destination shown in the diagram.", "Flour is transported from storage silos to the production line by truck."],
      ["Flour is mixed with water and oil in a mixer.", "Use 'in order to' to explain the purpose of mixing.", "Flour is mixed with water and oil in a mixer in order to form dough."],
      ["The dough is pressed into sheets by rollers.", "Use 'pass through' and a which-clause to explain the function of the rollers.", "The dough passes through rollers, which press it into sheets."],
      ["The dough sheets are cut into strips.", "Replace 'cut' with a more precise verb.", "The dough sheets are sliced into strips."],
      ["The dough strips are shaped.", "Use ', doing sth' to show the result of the action.", "The dough strips are shaped, producing noodle discs."],
      ["The noodle discs, vegetables and spices are put into cups.", "Replace 'put' with a more natural verb and use 'together with'.", "The noodle discs are placed into cups together with vegetables and spices."],
    ],
    p2Band55: {
      text: [[0, ", flour is transported from storage silos by truck. Flour is "], [1, " mixed with water and oil in a mixer. "], [2, ", the dough is pressed into sheets by rollers. "], [3, " that, the dough sheets are cut into strips. "], [4, " is to make the dough strips into noodle discs. In the "], [5, " stage, the noodle discs are cooked in oil and then dried. The noodle discs, vegetables and spices are "], [6, " put into cups. "], [7, ", the cups are labelled and sealed."]],
      answers: ["First", "then", "Next", "After", "The following stage", "next", "then", "Finally"],
    },
  },
  recycling: {
    title: "Plastic Bottle Recycling",
    task: "The diagram below shows the process for recycling plastic bottles.",
    image: "https://images.writing9.com/646839d3f987923ffa686b743b1950f9.png",
    steps: [
      ["People put plastic bottles in recycling bins.", "Plastic bottles are placed in recycling bins.", "plastic bottles / place / recycling bins"],
      ["A truck collects and transports plastic bottles.", "Plastic bottles are collected and transported by truck.", "plastic bottles / collect and transport / truck"],
      ["Workers sort plastic bottles in a recycling centre.", "Plastic bottles are sorted in a recycling centre.", "plastic bottles / sort / recycling centre"],
      ["Machines compress plastic bottles into blocks.", "Plastic bottles are compressed into blocks.", "plastic bottles / compress / blocks"],
      ["Machines crush the blocks and wash the pieces.", "The blocks are crushed and the pieces are washed.", "blocks / crush / pieces / wash"],
      ["Machines produce plastic pellets.", "Plastic pellets are produced.", "plastic pellets / produce"],
      ["People heat the pellets to form raw material.", "The pellets are heated to form raw material.", "pellets / heat / raw material"],
      ["People pack the raw material.", "The raw material is packed.", "raw material / pack"],
      ["Factories produce end products.", "End products are produced.", "end products / produce"],
    ],
    band65: [
      ["Plastic bottles are put in recycling bins.", "Replace 'put' with a more natural verb.", "Plastic bottles are placed in recycling bins."],
      ["Plastic bottles are collected by a collection truck.", "Use a which-clause to show the truck's function.", "Plastic bottles are collected by a collection truck, which transports them to a recycling centre."],
      ["Plastic bottles are sorted in a recycling centre.", "Use 'conveyor belt', 'manually' and 'recyclable'.", "In a recycling centre, recyclable bottles are manually sorted on a conveyor belt."],
      ["The blocks are crushed into small pieces.", "Use 'pass through' and add the machine detail from the diagram.", "The blocks pass through a grinder and are crushed into small pieces."],
      ["The small pieces are washed.", "Add the purpose of washing.", "The small pieces are washed to remove dirt and impurities."],
      ["The cleaned pieces are processed.", "Use ', doing sth' to show the result of the action.", "The cleaned pieces are processed, producing plastic pellets."],
      ["The pellets are heated to form raw material.", "Replace 'form' with a more formal verb.", "The pellets are heated and converted into raw material."],
      ["End products are produced.", "Use 'end products, including...' and include examples from the diagram.", "End products, including T-shirts, bags, pencils and containers, are produced."],
    ],
    p2Band55: {
      text: [[0, ", plastic bottles are placed in recycling bins. "], [1, " that, the plastic bottles are collected and transported by truck. "], [2, " is to sort the plastic bottles in a recycling centre. "], [3, ", the plastic bottles are compressed into blocks. The blocks are "], [4, " crushed and the pieces are washed. In the "], [5, " stage, plastic pellets are produced. The pellets are "], [6, " heated to form raw material. "], [7, ", end products are produced."]],
      answers: ["First", "After", "The following stage", "Next", "then", "next", "then", "Finally"],
    },
  },
};

Object.values(processData).forEach((item) => {
  item.steps = item.steps.map(([active, passive, prompt6]) => ({ active, passive, prompt6 }));
  item.band65 = item.band65.map(([prompt, task, answer]) => ({ prompt, task, answer }));
});

const band55PassiveCorrectionTasks = {
  bamboo: [
    ["Bamboo plants planted in spring.", "Bamboo plants are planted in spring."],
    ["Bamboo plants are harvest in autumn.", "Bamboo plants are harvested in autumn."],
    ["The strips is crushed to make liquid pulp.", "The strips are crushed to make liquid pulp."],
  ],
  sugar: [
    ["Sugar canes are grow for 12-18 months.", "Sugar canes are grown for 12-18 months."],
    ["The sugar canes harvested by workers or machines.", "The sugar canes are harvested by workers or machines."],
    ["Sugar crystals is separated from the syrup by a centrifuge.", "Sugar crystals are separated from the syrup by a centrifuge."],
  ],
  noodles: [
    ["Flour transported from storage silos by truck.", "Flour is transported from storage silos by truck."],
    ["The dough sheets is cut into strips.", "The dough sheets are cut into strips."],
    ["The noodle discs are cook in oil and dried.", "The noodle discs are cooked in oil and dried."],
  ],
  recycling: [
    ["Plastic pellets is produced.", "Plastic pellets are produced."],
    ["Plastic bottles are collect and transported by truck.", "Plastic bottles are collected and transported by truck."],
    ["End products produced.", "End products are produced."],
  ],
};

const band6ProcessCorrectionTasks = {
  bamboo: [
    ["Bamboo plants are harvest in autumn.", "Bamboo plants are harvested in autumn."],
    ["The strips is crushed to make liquid pulp.", "The strips are crushed to make liquid pulp."],
    ["Water and amine oxide are added soften the fibres.", "Water and amine oxide are added to soften the fibres."],
  ],
  sugar: [
    ["Sugar canes are grow for 12-18 months.", "Sugar canes are grown for 12-18 months."],
    ["The juice are purified by a limestone filter.", "The juice is purified by a limestone filter."],
    ["The sugar is dried and cooling by a machine.", "The sugar is dried and cooled by a machine."],
  ],
  noodles: [
    ["Flour is transported from storage silos by a truck.", "Flour is transported from storage silos by truck."],
    ["Flour is mixed water and oil in a mixer.", "Flour is mixed with water and oil in a mixer."],
    ["The noodle discs are cook in oil and dried.", "The noodle discs are cooked in oil and dried."],
  ],
  recycling: [
    ["Plastic pellets is produced.", "Plastic pellets are produced."],
    ["Plastic bottles are collect and transported by truck.", "Plastic bottles are collected and transported by truck."],
    ["The pieces are washed remove dirt.", "The pieces are washed to remove dirt."],
  ],
};

const reflectionOptions = [
  ["relativeClause", 'Use a relative clause, such as "which..." or "where...".', true],
  ["purposePhrase", 'Use a purpose phrase, such as "in order to...".', true],
  ["participleResult", 'Use ", doing sth" to show the result of an action.', true],
  ["diagramDetails", "Add useful diagram details, such as tools, machines, materials, locations or final examples.", true],
  ["preciseWords", "Replace basic words with more precise words.", true],
  ["personalOpinions", "Add personal opinions about whether the process is good or bad.", false],
  ["inventSteps", "Invent extra steps that are not shown in the diagram.", false],
  ["complicatedWords", "Use complicated words even if they do not fit the diagram.", false],
].map(([id, text, correct]) => ({ id, text, correct }));

const linkerJudgementTasks = {
  bamboo: [
    ["bambooThenMiddle", "The fibres are then spun to make yarn.", true, "'Then' can be used in the middle of a passive sentence, usually after the be-verb."],
    ["bambooAfterThat", "After, bamboo plants are cut into strips.", false, "Use 'After that,' to connect the next step. Do not use 'After,' alone here."],
    ["bambooFollowingStage", "The following stage is to crush the strips.", true, "After 'is to', use the base form of a verb, such as 'crush'."],
  ],
  sugar: [
    ["sugarThenBeginning", "Then, the sugar canes are harvested.", true, "'Then' can be used at the beginning of a sentence to show the next step."],
    ["sugarInNextStage", "In the next stage, the juice is turned into syrup.", true, "After 'In the next stage,', use a complete sentence."],
    ["sugarIsToWrongForm", "The following stage is to separated sugar crystals.", false, "After 'is to', use the base verb. Use 'separate', not 'separated'."],
  ],
  noodles: [
    ["noodlesThenBeginning", "Then, the dough is pressed into sheets.", true, "'Then' can be placed at the beginning of a sentence."],
    ["noodlesAfterThatComplete", "After that, the dough sheets are cut into strips.", true, "'After that,' is a complete linker for moving to the next step."],
    ["noodlesInNextStageWrong", "In the next stage is to make the dough strips into noodle discs.", false, "Do not mix 'In the next stage, ...' and 'The next stage is to...'."],
  ],
  recycling: [
    ["recyclingNextStageComplete", "In the next stage, plastic pellets are produced.", true, "'In the next stage,' should be followed by a complete sentence."],
    ["recyclingNextStageIsTo", "The next stage is to heat the pellets.", true, "'The next stage is to + base verb' is correct."],
    ["recyclingAfterWrong", "After, the plastic bottles are compressed into blocks.", false, "Use 'After that,' instead of 'After,' when linking to the next step."],
  ],
};

Object.keys(linkerJudgementTasks).forEach((key) => {
  linkerJudgementTasks[key] = linkerJudgementTasks[key].map(([id, statement, answer, hint]) => ({
    id,
    statement,
    answer,
    hint,
  }));
});

const makeCohesionTasks = (current) => ({
  band6: [
    { type: "fill", sentence: "In the i______ stage, the first step is completed.", answer: "initial" },
    { type: "fill", sentence: "The material is t______ processed in the next step.", answer: "then" },
    { type: "fill", sentence: "A______ that, the following step takes place.", answer: "After" },
    { type: "choice", prompt: "Which pronoun should replace a plural subject?", parts: ["Plastic bottles are collected.", "Plastic bottles are sorted."], options: ["it", "they", "them"], answer: "they" },
    { type: "combine", prompt: "Combine using and then. Use a pronoun to avoid repetition.", parts: [current.steps[0].passive, current.steps[1].passive], answer: `${current.steps[0].passive.replace(/\.$/, "")}, and then they are processed in the next stage.` },
    { type: "combine", prompt: "Combine using before being.", parts: [current.steps[1].passive, current.steps[2].passive], answer: `${current.steps[1].passive.replace(/\.$/, "")} before being processed further.` },
  ],
  band65: [
    { type: "correction", prompt: "Correct the 'Once ... has/have been done' error.", sentence: "Once the materials has been processed, they move to the next stage.", answer: "Once the materials have been processed, they move to the next stage." },
    { type: "correction", prompt: "Correct the 'after which' clause.", sentence: "The first stage is completed, after which are processed further.", answer: "The first stage is completed, after which the materials are processed further." },
    { type: "correction", prompt: "Correct the 'followed by' structure.", sentence: "The material is processed, followed by it is packed.", answer: "The material is processed, followed by the packing of the material." },
    { type: "combine", prompt: "Use 'Once ... has/have been done, ...' to connect two steps.", parts: [current.steps[0].passive, current.steps[1].passive], answer: `Once the first stage has been completed, ${current.steps[1].passive.charAt(0).toLowerCase()}${current.steps[1].passive.slice(1)}` },
    { type: "combine", prompt: "Combine using 'after which'.", parts: [current.steps[1].passive, current.steps[2].passive], answer: `${current.steps[1].passive.replace(/\.$/, "")}, after which ${current.steps[2].passive.charAt(0).toLowerCase()}${current.steps[2].passive.slice(1)}` },
  ],
});

const createErrorRules = () => [
  { id: "g1", type: "grammar", pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin|produce|pack|label|seal|crush|wash|dry|cool)\b(?!\w)/gi, message: "Use passive form: be + past participle, e.g. are placed / are collected." },
  { id: "g2", type: "grammar", pattern: /\b(fibres|bottles|pellets|crystals|plants)\s+is\b/gi, message: "Use a plural verb with plural nouns, e.g. fibres are / bottles are." },
  { id: "l2", type: "lexis", pattern: /plastic\s+balls/gi, message: "Use 'plastic pellets', not 'plastic balls'." },
  { id: "sp1", type: "spelling", pattern: /botles|bottels/gi, message: "Spelling: use 'bottles'." },
  { id: "sp2", type: "spelling", pattern: /recyling|recylcing/gi, message: "Spelling: use 'recycling'." },
  { id: "sp5", type: "spelling", pattern: /produts|prodcts/gi, message: "Spelling: use 'products'." },
];

const Card = memo(({ title, children }) => (
  <div className="rounded-2xl border bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
    {children}
  </div>
));

const Tab = memo(({ value, label, activePractice, onSelect }) => (
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
));

export default function IELTSProcessTrainerFullSystem() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage("ielts-process-scores", {});
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [dragItem, setDragItem] = useState(null);
  const [p1Hint, setP1Hint] = useState("");
  const [p2Hint, setP2Hint] = useState({ index: null, text: "" });
  const [writingHint, setWritingHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [p3TimerStarted, setP3TimerStarted] = useState(false);
  const [p3ElapsedSeconds, setP3ElapsedSeconds] = useState(0);
  const [selfCheckVisible, setSelfCheckVisible] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [evidence, setEvidence] = useState({});

  const current = processData[processKey];
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || { p1: false, p2: false, p3: false };
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);
  const achievement = totalScore < 4 ? "Bronze" : totalScore < 10 ? "Silver" : "Gold";
  const minWords = level === "band55" ? 70 : level === "band6" ? 80 : 100;
  const maxWords = level === "band55" ? 80 : level === "band6" ? 100 : 120;

  useEffect(() => {
    if (!p3TimerStarted) return undefined;
    const timer = setInterval(() => setP3ElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [p3TimerStarted]);

  const resetAllPracticeStates = useCallback(() => {
    setPracticeState(initialPracticeState);
    setP1Hint("");
    setP2Hint({ index: null, text: "" });
    setWritingHint("");
    setAiFeedback(null);
    setAiLoading(false);
    setDragItem(null);
    setP3TimerStarted(false);
    setP3ElapsedSeconds(0);
    setSelfCheckVisible(false);
    setChecklist({});
    setEvidence({});
  }, []);

  const award = useCallback(
    (practice) => {
      setScoreMap((prev) => {
        const currentEarned = prev[scoreKey] || { p1: false, p2: false, p3: false };
        if (currentEarned[practice]) return prev;
        return { ...prev, [scoreKey]: { ...currentEarned, [practice]: true } };
      });
    },
    [scoreKey, setScoreMap],
  );

  const practice1Tasks = useMemo(() => {
    if (level === "band55") {
      return [
        ...(band55PassiveCorrectionTasks[processKey] || []).map(([prompt, answer]) => ({
          prompt,
          answer,
          instruction: "Correct the passive sentence.",
        })),
        ...current.steps.slice(3).map((step) => ({
          prompt: step.active,
          answer: step.passive,
          instruction: "Rewrite the active sentence in the passive voice.",
        })),
      ];
    }
    if (level === "band6") {
      return [
        ...(band6ProcessCorrectionTasks[processKey] || []).map(([prompt, answer]) => ({
          prompt,
          answer,
          instruction: "Correct the process sentence.",
        })),
        ...current.steps.slice(3).map((step) => ({
          prompt: step.prompt6,
          answer: step.passive,
          instruction: "Use the words and the diagram to write a complete passive sentence.",
        })),
      ];
    }
    return current.band65.map((item) => ({
      prompt: item.prompt,
      answer: item.answer,
      instruction: item.task,
    }));
  }, [current, level, processKey]);

  const p1ReflectionOptions = useMemo(
    () => (level === "band65" ? shuffleArray(reflectionOptions) : []),
    [level, processKey],
  );

  const checkP1 = useCallback(
    (index) => {
      const ok = isAnswerCorrect(practiceState.p1Answers[index] || "", practice1Tasks[index].answer, level);
      setPracticeState((prev) => ({ ...prev, p1Feedback: { ...prev.p1Feedback, [index]: ok } }));
      const allCorrect = practice1Tasks.every((task, i) =>
        isAnswerCorrect(practiceState.p1Answers[i] || "", task.answer, level),
      );
      if (allCorrect && level !== "band65") award("p1");
    },
    [award, level, practice1Tasks, practiceState.p1Answers],
  );

  const checkP1Reflection = useCallback(() => {
    const feedback = {};
    reflectionOptions.forEach((option) => {
      feedback[option.id] = Boolean(practiceState.p1ReflectionAnswers[option.id]) === option.correct;
    });
    const reflectionCorrect = Object.values(feedback).every(Boolean);
    const allCorrect = practice1Tasks.every((task, i) =>
      isAnswerCorrect(practiceState.p1Answers[i] || "", task.answer, level),
    );
    setPracticeState((prev) => ({ ...prev, p1ReflectionFeedback: feedback, p1ReflectionChecked: true }));
    if (reflectionCorrect && allCorrect) award("p1");
  }, [award, level, practice1Tasks, practiceState.p1Answers, practiceState.p1ReflectionAnswers]);

  const linkerOptions = ["After", "Next", "then", "Finally", "The following stage", "next", "First"];

  const dropToBlank = useCallback(
    (index) => {
      if (!dragItem) return;
      const value = typeof dragItem === "string" ? dragItem : dragItem.value;
      setPracticeState((prev) => {
        const copy = [...prev.p2ParagraphAnswers];
        copy[index] = value;
        return { ...prev, p2ParagraphAnswers: copy };
      });
    },
    [dragItem],
  );

  const checkParagraph = useCallback(() => {
    const feedback = current.p2Band55.answers.map((answer, i) => practiceState.p2ParagraphAnswers[i] === answer);
    setPracticeState((prev) => ({ ...prev, p2ParagraphFeedback: feedback }));
    const judgementTasks = linkerJudgementTasks[processKey] || [];
    const judgementCorrect =
      practiceState.p2LinkerJudgementChecked &&
      judgementTasks.every((task) => practiceState.p2LinkerJudgementAnswers[task.id] === task.answer);
    if (feedback.every(Boolean) && judgementCorrect) award("p2");
  }, [award, current.p2Band55.answers, practiceState.p2LinkerJudgementAnswers, practiceState.p2LinkerJudgementChecked, practiceState.p2ParagraphAnswers, processKey]);

  const checkP2LinkerJudgement = useCallback(() => {
    const tasks = linkerJudgementTasks[processKey] || [];
    const feedback = {};
    tasks.forEach((task) => {
      feedback[task.id] = practiceState.p2LinkerJudgementAnswers[task.id] === task.answer;
    });
    setPracticeState((prev) => ({
      ...prev,
      p2LinkerJudgementFeedback: feedback,
      p2LinkerJudgementChecked: true,
    }));
    if (Object.values(feedback).every(Boolean) && practiceState.p2ParagraphFeedback.every(Boolean)) award("p2");
  }, [award, practiceState.p2LinkerJudgementAnswers, practiceState.p2ParagraphFeedback, processKey]);

  const cohesionTasks = useMemo(() => {
    const tasks = makeCohesionTasks(current);
    return level === "band6" ? tasks.band6 : tasks.band65;
  }, [current, level]);

  const checkCohesion = useCallback(
    (index) => {
      const ok = isAnswerCorrect(practiceState.p2CohesionAnswers[index] || "", cohesionTasks[index].answer, level);
      setPracticeState((prev) => ({ ...prev, p2CohesionFeedback: { ...prev.p2CohesionFeedback, [index]: ok } }));
      const allCorrect = cohesionTasks.every((task, i) =>
        isAnswerCorrect(practiceState.p2CohesionAnswers[i] || "", task.answer, level),
      );
      if (allCorrect) award("p2");
    },
    [award, cohesionTasks, level, practiceState.p2CohesionAnswers],
  );

  const wordCount = useMemo(
    () => (practiceState.p3Writing.trim() ? practiceState.p3Writing.trim().split(/\s+/).length : 0),
    [practiceState.p3Writing],
  );

  const selfCheckComplete = useMemo(() => {
    const checks = Object.values(checklist);
    const examples = Object.values(evidence);
    return checks.length >= 3 && checks.every(Boolean) && examples.length >= 2 && examples.every((item) => item.trim());
  }, [checklist, evidence]);

  const aiChecked = Boolean(aiFeedback);
  const aiErrors = aiFeedback?.errors || [];
  const aiHasNoErrors = aiChecked && aiErrors.length === 0;
  const finalReflectionComplete = practiceState.p3Reflection.every((item) => item.trim());

  const runLocalAICheck = useCallback(() => {
    const errors = [];
    createErrorRules(processKey).forEach((rule) => {
      if (practiceState.p3Writing.match(rule.pattern)) errors.push(rule);
    });
    if (wordCount < minWords) {
      errors.push({ id: "task-word-count-low", type: "task", message: `Your paragraph is too short. Aim for at least ${minWords} words for this level.` });
    }
    if (wordCount > maxWords + 20) {
      errors.push({ id: "task-word-count-high", type: "task", message: `Your paragraph may be too long. Try to keep it close to ${minWords}-${maxWords} words.` });
    }
    return errors;
  }, [maxWords, minWords, practiceState.p3Writing, processKey, wordCount]);

  const getAIFeedback = useCallback(async () => {
    if (!practiceState.p3Writing.trim()) {
      setWritingHint("Please write your body paragraph before using AI Check.");
      return;
    }
    if (!selfCheckComplete) {
      setWritingHint("Please complete the self-checklist and copy examples from your paragraph before using AI Check.");
      return;
    }
    setWritingHint("");
    setAiLoading(true);
    try {
      setAiFeedback({ checkedAt: new Date().toISOString(), errors: runLocalAICheck() });
    } finally {
      setAiLoading(false);
    }
  }, [practiceState.p3Writing, runLocalAICheck, selfCheckComplete]);

  const submitPractice3 = useCallback(() => {
    if (!aiHasNoErrors) {
      setWritingHint("Please revise your paragraph and run AI Check again.");
      return;
    }
    if (!finalReflectionComplete) {
      setWritingHint("Please complete the Final Reflection before submitting.");
      return;
    }
    award("p3");
    setWritingHint("Practice 3 submitted successfully. You earned 5 points.");
  }, [aiHasNoErrors, award, finalReflectionComplete]);

  const renderPractice1 = () => (
    <Card title={level === "band65" ? "Practice 1 - Sentence Upgrade" : "Practice 1 - Passive Voice"}>
      <p className="mb-4 text-sm text-slate-600">Complete Practice 1 to earn 2 points.</p>
      <div className="space-y-4">
        {practice1Tasks.map((task, i) => (
          <div key={i} className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{task.instruction}</p>
            <p className="mt-2 rounded-lg bg-white p-3">{task.prompt}</p>
            <input
              value={practiceState.p1Answers[i] || ""}
              onChange={(e) =>
                setPracticeState((prev) => ({
                  ...prev,
                  p1Answers: { ...prev.p1Answers, [i]: e.target.value },
                }))
              }
              className="mt-3 w-full rounded-xl border p-2"
              placeholder="Write your answer here..."
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => checkP1(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
              <button type="button" onClick={() => setP1Hint(`Task ${i + 1}: ${task.instruction}`)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            </div>
            {practiceState.p1Feedback[i] !== undefined && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${practiceState.p1Feedback[i] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {practiceState.p1Feedback[i] ? "Correct." : `Suggested answer: ${task.answer}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {level === "band65" && (
        <div className="mt-5 rounded-2xl border bg-purple-50 p-4">
          <p className="font-bold text-purple-900">Sentence Upgrade Reflection</p>
          <div className="mt-3 space-y-2 text-sm text-purple-900">
            {p1ReflectionOptions.map((option) => (
              <label key={option.id} className="flex gap-2 rounded-xl border bg-white p-3">
                <input
                  type="checkbox"
                  checked={Boolean(practiceState.p1ReflectionAnswers[option.id])}
                  onChange={(e) =>
                    setPracticeState((prev) => ({
                      ...prev,
                      p1ReflectionAnswers: { ...prev.p1ReflectionAnswers, [option.id]: e.target.checked },
                    }))
                  }
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
          <button type="button" onClick={checkP1Reflection} className="mt-4 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check Reflection</button>
          {practiceState.p1ReflectionChecked && (
            <div className={`mt-3 rounded-xl p-3 text-sm ${Object.values(practiceState.p1ReflectionFeedback || {}).every(Boolean) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {Object.values(practiceState.p1ReflectionFeedback || {}).every(Boolean) ? "Correct." : "Check again. Some options are not suitable."}
            </div>
          )}
        </div>
      )}
      {p1Hint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p1Hint}</div>}
    </Card>
  );

  const renderBlank = (index) => {
    const checked = practiceState.p2ParagraphFeedback.length > 0;
    const ok = practiceState.p2ParagraphFeedback[index];
    return (
      <span
        draggable={Boolean(practiceState.p2ParagraphAnswers[index])}
        onDragStart={() => setDragItem({ type: "blank", index, value: practiceState.p2ParagraphAnswers[index] })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropToBlank(index)}
        className={`mx-1 inline-flex min-h-[28px] min-w-[105px] items-center justify-center rounded border-b-2 px-2 text-center align-middle ${
          checked ? (ok ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-600 bg-white"
        }`}
      >
        {practiceState.p2ParagraphAnswers[index] || "\u00A0"}
      </span>
    );
  };

  const renderPractice2 = () => {
    if (level === "band55") {
      return (
        <Card title="Practice 2 - Cohesive Devices">
          <p className="mb-4 text-sm text-slate-600">Drag cohesive devices into the process paragraph, then check linker positions.</p>
          <div className="rounded-2xl border bg-slate-50 p-5 leading-10">
            {current.p2Band55.text.map((chunk, i) => (
              <span key={i}>{renderBlank(chunk[0])}{chunk[1]}</span>
            ))}
          </div>
          <div
            className="mt-4 flex flex-wrap gap-2 rounded-2xl border bg-white p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragItem?.type !== "blank") return;
              setPracticeState((prev) => {
                const copy = [...prev.p2ParagraphAnswers];
                copy[dragItem.index] = "";
                return { ...prev, p2ParagraphAnswers: copy };
              });
            }}
          >
            {linkerOptions.map((option) => (
              <button
                key={option}
                type="button"
                draggable
                onClick={() => {
                  const firstEmpty = current.p2Band55.answers.findIndex((_, i) => !practiceState.p2ParagraphAnswers[i]);
                  if (firstEmpty >= 0) {
                    setPracticeState((prev) => {
                      const copy = [...prev.p2ParagraphAnswers];
                      copy[firstEmpty] = option;
                      return { ...prev, p2ParagraphAnswers: copy };
                    });
                  }
                }}
                onDragStart={() => setDragItem({ type: "option", value: option })}
                className="cursor-grab rounded-xl border bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setP2Hint({ index: null, text: "Look at the position of the blank: sentence beginning, after a be-verb, after 'After', or inside 'In the ___ stage'." })} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
            <button type="button" onClick={checkParagraph} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check Drag Task</button>
            <button type="button" onClick={resetAllPracticeStates} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Reset</button>
          </div>
          {p2Hint.text && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint.text}</div>}

          <div className="mt-5 rounded-2xl border bg-white p-4">
            <p className="font-bold text-slate-800">Linker Position Check</p>
            <div className="mt-3 space-y-3">
              {(linkerJudgementTasks[processKey] || []).map((task) => (
                <div key={task.id} className="rounded-xl border bg-slate-50 p-3">
                  <p className="rounded-lg bg-white p-3">{task.statement}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[true, false].map((value) => (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() =>
                          setPracticeState((prev) => ({
                            ...prev,
                            p2LinkerJudgementAnswers: { ...prev.p2LinkerJudgementAnswers, [task.id]: value },
                          }))
                        }
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                          practiceState.p2LinkerJudgementAnswers[task.id] === value ? "border-blue-500 bg-blue-50 text-blue-700" : "bg-white"
                        }`}
                      >
                        {value ? "True" : "False"}
                      </button>
                    ))}
                    <button type="button" onClick={() => setP2Hint({ index: null, text: task.hint })} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={checkP2LinkerJudgement} className="mt-4 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check Linker Position</button>
          </div>
        </Card>
      );
    }

    return (
      <Card title="Practice 2 - Cohesive Devices">
        <p className="mb-4 text-sm text-slate-600">Complete the cohesive-device tasks to earn 3 points.</p>
        <div className="space-y-4">
          {cohesionTasks.map((task, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task {i + 1}</p>
              <div className="mt-2 rounded-lg bg-white p-3">
                <p className="font-semibold">{task.prompt || "Complete the sentence."}</p>
                {task.sentence && <p className="mt-1">{task.sentence}</p>}
                {task.sentence === undefined && task.parts?.map((part, index) => <p key={index} className="mt-1">{index + 1}. {part}</p>)}
                {task.sentence === undefined && task.sentence !== "" && task.sentence !== null && task.sentence !== undefined ? null : null}
                {task.type === "correction" && <p className="mt-2">{task.sentence}</p>}
              </div>
              {task.type === "choice" ? (
                <div className="mt-3 space-y-2">
                  {task.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPracticeState((prev) => ({ ...prev, p2CohesionAnswers: { ...prev.p2CohesionAnswers, [i]: option } }))}
                      className={`block w-full rounded-xl border p-2 text-left text-sm ${practiceState.p2CohesionAnswers[i] === option ? "border-blue-500 bg-blue-50 text-blue-700" : "bg-white"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  value={practiceState.p2CohesionAnswers[i] || ""}
                  onChange={(e) => setPracticeState((prev) => ({ ...prev, p2CohesionAnswers: { ...prev.p2CohesionAnswers, [i]: e.target.value } }))}
                  className="mt-3 w-full rounded-xl border p-2"
                  placeholder="Write your answer here..."
                />
              )}
              {p2Hint.index === i && p2Hint.text && <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{p2Hint.text}</div>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => checkCohesion(i)} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check</button>
                <button type="button" onClick={() => setP2Hint({ index: i, text: "Check subject reference, step order and the grammar required by the target cohesive structure." })} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Hint</button>
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

  const selfCheckItems =
    level === "band55"
      ? ["I used present simple passive voice.", "I used cohesive devices to show order.", "I described the steps in the correct order."]
      : level === "band6"
        ? ["I used cohesive devices.", "I used pronouns to avoid repetition.", "I used one sentence-combining structure."]
        : ["I included specific diagram details.", "I used one sentence-upgrade expression.", "I used one cohesive structure from Practice 2."];

  const renderPractice3 = () => (
    <Card title="Practice 3 - Body Paragraph Writing">
      <p className="mb-3 text-sm text-slate-600">Write your body paragraph, complete the self-checklist, pass AI Check, complete Final Reflection, and submit.</p>
      <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold">Writing target</p>
        <p className="mt-1">Write {minWords}-{maxWords} words within 20 minutes. You do not need to write the introduction or overview.</p>
        <p className="mt-1">Timer: <span className={p3ElapsedSeconds > 1200 ? "font-bold text-red-600" : "font-bold text-slate-800"}>{formatTime(p3ElapsedSeconds)}</span> / 20:00</p>
      </div>
      <textarea
        value={practiceState.p3Writing}
        onChange={(e) => {
          setPracticeState((prev) => ({ ...prev, p3Writing: e.target.value }));
          if (!p3TimerStarted && e.target.value.trim()) setP3TimerStarted(true);
          setAiFeedback(null);
        }}
        rows={10}
        className="mt-4 w-full rounded-2xl border p-4"
        placeholder="Write your body paragraph here..."
      />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>Word count: <strong className={wordCount < minWords || wordCount > maxWords + 20 ? "text-red-600" : "text-green-700"}>{wordCount}</strong></span>
        <span>Target: {minWords}-{maxWords} words</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => (practiceState.p3Writing.trim() ? setSelfCheckVisible(true) : setWritingHint("Please write your body paragraph first."))} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Submit for Self-check</button>
        <button type="button" onClick={getAIFeedback} disabled={aiLoading} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${aiLoading ? "bg-slate-400" : "bg-green-600"}`}>{aiLoading ? "Checking..." : "AI Check"}</button>
      </div>
      {writingHint && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{writingHint}</div>}
      {selfCheckVisible && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <p className="font-semibold">Self-checklist</p>
          <div className="mt-3 space-y-3">
            {selfCheckItems.map((item, index) => (
              <div key={item} className="space-y-2">
                <label className="flex gap-2 rounded-xl border bg-slate-50 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[index])}
                    onChange={(e) => setChecklist((prev) => ({ ...prev, [index]: e.target.checked }))}
                  />
                  <span>{item}</span>
                </label>
                {index < 2 && (
                  <input
                    value={evidence[index] || ""}
                    onChange={(e) => setEvidence((prev) => ({ ...prev, [index]: e.target.value }))}
                    className="w-full rounded-xl border p-2 text-sm"
                    placeholder="Copy one example from your paragraph."
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {aiChecked && (
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${aiErrors.length ? "border-yellow-200 bg-yellow-50 text-yellow-900" : "border-green-200 bg-green-50 text-green-700"}`}>
          {aiErrors.length === 0 ? (
            <p className="font-semibold">No language errors detected. Complete the Final Reflection and submit.</p>
          ) : (
            <>
              <p className="font-bold">AI Check Results</p>
              <div className="mt-3 space-y-2">
                {aiErrors.map((error, index) => (
                  <div key={`${error.id}-${index}`} className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{error.type}</p>
                    <p className="mt-1 text-slate-800">{error.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {aiHasNoErrors && (
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <p className="font-semibold">Final Reflection</p>
          <div className="mt-3 space-y-2">
            {practiceState.p3Reflection.map((item, i) => (
              <input
                key={i}
                value={item}
                onChange={(e) =>
                  setPracticeState((prev) => {
                    const copy = [...prev.p3Reflection];
                    copy[i] = e.target.value;
                    return { ...prev, p3Reflection: copy };
                  })
                }
                className="w-full rounded-xl border p-2"
                placeholder={["What did you improve?", "What structure did you use?", "What will you check first next time?"][i]}
              />
            ))}
          </div>
          <button type="button" onClick={submitPractice3} disabled={earned.p3} className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white ${earned.p3 ? "bg-slate-400" : "bg-green-600"}`}>
            {earned.p3 ? "Submitted - +5 points earned" : "Submit Practice 3"}
          </button>
        </div>
      )}
    </Card>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">IELTS Process Writing Trainer</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">Practise IELTS Academic Writing Task 1 process diagrams through sentence-level training, cohesive-device practice and timed body paragraph writing.</p>
            </div>
            <div className="rounded-2xl border bg-blue-50 p-4 text-sm">
              <p className="font-semibold text-blue-900">Current achievement</p>
              <p className="mt-1 text-lg font-bold text-blue-700">Score: {totalScore} / 10 - {achievement}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {[
                  ["p1", "Practice 1", "2"],
                  ["p2", "Practice 2", "3"],
                  ["p3", "Practice 3", "5"],
                ].map(([key, label, points]) => (
                  <span key={key} className={`rounded-full px-3 py-1 font-semibold ${earned[key] ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {label}: {earned[key] ? `+${points} earned` : `${points} points`}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="process-select" className="text-sm font-semibold text-slate-700">Choose a process diagram</label>
              <select
                id="process-select"
                value={processKey}
                onChange={(e) => {
                  setProcessKey(e.target.value);
                  resetAllPracticeStates();
                }}
                className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"
              >
                {Object.entries(processData).map(([key, item]) => <option key={key} value={key}>{item.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="level-select" className="text-sm font-semibold text-slate-700">Choose your target level</label>
              <select
                id="level-select"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value);
                  resetAllPracticeStates();
                }}
                className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"
              >
                <option value="band55">Band 5.5</option>
                <option value="band6">Band 6</option>
                <option value="band65">Band 6.5</option>
              </select>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card title={current.title}>
            <p className="text-sm text-slate-600">{current.task}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
              <img src={current.image} alt={`${current.title} process diagram`} className="max-h-[520px] w-full object-contain" />
            </div>
            <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">How to use this practice</p>
              <p className="mt-1">Practice 1 builds sentence accuracy. Practice 2 trains cohesive devices and sentence combining. Practice 3 asks you to write a body paragraph and revise it through self-check and AI Check.</p>
            </div>
          </Card>
          <div className="space-y-4">
            <div role="tablist" aria-label="Practice tabs" className="flex flex-wrap gap-2 rounded-2xl border bg-white p-3 shadow-sm">
              <Tab value="practice1" label="Practice 1" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice2" label="Practice 2" activePractice={activePractice} onSelect={setActivePractice} />
              <Tab value="practice3" label="Practice 3" activePractice={activePractice} onSelect={setActivePractice} />
            </div>
            {activePractice === "practice1" && renderPractice1()}
            {activePractice === "practice2" && renderPractice2()}
            {activePractice === "practice3" && renderPractice3()}
          </div>
        </section>
      </div>
    </main>
  );
}
