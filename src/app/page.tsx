"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  PenLine,
  Sparkles,
  Wand2
} from "lucide-react";

const LEVEL_LABELS = {
  band55: "Band 5.5",
  band6: "Band 6",
  band65: "Band 6.5"
};

const imageMap: Record<string, string> = {
  bamboo:
    "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
  noodles:
    "https://daxue-oss.koocdn.com/upload/ti/sardine/2493000-2494000/2493115/259d8b9f612e40819d37e0fb928b572f.png",
  recycling: "https://images.writing9.com/646839d3f987923ffa686b743b1950f9.png",
  sugar:
    "https://daxue-oss.koocdn.com/upload/ti/sardine/2521000-2522000/2521817/3395c3236ee34b9089e15f2ce4dfc9a9.png"
};

const processOptions = [
  { value: "bamboo", label: "Bamboo fabric" },
  { value: "sugar", label: "Sugar cane" },
  { value: "noodles", label: "Instant noodles" },
  { value: "recycling", label: "Plastic bottles" }
];

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

interface StepData {
  label: string;
  active: string;
  passive: string;
  prompt6: string;
  prompt65: string;
  gerund: string;
  nounPhrase: string;
}

interface ProcessData {
  title: string;
  diagramLabel: string;
  taskInstruction: string;
  steps: StepData[];
}

function makeStep(label: string, active: string, passive: string, prompt6: string, prompt65: string, gerund: string, nounPhrase: string): StepData {
  return { label, active, passive, prompt6, prompt65, gerund, nounPhrase };
}

