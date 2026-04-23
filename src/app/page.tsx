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
import { CheckCircle2, AlertCircle, Clock3, FileText, Sparkles, Wand2, Workflow } from "lucide-react";

const LEVEL_LABELS = {
  band55: "Band 5.5",
  band6: "Band 6",
  band65: "Band 6.5"
};

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

const linkerSequence55 = [
  "Firstly",
  "Next",
  "After that",
  "In the next stage",
  "Then",
  "After that",
  "Then",
  "Finally"
];

const linkerSequence6 = [
  "Firstly",
  "Next",
  "Subsequently",
  "After that",
  "Subsequently",
  "Then",
  "After that",
  "Finally"
];

interface Step {
  label: string;
  active: string;
  passive: string;
  prompt6: string;
  prompt65: string;
  gerund: string;
  nounPhrase: string;
}

interface ProcessData {
  id: string;
  title: string;
  diagramLabel: string;
  shortDescription: string;
  steps: Step[];
}

function makeStep(
  label: string,
  active: string,
  passive: string,
  prompt6: string,
  prompt65: string,
  gerund: string,
  nounPhrase: string
): Step {
  return { label, active, passive, prompt6, prompt65, gerund, nounPhrase };
}

const processLibrary: Record<string, ProcessData> = {
  bamboo: {
    id: "bamboo",
    title: "Bamboo Fabric",
    diagramLabel: "How bamboo fabric is made",
    shortDescription: "A linear process showing how bamboo is turned into fabric.",
    steps: [
      makeStep(
        "Plant bamboo plants (Spring)",
        "People plant bamboo plants in spring.",
        "Bamboo plants are planted in spring.",
        "bamboo plants / plant / in spring",
        "plant bamboo plants / spring",
        "being planted in spring",
        "the harvesting of bamboo plants in autumn"
      ),
      makeStep(
        "Harvest (Autumn)",
        "Workers harvest bamboo plants in autumn.",
        "Bamboo plants are harvested in autumn.",
        "bamboo plants / harvest / in autumn",
        "harvest / autumn",
        "being harvested in autumn",
        "the cutting of bamboo into strips"
      ),
      makeStep(
        "Cut into strips",
        "Workers cut bamboo into strips.",
        "Bamboo is cut into strips.",
        "bamboo / cut / into strips",
        "cut / into strips",
        "being cut into strips",
        "the crushing of the strips"
      ),
      makeStep(
        "Crush strips (to make liquid pulp)",
        "Workers crush the strips.",
        "The strips are crushed.",
        "the strips / crush",
        "crush strips",
        "being crushed",
        "the filtering of the fibres"
      ),
      makeStep(
        "Filter (separate long fibres from liquid)",
        "Workers filter the fibres.",
        "The fibres are filtered.",
        "the fibres / filter",
        "filter",
        "being filtered",
        "the softening of the fibres"
      ),
      makeStep(
        "Soften fibres (add water and amine oxide)",
        "Workers soften the fibres.",
        "The fibres are softened.",
        "the fibres / soften",
        "soften fibres",
        "being softened",
        "the spinning of the fibres into yarn"
      ),
      makeStep(
        "Spin (to make yarn)",
        "Machines spin the fibres into yarn.",
        "The fibres are spun into yarn.",
        "the fibres / spin / into yarn",
        "spin / yarn",
        "being spun into yarn",
        "the weaving of the yarn into fabric"
      ),
      makeStep(
        "Weave (to make fabric)",
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
    id: "sugar",
    title: "Sugar from Sugar Cane",
    diagramLabel: "How sugar is produced from sugar cane",
    shortDescription: "A manufacturing process showing how sugar is made from sugar cane.",
    steps: [
      makeStep(
        "Growing (12-18 months)",
        "Farmers grow sugar cane for 12-18 months.",
        "Sugar cane is grown for 12-18 months.",
        "sugar cane / grow / for 12-18 months",
        "grow / 12-18 months",
        "being grown for 12-18 months",
        "the harvesting of sugar cane"
      ),
      makeStep(
        "Harvesting",
        "Workers harvest the sugar cane.",
        "The sugar cane is harvested.",
        "the sugar cane / harvest",
        "harvest",
        "being harvested",
        "the crushing of the sugar cane"
      ),
      makeStep(
        "Crushing",
        "Machines crush the sugar cane.",
        "The sugar cane is crushed.",
        "the sugar cane / crush",
        "crush",
        "being crushed",
        "the purification of the juice"
      ),
      makeStep(
        "Purifying juice",
        "Workers purify the juice.",
        "The juice is purified.",
        "the juice / purify",
        "purify juice",
        "being purified",
        "the evaporation of the juice"
      ),
      makeStep(
        "Evaporator (juice becomes syrup)",
        "Heat turns the juice into syrup.",
        "The juice is turned into syrup.",
        "the juice / turn into syrup",
        "turn into syrup",
        "being turned into syrup",
        "the separation of sugar crystals from syrup"
      ),
      makeStep(
        "Centrifuge (separates sugar crystals from syrup)",
        "A centrifuge separates sugar crystals from syrup.",
        "Sugar crystals are separated from syrup.",
        "sugar crystals / separate / from syrup",
        "separate sugar crystals / syrup",
        "being separated from syrup",
        "the drying and cooling of the sugar"
      ),
      makeStep(
        "Drying and cooling",
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
    id: "noodles",
    title: "Instant Noodles",
    diagramLabel: "Manufacturing instant noodles",
    shortDescription: "A manufacturing process showing how instant noodles are made.",
    steps: [
      makeStep(
        "Storage silos",
        "The factory stores flour in storage silos.",
        "Flour is stored in storage silos.",
        "flour / store / in storage silos",
        "storage silos / flour",
        "being stored in storage silos",
        "the mixing of flour, water and oil"
      ),
      makeStep(
        "Mixer (water + oil)",
        "Workers mix flour with water and oil.",
        "Flour is mixed with water and oil.",
        "flour / mix / with water and oil",
        "mixer / water / oil",
        "being mixed with water and oil",
        "the rolling of the dough into sheets"
      ),
      makeStep(
        "Dough sheets",
        "Machines roll the dough into sheets.",
        "The dough is rolled into sheets.",
        "the dough / roll / into sheets",
        "dough sheets",
        "being rolled into sheets",
        "the cutting of the dough into strips"
      ),
      makeStep(
        "Dough strips",
        "Machines cut the dough into strips.",
        "The dough is cut into strips.",
        "the dough / cut / into strips",
        "dough strips",
        "being cut into strips",
        "the formation of noodle discs"
      ),
      makeStep(
        "Noodles discs",
        "Machines form noodle discs.",
        "Noodle discs are formed.",
        "noodle discs / form",
        "noodle discs",
        "being formed",
        "the cooking and drying of the noodle discs"
      ),
      makeStep(
        "Cooking (oil) + drying",
        "Machines cook and dry the noodle discs.",
        "The noodle discs are cooked and dried.",
        "the noodle discs / cook and dry",
        "cooking / drying",
        "being cooked and dried",
        "the adding of vegetables and spices"
      ),
      makeStep(
        "Vegetables + spices",
        "Workers add vegetables and spices.",
        "Vegetables and spices are added.",
        "vegetables and spices / add",
        "vegetables / spices",
        "being added",
        "the labelling and sealing of the cups"
      ),
      makeStep(
        "Labelling + sealing",
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
    id: "recycling",
    title: "Plastic Bottle Recycling",
    diagramLabel: "How plastic bottles are recycled",
    shortDescription: "A recycling process showing how plastic bottles become new products.",
    steps: [
      makeStep(
        "Placing bottles in a recycling bin",
        "People place plastic bottles in a recycling bin.",
        "Plastic bottles are placed in a recycling bin.",
        "plastic bottles / place / in a recycling bin",
        "recycling bin / plastic bottles",
        "being placed in a recycling bin",
        "the collection of plastic bottles"
      ),
      makeStep(
        "Collection by truck",
        "A truck collects the plastic bottles.",
        "The plastic bottles are collected.",
        "the plastic bottles / collect",
        "collect",
        "being collected",
        "the sorting of plastic bottles"
      ),
      makeStep(
        "Sorting at the recycling centre",
        "Workers sort the plastic bottles.",
        "The plastic bottles are sorted.",
        "the plastic bottles / sort",
        "sorting",
        "being sorted",
        "the compressing of plastic bottles into blocks"
      ),
      makeStep(
        "Compressing into blocks",
        "Machines compress the plastic bottles into blocks.",
        "The plastic bottles are compressed into blocks.",
        "the plastic bottles / compress / into blocks",
        "compressing / blocks",
        "being compressed into blocks",
        "the crushing of the blocks"
      ),
      makeStep(
        "Crushing",
        "Machines crush the blocks.",
        "The blocks are crushed.",
        "the blocks / crush",
        "crushing",
        "being crushed",
        "the producing of plastic pellets"
      ),
      makeStep(
        "Producing plastic pellets",
        "Machines produce plastic pellets.",
        "Plastic pellets are produced.",
        "plastic pellets / produce",
        "plastic pellets",
        "being produced",
        "the heating of the pellets to form raw material"
      ),
      makeStep(
        "Heating pellets to form raw material",
        "Heat turns the pellets into raw material.",
        "The pellets are heated to form raw material.",
        "the pellets / heat / to form raw material",
        "heating pellets / raw material",
        "being heated to form raw material",
        "the formation of new products"
      ),
      makeStep(
        "Producing end products",
        "Factories make new products.",
        "New products are produced.",
        "new products / produce",
        "end products",
        "being produced",
        "the production of end products"
      )
    ]
  }
};

interface Practice1Item {
  prompt: string;
  subject: string;
  answer: string;
  explanation: string;
}

interface Practice2Item {
  type: string;
  sentence?: string;
  prompt?: string;
  parts?: string[];
  answer: string;
  explanation: string;
}

interface ParagraphTask {
  title: string;
  instruction: string;
  notes: string[];
  hint: string;
  model: string;
  targetLength: string;
}

function buildPractice1(steps: Step[], level: string): Practice1Item[] {
  return steps.map((step) => {
    if (level === "band55") {
      return {
        prompt: step.active,
        subject: step.passive.split(" ").slice(0, 3).join(" "),
        answer: step.passive,
        explanation: "Rewrite the sentence in the passive voice."
      };
    }
    if (level === "band6") {
      return {
        prompt: step.prompt6,
        subject: step.passive.split(" ").slice(0, 3).join(" "),
        answer: step.passive,
        explanation: "Write a complete passive sentence using the prompt."
      };
    }
    return {
      prompt: step.prompt65,
      subject: step.passive.split(" ").slice(0, 3).join(" "),
      answer: step.passive,
      explanation: "Use only the words from the diagram to build a complete passive sentence."
    };
  });
}

function buildPractice2(steps: Step[], level: string): Practice2Item[] {
  if (level === "band55") {
    return steps.map((step, index) => ({
      type: "fill",
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: linkerSequence55[Math.min(index, linkerSequence55.length - 1)],
      explanation: "Fill in an appropriate sequencing expression."
    }));
  }

  if (level === "band6") {
    const fillItems = steps.map((step, index) => ({
      type: "fill",
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: linkerSequence6[Math.min(index, linkerSequence6.length - 1)],
      explanation: "Fill in a sequencing expression."
    }));

    const combineItems = steps.slice(0, -1).map((step, index) => {
      const nextStep = steps[index + 1];
      const useBefore = index % 2 === 0;
      return {
        type: "combine",
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
    const pattern = index % 3;

    if (pattern === 0) {
      return {
        type: "combine",
        prompt: "Combine the sentences using 'after doing':",
        parts: [step.passive, nextStep.passive],
        answer: `${nextStep.passive.slice(0, -1)} after ${step.gerund}.`,
        explanation: "Use after + doing / being done to combine the two steps."
      };
    }

    if (pattern === 1) {
      return {
        type: "combine",
        prompt: "Combine the ideas using 'followed by':",
        parts: [step.passive, nextStep.passive],
        answer: `${step.passive.slice(0, -1)}, followed by ${nextStep.nounPhrase}.`,
        explanation: "Use followed by + noun or gerund phrase, not a full clause."
      };
    }

    return {
      type: "combine",
      prompt: "Combine the sentences using 'after which':",
      parts: [step.passive, nextStep.passive],
      answer: `${step.passive.slice(0, -1)}, after which ${lowerFirst(nextStep.passive)}.`,
      explanation: "Use after which to link two sequential clauses."
    };
  });
}

function buildPractice3(steps: Step[], level: string): ParagraphTask {
  const notes55 = steps.map((s) => s.passive);
  const notes6 = steps.map((s, i) => {
    if (i === 0) return s.passive;
    if (i === 2 || i === 4) return `Subsequently, ${lowerFirst(s.passive)}`;
    return s.passive;
  });
  const notes65 = steps.map((s, i) => {
    if (i === 1) return `${steps[0].passive.slice(0, -1)}, followed by ${steps[1].nounPhrase}.`;
    if (i === 3 && steps[2]) return `${steps[2].passive.slice(0, -1)}, after which ${lowerFirst(steps[3].passive)}.`;
    return s.passive;
  });

  if (level === "band55") {
    return {
      title: "Band 5.5 Timed Paragraph Writing",
      instruction: "Write one body paragraph about the process. Reuse the passive sentences and basic sequencing expressions from Practice 1 and Practice 2.",
      notes: notes55,
      hint: "Use basic sequencing expressions such as firstly, next, after that, then, and finally. Keep the paragraph factual and avoid adding information that is not shown in the diagram.",
      model: steps
        .map((s, i) => `${linkerSequence55[Math.min(i, linkerSequence55.length - 1)]}, ${lowerFirst(s.passive)}`)
        .join(" "),
      targetLength: "100+ words"
    };
  }

  if (level === "band6") {
    return {
      title: "Band 6 Timed Paragraph Writing",
      instruction: "Write one body paragraph describing the process. Reuse the structures from Practice 2, especially subsequently and before/after doing.",
      notes: notes6,
      hint: "Combine some neighbouring stages using before/after doing, and use subsequently at least once. Only include information shown in the process diagram.",
      model: `${steps[0].passive.slice(0, -1)} before ${steps[1].gerund}. Subsequently, ${lowerFirst(steps[2]?.passive || "")}. ${steps[3] ? `${steps[3].passive.slice(0, -1)} after ${steps[2].gerund}.` : ""} ${steps.slice(4).map((s, i) => `${i === steps.slice(4).length - 1 ? "Finally" : "Then"}, ${lowerFirst(s.passive)}`).join(" ")}`.trim(),
      targetLength: "100+ words"
    };
  }

  return {
    title: "Band 6.5 Timed Paragraph Writing",
    instruction: "Write one body paragraph in a more academic style. Reuse after doing, followed by, and after which from Practice 2.",
    notes: notes65,
    hint: "Use at least two advanced linking structures, but keep the paragraph fully factual. Do not add any process details that are not shown in the diagram.",
    model: steps.slice(0, -1).map((s, i) => {
      const next = steps[i + 1];
      const pattern = i % 3;
      if (pattern === 0) return `${next.passive.slice(0, -1)} after ${s.gerund}.`;
      if (pattern === 1) return `${s.passive.slice(0, -1)}, followed by ${next.nounPhrase}.`;
      return `${s.passive.slice(0, -1)}, after which ${lowerFirst(next.passive)}.`;
    }).join(" "),
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
  const sequencingWords = ["firstly", "next", "after that", "in the next stage", "then", "finally", "subsequently", "followed by", "after which"];
  const passiveMarkers = [" is ", " are ", " was ", " were ", " being ", " been "];
  const diagramWords = process.steps
    .map((s) => `${s.label} ${s.passive}`.toLowerCase())
    .join(" ")
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length > 3);
  const keywordCount = [...new Set(diagramWords)].filter((w) => lower.includes(w)).length;
  const wordCount = getWordCount(text);
  const feedback: string[] = [];

  if (keywordCount >= 6) {
    feedback.push("You included several key stages from the process.");
  } else {
    feedback.push("Try to include more important stages from the diagram.");
  }

  if (sequencingWords.some((w) => lower.includes(w))) {
    feedback.push("Your paragraph uses sequencing language to guide the reader clearly.");
  } else {
    feedback.push("Add clearer sequencing language to show how one stage leads to the next.");
  }

  if (passiveMarkers.some((w) => ` ${lower} `.includes(w))) {
    feedback.push("You used passive structures, which are appropriate for process diagrams.");
  } else {
    feedback.push("Use passive voice more consistently when describing process stages.");
  }

  if (wordCount < 100) {
    feedback.push("Try to write at least 100 words so the task feels more complete within the 20-minute limit.");
  }

  if (level === "band65" && !lower.includes("followed by") && !lower.includes("after which")) {
    feedback.push("Try to include at least one advanced linker such as 'followed by' or 'after which'.");
  }

  return feedback;
}

export default function ProcessWritingTrainingWebappDefenseVersionV2() {
  const [selectedProcess, setSelectedProcess] = useState("bamboo");
  const [level, setLevel] = useState("band55");
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
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
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

  const getPassiveHint = (exercise: Practice1Item, input: string, currentLevel: string): string => {
    if (currentLevel === "band55") {
      return `Structure: ${exercise.answer.split(" ")[0]} + is/are + past participle`;
    }
    if (currentLevel === "band6") {
      const beForm = exercise.answer.includes(" are ") ? "are" : "is";
      return `Hint: use '${beForm}' and complete the whole passive sentence.`;
    }
    if (!input.toLowerCase().includes("is") && !input.toLowerCase().includes("are")) {
      return "Check whether you have built a passive sentence: be + past participle.";
    }
    return "Check whether you only used vocabulary shown in the diagram.";
  };

  const handlePassiveCheck = (index: number) => {
    const exercise = passiveSet[index];
    const input = passiveAnswers[index] || "";
    const correct = compareAnswer(input, exercise.answer);
    setPassiveResults((prev) => ({
      ...prev,
      [index]: correct
    }));
  };

  const handlePassiveHint = (index: number) => {
    const exercise = passiveSet[index];
    const input = passiveAnswers[index] || "";
    setPassiveHints((prev) => ({
      ...prev,
      [index]: getPassiveHint(exercise, input, level)
    }));
  };

  const handleSequencingCheck = (index: number) => {
    const exercise = sequencingSet[index];
    const input = sequencingAnswers[index] || "";
    const correct = compareAnswer(input, exercise.answer);
    setSequencingResults((prev) => ({
      ...prev,
      [index]: correct
    }));
  };

  const handleParagraphCheck = () => {
    setParagraphFeedback(scoreParagraph(paragraph, level, process));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full">IELTS Academic Task 1</Badge>
                <Badge variant="secondary" className="rounded-full">Process Diagram</Badge>
                <Badge variant="outline" className="rounded-full">Defense Version V2</Badge>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">Process Writing Training System</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                A product-level prototype that converts real IELTS process diagrams into a complete learning journey: passive accuracy, cohesion control, and 20-minute paragraph production.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Product Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Select process diagram</p>
                <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select process" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bamboo">Bamboo</SelectItem>
                    <SelectItem value="sugar">Sugar</SelectItem>
                    <SelectItem value="noodles">Instant noodles</SelectItem>
                    <SelectItem value="recycling">Recycling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Select learner level</p>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="band55">Band 5.5</SelectItem>
                    <SelectItem value="band6">Band 6</SelectItem>
                    <SelectItem value="band65">Band 6.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border bg-slate-100 p-3 text-sm text-slate-700">
                <p className="font-medium">Learning journey completion</p>
                <Progress value={completionRate} className="mt-2" />
                <p className="mt-2 text-slate-600">{completionRate}% completed for {process.title} at {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Workflow className="h-5 w-5" /> Real IELTS Process Task</CardTitle>
              <CardDescription>{process.diagramLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {process.steps.map((step, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4 text-sm text-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
                    <p className="mt-2 font-medium">{step.label}</p>
                    <p className="mt-2 leading-6 text-slate-600">{step.passive}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Design principles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>1. Every step shown in the diagram is practised in Practice 1 and Practice 2.</p>
              <p>2. The 6.5 prompts only use vocabulary already shown in the diagram.</p>
              <p>3. No extra process information is added beyond what the diagram shows.</p>
              <p>4. The final writing stage recommends 100+ words within 20 minutes.</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="practice1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="practice1" className="rounded-xl">Practice 1 Passive Voice</TabsTrigger>
            <TabsTrigger value="practice2" className="rounded-xl">Practice 2 Sequencing</TabsTrigger>
            <TabsTrigger value="practice3" className="rounded-xl">Practice 3 Timed Writing</TabsTrigger>
          </TabsList>

          <TabsContent value="practice1">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Wand2 className="h-5 w-5" /> Passive Voice Transformation</CardTitle>
                <CardDescription>
                  Every step in the diagram is practised here. The amount of support changes by band.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {passiveSet.map((item, index) => (
                  <div key={index} className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-medium text-slate-500">Task prompt</p>
                    <p className="mt-1 text-base text-slate-900">{item.prompt}</p>
                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <div className="flex-1">
                        <Input
                          className="rounded-xl"
                          value={passiveAnswers[index] || ""}
                          onChange={(e) => setPassiveAnswers((prev) => ({ ...prev, [index]: e.target.value }))}
                          placeholder="Write the passive sentence here..."
                        />
                      </div>
                      <Button className="rounded-xl" onClick={() => handlePassiveCheck(index)}>Check Answer</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => handlePassiveHint(index)}>Hint</Button>
                    </div>
                    {passiveHints[index] && (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Hint: {passiveHints[index]}</div>
                    )}
                    {passiveResults[index] !== undefined && (
                      <div className={`mt-3 rounded-xl border p-3 text-sm ${passiveResults[index] ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                        <div className="flex items-start gap-2">
                          {passiveResults[index] ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
                          <div>
                            <p>{passiveResults[index] ? "Correct. Well done." : `Incorrect. ${item.explanation}`}</p>
                            {!passiveResults[index] && <p className="mt-1 font-medium">Correct answer: {item.answer}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice2">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5" /> Sequencing and Cohesion Control</CardTitle>
                <CardDescription>
                  Every step is linked in this stage. Band 5.5 and Band 6 use fill-in tasks, while Band 6.5 moves to full sentence combining.
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
                      <Button className="rounded-xl" onClick={() => handleSequencingCheck(index)}>Check Answer</Button>
                    </div>
                    {sequencingResults[index] !== undefined && (
                      <div className={`mt-3 rounded-xl border p-3 text-sm ${sequencingResults[index] ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                        <div className="flex items-start gap-2">
                          {sequencingResults[index] ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
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

          <TabsContent value="practice3">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{paragraphSet.title}</CardTitle>
                  <CardDescription>{paragraphSet.instruction}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500"><Clock3 className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wide">Time limit</span></div>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{formatTime(timeLeft)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" className="rounded-xl" onClick={() => setIsRunning(true)}>Start</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setIsRunning(false)}>Pause</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={resetTimer}>Reset</Button>
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500"><FileText className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-wide">Word count</span></div>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{getWordCount(paragraph)}</p>
                      <p className="mt-2 text-sm text-slate-600">Suggested length: {paragraphSet.targetLength}</p>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Writing goal</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">Write a factual paragraph of 100+ words using the outputs from Practice 1 and Practice 2.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-700">Sentence bank from earlier practice</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {paragraphSet.notes.map((note, index) => (
                        <li key={index}>- {note}</li>
                      ))}
                    </ul>
                  </div>

                  <Textarea
                    className="min-h-[260px] rounded-2xl"
                    placeholder="Write your paragraph here..."
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-xl" onClick={handleParagraphCheck}>Check Paragraph</Button>
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

              <div className="space-y-6">
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

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Defense talking points</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>Every step shown in the IELTS diagram is practised in both grammar and cohesion work.</p>
                    <p>The 6.5 prompts only contain vocabulary from the actual process diagram.</p>
                    <p>The task stays factual and avoids adding process details that are not shown.</p>
                    <p>The final writing stage is clearly exam-oriented: 20 minutes and 100+ words.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