const processLibrary: Record<string, ProcessData> = {
  bamboo: {
    title: "Bamboo Fabric Production",
    diagramLabel: "The diagram below shows how fabric is manufactured from bamboo.",
    taskInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    steps: [
      makeStep(
        "Plant bamboo plants in spring",
        "People plant bamboo plants in spring.",
        "Bamboo plants are planted in spring.",
        "bamboo plants / plant / in spring",
        "plant bamboo plants / spring",
        "being planted in spring",
        "the harvesting of bamboo plants in autumn"
      ),
      makeStep(
        "Harvest bamboo plants in autumn",
        "Workers harvest bamboo plants in autumn.",
        "Bamboo plants are harvested in autumn.",
        "bamboo plants / harvest / in autumn",
        "harvest / autumn",
        "being harvested in autumn",
        "the cutting of bamboo into strips"
      ),
      makeStep(
        "Cut bamboo into strips",
        "Workers cut bamboo into strips.",
        "Bamboo is cut into strips.",
        "bamboo / cut / into strips",
        "cut / into strips",
        "being cut into strips",
        "the crushing of the strips"
      ),
      makeStep(
        "Crush strips",
        "Workers crush the strips.",
        "The strips are crushed.",
        "the strips / crush",
        "crush strips",
        "being crushed",
        "the filtering of the fibres"
      ),
      makeStep(
        "Filter fibres",
        "Workers filter the fibres.",
        "The fibres are filtered.",
        "the fibres / filter",
        "filter fibres",
        "being filtered",
        "the softening of the fibres"
      ),
      makeStep(
        "Soften fibres",
        "Workers soften the fibres.",
        "The fibres are softened.",
        "the fibres / soften",
        "soften fibres",
        "being softened",
        "the spinning of the fibres into yarn"
      ),
      makeStep(
        "Spin fibres into yarn",
        "Machines spin the fibres into yarn.",
        "The fibres are spun into yarn.",
        "the fibres / spin / into yarn",
        "spin / yarn",
        "being spun into yarn",
        "the weaving of the yarn into fabric"
      ),
      makeStep(
        "Weave yarn into fabric",
        "Machines weave the yarn into fabric.",
        "The yarn is woven into fabric.",
        "the yarn / weave / into fabric",
        "weave / fabric",
        "being woven into fabric",
        "the production of fabric"
      )
    ]
  },
  sugar: {
    title: "Sugar Production from Sugar Cane",
    diagramLabel: "The diagram below shows how sugar is produced from sugar cane.",
    taskInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    steps: [
      makeStep(
        "Grow sugar cane for 12-18 months",
        "Farmers grow sugar cane for 12-18 months.",
        "Sugar cane is grown for 12-18 months.",
        "sugar cane / grow / for 12-18 months",
        "grow / 12-18 months",
        "being grown for 12-18 months",
        "the harvesting of sugar cane"
      ),
      makeStep(
        "Harvest sugar cane",
        "Workers harvest the sugar cane.",
        "The sugar cane is harvested.",
        "the sugar cane / harvest",
        "harvest",
        "being harvested",
        "the crushing of the sugar cane"
      ),
      makeStep(
        "Crush sugar cane",
        "Machines crush the sugar cane.",
        "The sugar cane is crushed.",
        "the sugar cane / crush",
        "crush",
        "being crushed",
        "the purification of the juice"
      ),
      makeStep(
        "Purify juice",
        "Workers purify the juice.",
        "The juice is purified.",
        "the juice / purify",
        "purify juice",
        "being purified",
        "the evaporation of the juice"
      ),
      makeStep(
        "Turn juice into syrup",
        "Heat turns the juice into syrup.",
        "The juice is turned into syrup.",
        "the juice / turn / into syrup",
        "turn / syrup",
        "being turned into syrup",
        "the separation of sugar crystals from syrup"
      ),
      makeStep(
        "Separate sugar crystals from syrup",
        "A centrifuge separates sugar crystals from syrup.",
        "Sugar crystals are separated from syrup.",
        "sugar crystals / separate / from syrup",
        "separate sugar crystals / syrup",
        "being separated from syrup",
        "the drying and cooling of the sugar"
      ),
      makeStep(
        "Dry and cool sugar",
        "Machines dry and cool the sugar.",
        "The sugar is dried and cooled.",
        "the sugar / dry and cool",
        "dry and cool sugar",
        "being dried and cooled",
        "the production of sugar"
      )
    ]
  },
  noodles: {
    title: "Instant Noodles Manufacturing",
    diagramLabel: "The diagram below shows the manufacturing process for instant noodles.",
    taskInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    steps: [
      makeStep(
        "Store flour in storage silos",
        "The factory stores flour in storage silos.",
        "Flour is stored in storage silos.",
        "flour / store / in storage silos",
        "storage silos / flour",
        "being stored in storage silos",
        "the mixing of flour, water and oil"
      ),
      makeStep(
        "Mix flour with water and oil",
        "Workers mix flour with water and oil.",
        "Flour is mixed with water and oil.",
        "flour / mix / with water and oil",
        "mixer / water / oil",
        "being mixed with water and oil",
        "the rolling of the dough into sheets"
      ),
      makeStep(
        "Roll dough into sheets",
        "Machines roll the dough into sheets.",
        "The dough is rolled into sheets.",
        "the dough / roll / into sheets",
        "dough sheets",
        "being rolled into sheets",
        "the cutting of the dough into strips"
      ),
      makeStep(
        "Cut dough into strips",
        "Machines cut the dough into strips.",
        "The dough is cut into strips.",
        "the dough / cut / into strips",
        "dough strips",
        "being cut into strips",
        "the formation of noodle discs"
      ),
      makeStep(
        "Form noodle discs",
        "Machines form noodle discs.",
        "Noodle discs are formed.",
        "noodle discs / form",
        "noodle discs",
        "being formed",
        "the cooking and drying of the noodle discs"
      ),
      makeStep(
        "Cook and dry noodle discs",
        "Machines cook and dry the noodle discs.",
        "The noodle discs are cooked and dried.",
        "the noodle discs / cook and dry",
        "cooking / drying",
        "being cooked and dried",
        "the adding of vegetables and spices"
      ),
      makeStep(
        "Add vegetables and spices",
        "Workers add vegetables and spices.",
        "Vegetables and spices are added.",
        "vegetables and spices / add",
        "vegetables / spices",
        "being added",
        "the labelling and sealing of the cups"
      ),
      makeStep(
        "Label and seal cups",
        "Workers label and seal the cups.",
        "The cups are labelled and sealed.",
        "the cups / label and seal",
        "labelling / sealing",
        "being labelled and sealed",
        "the production of instant noodles"
      )
    ]
  },
  recycling: {
    title: "Plastic Bottle Recycling",
    diagramLabel: "The diagram below shows the process for recycling plastic bottles.",
    taskInstruction:
      "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    steps: [
      makeStep(
        "Place plastic bottles in recycling bins",
        "People place plastic bottles in recycling bins.",
        "Plastic bottles are placed in recycling bins.",
        "plastic bottles / place / in recycling bins",
        "recycling bins / plastic bottles",
        "being placed in recycling bins",
        "the collection of plastic bottles"
      ),
      makeStep(
        "Collect plastic bottles by truck",
        "A truck collects the plastic bottles.",
        "The plastic bottles are collected.",
        "the plastic bottles / collect",
        "collect",
        "being collected",
        "the sorting of plastic bottles"
      ),
      makeStep(
        "Sort plastic bottles",
        "Workers sort the plastic bottles.",
        "The plastic bottles are sorted.",
        "the plastic bottles / sort",
        "sorting",
        "being sorted",
        "the compressing of plastic bottles into blocks"
      ),
      makeStep(
        "Compress plastic bottles into blocks",
        "Machines compress the plastic bottles into blocks.",
        "The plastic bottles are compressed into blocks.",
        "the plastic bottles / compress / into blocks",
        "compressing / blocks",
        "being compressed into blocks",
        "the crushing of the blocks"
      ),
      makeStep(
        "Crush blocks",
        "Machines crush the blocks.",
        "The blocks are crushed.",
        "the blocks / crush",
        "crushing",
        "being crushed",
        "the production of plastic pellets"
      ),
      makeStep(
        "Produce plastic pellets",
        "Machines produce plastic pellets.",
        "Plastic pellets are produced.",
        "plastic pellets / produce",
        "plastic pellets",
        "being produced",
        "the heating of the pellets to form raw material"
      ),
      makeStep(
        "Heat pellets to form raw material",
        "Heat forms raw material from the pellets.",
        "Raw material is formed from the pellets.",
        "raw material / form / from the pellets",
        "raw material / pellets",
        "being formed from the pellets",
        "the production of end products"
      ),
      makeStep(
        "Produce end products",
        "Factories produce end products.",
        "End products are produced.",
        "end products / produce",
        "end products",
        "being produced",
        "the production of end products"
      )
    ]
  }
};

// Remove preposition hints from prompt (e.g., "bamboo plants / plant / in spring" -> "bamboo plants / plant")
function removePrepositionHints(prompt: string): string {
  const parts = prompt.split("/").map((p) => p.trim()).filter(Boolean);
  const blocked = ["in ", "into ", "from ", "for ", "with ", "by ", "to ", "at ", "on "];
  return parts.filter((p) => !blocked.some((b) => p.toLowerCase().startsWith(b))).join(" / ");
}

interface Band55PracticeItem {
  type: "rewrite";
  prompt: string;
  answer: string;
  explanation: string;
}

interface Band6PracticeItem {
  type: "build";
  prompt: string;
  answer: string;
  explanation: string;
}

interface Band65PracticeItem {
  type: "upgrade" | "expand";
  prompt: string;
  task: string;
  answer: string;
  explanation: string;
}

type Practice1Item = Band55PracticeItem | Band6PracticeItem | Band65PracticeItem;

interface SequencingItem {
  type: "fill" | "combine";
  sentence?: string;
  prompt?: string;
  parts?: string[];
  answer: string;
  explanation: string;
}

interface ParagraphSet {
  title: string;
  instruction: string;
  notes: string[];
  hint: string;
  model: string;
  targetLength: string;
}

function buildPractice1(steps: StepData[], level: string): Practice1Item[] {
  // ===== Band 5.5: Rewrite =====
  if (level === "band55") {
    return steps.map((step) => ({
      type: "rewrite" as const,
      prompt: step.active,
      answer: step.passive,
      explanation: "Rewrite the sentence in the passive voice."
    }));
  }

  // ===== Band 6: Build Sentence =====
  if (level === "band6") {
    return steps.map((step) => ({
      type: "build" as const,
      prompt: removePrepositionHints(step.prompt6),
      answer: step.passive,
      explanation: "Build a complete passive sentence. Decide details from the diagram."
    }));
  }

  // ===== Band 6.5: Upgrade and Expand =====
  // Filter steps that can be upgraded or expanded
  const upgradeableSteps = steps.filter((_, i) => i % 2 === 0);
  const expandableSteps = steps.filter((_, i) => i % 2 === 1);

  const items: Band65PracticeItem[] = [];

  // Add upgrade tasks (even indices)
  upgradeableSteps.forEach((step) => {
    items.push({
      type: "upgrade",
      prompt: step.passive,
      task: "Use a more formal verb or structure.",
      answer: step.passive, // Self-check for Band 6.5
      explanation: "Focus on using formal vocabulary appropriate for academic writing."
    });
  });

  // Add expand tasks (odd indices)
  expandableSteps.slice(0, 4).forEach((step) => {
    items.push({
      type: "expand",
      prompt: step.passive,
      task: "Add details from the diagram to expand this sentence.",
      answer: step.passive,
      explanation: "Include relevant details shown in the diagram without adding unshown information."
    });
  });

  return items;
}

function buildPractice2(steps: StepData[], level: string): SequencingItem[] {
  if (level === "band55") {
    const linkers = ["Firstly", "Next", "After that", "In the next stage", "Then", "After that", "Then", "Finally"];
    return steps.map((step, index) => ({
      type: "fill" as const,
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: linkers[Math.min(index, linkers.length - 1)],
      explanation: "Fill in a suitable sequencing expression."
    }));
  }

  if (level === "band6") {
    const linkers = ["Firstly", "Next", "Subsequently", "After that", "Subsequently", "Then", "After that", "Finally"];
    const fillItems: SequencingItem[] = steps.map((step, index) => ({
      type: "fill" as const,
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: linkers[Math.min(index, linkers.length - 1)],
      explanation: "Fill in an appropriate sequencing expression."
    }));

    const combineItems: SequencingItem[] = steps.slice(0, -1).map((step, index) => {
      const nextStep = steps[index + 1];
      const useBefore = index % 2 === 0;
      return {
        type: "combine" as const,
        prompt: useBefore ? "Combine the sentences using 'before doing':" : "Combine the sentences using 'after doing':",
        parts: [step.passive, nextStep.passive],
        answer: useBefore
          ? `${step.passive.slice(0, -1)} before ${nextStep.gerund}.`
          : `${nextStep.passive.slice(0, -1)} after ${step.gerund}.`,
        explanation: "Check both the sequence and the verb form after before/after."
      };
    });

    return [...fillItems, ...combineItems];
  }

  return steps.slice(0, -1).map((step, index) => {
    const nextStep = steps[index + 1];
    if (index % 3 === 0) {
      return {
        type: "combine" as const,
        prompt: "Combine the sentences using 'after doing':",
        parts: [step.passive, nextStep.passive],
        answer: `${nextStep.passive.slice(0, -1)} after ${step.gerund}.`,
        explanation: "Use after + doing / being done to connect the two stages."
      };
    }
    if (index % 3 === 1) {
      return {
        type: "combine" as const,
        prompt: "Combine the ideas using 'followed by':",
        parts: [step.passive, nextStep.passive],
        answer: `${step.passive.slice(0, -1)}, followed by ${nextStep.nounPhrase}.`,
        explanation: "Use followed by + noun or gerund phrase, not a full clause."
      };
    }
    return {
      type: "combine" as const,
      prompt: "Combine the sentences using 'after which':",
      parts: [step.passive, nextStep.passive],
      answer: `${step.passive.slice(0, -1)}, after which ${lowerFirst(nextStep.passive)}.`,
      explanation: "Use after which to link two sequential clauses."
    };
  });
}

function buildPractice3(steps: StepData[], level: string): ParagraphSet {
  if (level === "band55") {
    const linkers = ["Firstly", "Next", "After that", "In the next stage", "Then", "After that", "Then", "Finally"];
    return {
      title: "Band 5.5 Timed Paragraph Writing",
      instruction:
        "Write one factual body paragraph about the process using passive sentences and basic sequencing expressions.",
      notes: steps.map((s) => s.passive),
      hint:
        "Use basic sequencing expressions such as firstly, next, after that, then, and finally. Avoid adding information that is not shown in the diagram.",
      model: steps.map((s, i) => `${linkers[Math.min(i, 7)]}, ${lowerFirst(s.passive)}`).join(" "),
      targetLength: "100+ words"
    };
  }

  if (level === "band6") {
    return {
      title: "Band 6 Timed Paragraph Writing",
      instruction:
        "Write one factual body paragraph. Reuse subsequently and before/after doing from Practice 2.",
      notes: steps.map((s) => s.passive),
      hint:
        "Use subsequently at least once and combine some stages with before/after doing. Keep your paragraph factual.",
      model: steps
        .slice(0, -1)
        .map((s, i) => {
          const next = steps[i + 1];
          if (i % 2 === 0) return `${s.passive.slice(0, -1)} before ${next.gerund}.`;
          return `Subsequently, ${lowerFirst(next.passive)}`;
        })
        .join(" "),
      targetLength: "100+ words"
    };
  }

  return {
    title: "Band 6.5 Timed Paragraph Writing",
    instruction:
      "Write one factual body paragraph in a more academic style using after doing, followed by, and after which.",
    notes: steps.map((s) => s.passive),
    hint:
      "Use at least two advanced linking structures, but do not add any process details that are not shown in the diagram.",
    model: steps
      .slice(0, -1)
      .map((s, i) => {
        const next = steps[i + 1];
        if (i % 3 === 0) return `${next.passive.slice(0, -1)} after ${s.gerund}.`;
        if (i % 3 === 1) return `${s.passive.slice(0, -1)}, followed by ${next.nounPhrase}.`;
        return `${s.passive.slice(0, -1)}, after which ${lowerFirst(next.passive)}.`;
      })
      .join(" "),
    targetLength: "100+ words"
  };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
}

function compareAnswer(input: string, target: string): boolean {
  return normalize(input) === normalize(target);
}

function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function scoreParagraph(text: string, level: string, process: ProcessData): string[] {
  const lower = text.toLowerCase();
  const sequencingWords = [
    "firstly",
    "next",
    "after that",
    "in the next stage",
    "then",
    "finally",
    "subsequently",
    "followed by",
    "after which"
  ];
  const passiveMarkers = [" is ", " are ", " was ", " were ", " being ", " been "];
  const keywords = process.steps
    .flatMap((s) => s.passive.toLowerCase().split(/[^a-z0-9-]+/))
    .filter((w) => w.length > 3);
  const keywordCount = [...new Set(keywords)].filter((w) => lower.includes(w)).length;
  const wordCount = getWordCount(text);
  const feedback: string[] = [];

  if (keywordCount >= 6) feedback.push("You included several key stages from the process.");
  else feedback.push("Try to include more important stages from the diagram.");

  if (sequencingWords.some((w) => lower.includes(w))) feedback.push("Your paragraph uses sequencing language clearly.");
  else feedback.push("Add clearer sequencing language to show the order of stages.");

  if (passiveMarkers.some((w) => ` ${lower} `.includes(w))) {
    feedback.push("You used passive structures appropriately for a process diagram.");
  } else {
    feedback.push("Use passive voice more consistently when describing the process.");
  }

  if (wordCount < 100) feedback.push("Try to write at least 100 words within the 20-minute limit.");

  if (level === "band65" && !lower.includes("after which") && !lower.includes("followed by")) {
    feedback.push("Try to include at least one advanced linker such as 'followed by' or 'after which'.");
  }

  return feedback;
}

interface DiagramPanelProps {
  process: ProcessData;
  imageSrc: string;
}

function DiagramPanel({ process, imageSrc }: DiagramPanelProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  return (
    <aside className="h-full border-r bg-white">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2 text-slate-700">
          <ImageIcon className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Question</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{process.diagramLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{process.taskInstruction}</p>
      </div>

      <div className="h-[calc(100vh-154px)] overflow-auto p-5">
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          {!imageError ? (
            <img
              src={imageSrc}
              alt={process.diagramLabel}
              className="w-full rounded-xl object-contain"
              loading="eager"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">
              The diagram image could not be loaded. In the production version, this image should be served from a local static folder or CDN.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

interface StatusBoxProps {
  completionRate: number;
  level: string;
}

function StatusBox({ completionRate, level }: StatusBoxProps) {
  return (
    <div className="border-b bg-white px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Learning journey</p>
          <p className="text-xs text-slate-500">Sentence accuracy &rarr; Cohesion control &rarr; Timed writing</p>
        </div>
        <Badge variant="outline">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</Badge>
      </div>
      <Progress value={completionRate} />
      <p className="mt-2 text-xs text-slate-500">{completionRate}% completed</p>
    </div>
  );
}

export default function IELTSProcessWritingFinalUI() {
  const [selectedProcess, setSelectedProcess] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activeTab, setActiveTab] = useState("practice1");
  const [passiveAnswers, setPassiveAnswers] = useState<Record<number, string>>({});
  const [passiveResults, setPassiveResults] = useState<Record<number, boolean>>({});
  const [passiveHints, setPassiveHints] = useState<Record<number, string>>({});
  const [sequencingAnswers, setSequencingAnswers] = useState<Record<number, string>>({});
  const [sequencingResults, setSequencingResults] = useState<Record<number, boolean>>({});
  const [paragraph, setParagraph] = useState("");
  const [paragraphFeedback, setParagraphFeedback] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const process = useMemo(() => processLibrary[selectedProcess], [selectedProcess]);
  const imageSrc = imageMap[selectedProcess as keyof typeof imageMap];
  const passiveSet = useMemo(() => buildPractice1(process.steps, level), [process, level]);
  const sequencingSet = useMemo(() => buildPractice2(process.steps, level), [process, level]);
  const paragraphSet = useMemo(() => buildPractice3(process.steps, level), [process, level]);

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
  }, [selectedProcess, level]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const completedPassive = Object.values(passiveResults).filter(Boolean).length;
  const completedSequencing = Object.values(sequencingResults).filter(Boolean).length;
  const totalTasks = passiveSet.length + sequencingSet.length + 1;
  const completedTasks = completedPassive + completedSequencing + (paragraph.trim() ? 1 : 0);
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setTimeLeft(20 * 60);
    setIsRunning(false);
  };

  const getPassiveHint = (item: Practice1Item): string => {
    if (level === "band55") return "Structure: subject + is/are + past participle";
    if (level === "band6") return "Hint: use the correct be verb and complete the whole passive sentence.";
    if (item.type === "upgrade") return "Focus on formal vocabulary. Check if your sentence uses appropriate academic language.";
    if (item.type === "expand") return "Add details from the diagram. What materials, methods, or outcomes are shown?";
    return "Check whether you only used vocabulary shown in the diagram.";
  };

  const handlePassiveCheck = (index: number) => {
    const item = passiveSet[index];
    const input = passiveAnswers[index] || "";
    setPassiveResults((prev) => ({ ...prev, [index]: compareAnswer(input, item.answer) }));
  };

  const handlePassiveHint = (index: number) => {
    const item = passiveSet[index];
    setPassiveHints((prev) => ({ ...prev, [index]: getPassiveHint(item) }));
  };

  const handleSequencingCheck = (index: number) => {
    const item = sequencingSet[index];
    const input = sequencingAnswers[index] || "";
    setSequencingResults((prev) => ({ ...prev, [index]: compareAnswer(input, item.answer) }));
  };

  const handleParagraphCheck = () => {
    setParagraphFeedback(scoreParagraph(paragraph, level, process));
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900">
      <header className="flex h-[74px] items-center justify-between border-b bg-white px-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge>IELTS Academic Task 1</Badge>
            <Badge variant="secondary">Process Diagram</Badge>
            <Badge variant="outline">Final Defense Demo</Badge>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Process Writing Training System</h1>
        </div>

        <div className="flex w-[560px] items-center gap-3">
          <Select value={selectedProcess} onValueChange={setSelectedProcess}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select process" />
            </SelectTrigger>
            <SelectContent>
              {processOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="band55">Band 5.5</SelectItem>
              <SelectItem value="band6">Band 6</SelectItem>
              <SelectItem value="band65">Band 6.5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid h-[calc(100vh-74px)] grid-cols-[48%_52%]">
        <DiagramPanel process={process} imageSrc={imageSrc} />

        <main className="flex min-h-0 flex-col bg-slate-50">
          <StatusBox completionRate={completionRate} level={level} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            <div className="border-b bg-white p-3">
              <TabsList className="grid w-full grid-cols-3 rounded-xl">
                <TabsTrigger value="practice1" className="rounded-lg">
                  <Wand2 className="mr-2 h-4 w-4" /> 1 Passive
                </TabsTrigger>
                <TabsTrigger value="practice2" className="rounded-lg">
                  <Layers3 className="mr-2 h-4 w-4" /> 2 Cohesion
                </TabsTrigger>
                <TabsTrigger value="practice3" className="rounded-lg">
                  <PenLine className="mr-2 h-4 w-4" /> 3 Writing
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="practice1" className="m-0 min-h-0 flex-1 overflow-auto p-5">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Wand2 className="h-5 w-5" /> 
                    {level === "band55" ? "Passive Voice Rewrite" : level === "band6" ? "Sentence Building" : "Academic Writing"}
                  </CardTitle>
                  <CardDescription>
                    {level === "band55" && "Rewrite each sentence in the passive voice."}
                    {level === "band6" && "Build complete passive sentences using diagram vocabulary."}
                    {level === "band65" && "Practise upgrading and expanding passive sentences."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {passiveSet.map((item, index) => (
                    <div key={index} className="rounded-2xl border bg-white p-4">
                      {level === "band65" && (
                        <Badge variant="outline" className="mb-2">
                          {item.type === "upgrade" ? "Upgrade" : "Expand"}
                        </Badge>
                      )}
                      <p className="text-sm font-medium text-slate-500">
                        {level === "band55" ? "Rewrite:" : level === "band6" ? "Build:" : "Task:"}
                      </p>
                      <p className="mt-1 text-base text-slate-900">{item.prompt}</p>
                      {level === "band65" && (
                        <p className="mt-2 text-sm text-blue-600">{item.task}</p>
                      )}
                      <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <Input
                          className="rounded-xl"
                          value={passiveAnswers[index] || ""}
                          onChange={(e) => setPassiveAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                          placeholder={level === "band65" ? "Write or improve the sentence..." : "Write the passive sentence here..."}
                        />
                        <Button className="rounded-xl" onClick={() => handlePassiveCheck(index)}>
                          Check
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => handlePassiveHint(index)}>
                          Hint
                        </Button>
                      </div>
                      {passiveHints[index] && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                          {passiveHints[index]}
                        </div>
                      )}
                      {passiveResults[index] !== undefined && (
                        <div
                          className={`mt-3 rounded-xl border p-3 text-sm ${
                            passiveResults[index]
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {passiveResults[index] ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4" />
                            ) : (
                              <AlertCircle className="mt-0.5 h-4 w-4" />
                            )}
                            <div>
                              <p>{passiveResults[index] ? "Correct. Well done." : `Incorrect. ${item.explanation}`}</p>
                              {!passiveResults[index] && <p className="mt-1 font-medium">Expected: {item.answer}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice2" className="m-0 min-h-0 flex-1 overflow-auto p-5">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5" /> Sequencing and Cohesion
                  </CardTitle>
                  <CardDescription>
                    {level === "band55" && "Fill in sequencing expressions to connect steps."}
                    {level === "band6" && "Fill in linkers and practise sentence combining."}
                    {level === "band65" && "Practise advanced linking structures."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {sequencingSet.map((item, index) => (
                    <div key={index} className="rounded-2xl border bg-white p-4">
                      {item.type === "fill" ? (
                        <>
                          <p className="text-base text-slate-900">{item.sentence}</p>
                          <Input
                            className="mt-4 rounded-xl"
                            value={sequencingAnswers[index] || ""}
                            onChange={(e) => setSequencingAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                            placeholder="Fill in the linker..."
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-500">{item.prompt}</p>
                          <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                            <p>1. {item.parts?.[0]}</p>
                            <p>2. {item.parts?.[1]}</p>
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
                        <Button className="rounded-xl" onClick={() => handleSequencingCheck(index)}>
                          Check
                        </Button>
                      </div>
                      {sequencingResults[index] !== undefined && (
                        <div
                          className={`mt-3 rounded-xl border p-3 text-sm ${
                            sequencingResults[index]
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {sequencingResults[index] ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4" />
                            ) : (
                              <AlertCircle className="mt-0.5 h-4 w-4" />
                            )}
                            <div>
                              <p>{sequencingResults[index] ? "Correct. The sequencing works well." : `Incorrect. ${item.explanation}`}</p>
                              {!sequencingResults[index] && <p className="mt-1 font-medium">Suggested answer: {item.answer}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice3" className="m-0 min-h-0 flex-1 overflow-auto p-5">
              <div className="space-y-6">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">{paragraphSet.title}</CardTitle>
                    <CardDescription>{paragraphSet.instruction}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock3 className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Time limit</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{formatTime(timeLeft)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" className="rounded-xl" onClick={() => setIsRunning(true)}>
                            Start
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setIsRunning(false)}>
                            Pause
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={resetTimer}>
                            Reset
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Word count</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{getWordCount(paragraph)}</p>
                        <p className="mt-2 text-sm text-slate-600">Suggested length: {paragraphSet.targetLength}</p>
                      </div>

                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Writing goal</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          Write a factual paragraph of 100+ words while keeping the diagram visible.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-700">Sentence bank from earlier practice</p>
                      <ul className="max-h-48 space-y-2 overflow-auto text-sm text-slate-700">
                        {paragraphSet.notes.map((note, index) => (
                          <li key={index}>- {note}</li>
                        ))}
                      </ul>
                    </div>

                    <Textarea
                      className="min-h-[340px] rounded-2xl bg-white"
                      placeholder="Write your paragraph here..."
                      value={paragraph}
                      onChange={(e) => setParagraph(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-xl" onClick={handleParagraphCheck}>
                        Check Paragraph
                      </Button>
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
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
