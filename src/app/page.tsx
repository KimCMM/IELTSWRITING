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

const LEVEL_LABELS: Record<string, string> = {
  band55: "Band 5.5",
  band6: "Band 6",
  band65: "Band 6.5"
};

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

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
      makeStep("Plant bamboo plants (Spring)", "People plant bamboo plants in spring.", "Bamboo plants are planted in spring.", "bamboo plants / plant / in spring", "plant bamboo plants / spring", "being planted in spring", "the harvesting of bamboo plants in autumn"),
      makeStep("Harvest (Autumn)", "Workers harvest bamboo plants in autumn.", "Bamboo plants are harvested in autumn.", "bamboo plants / harvest / in autumn", "harvest / autumn", "being harvested in autumn", "the cutting of bamboo into strips"),
      makeStep("Cut into strips", "Workers cut bamboo into strips.", "Bamboo is cut into strips.", "bamboo / cut / into strips", "cut / into strips", "being cut into strips", "the crushing of the strips"),
      makeStep("Crush strips", "Workers crush the strips.", "The strips are crushed.", "the strips / crush", "crush strips", "being crushed", "the filtering of the fibres"),
      makeStep("Filter", "Workers filter the fibres.", "The fibres are filtered.", "the fibres / filter", "filter", "being filtered", "the softening of the fibres"),
      makeStep("Soften fibres", "Workers soften the fibres.", "The fibres are softened.", "the fibres / soften", "soften fibres", "being softened", "the spinning of the fibres into yarn"),
      makeStep("Spin", "Machines spin the fibres into yarn.", "The fibres are spun into yarn.", "the fibres / spin / into yarn", "spin / yarn", "being spun into yarn", "the weaving of the yarn into fabric"),
      makeStep("Weave", "Machines weave the yarn into fabric.", "The yarn is woven into fabric.", "the yarn / weave / into fabric", "weave / fabric", "being woven into fabric", "the production of fabric")
    ]
  },
  sugar: {
    id: "sugar",
    title: "Sugar from Sugar Cane",
    diagramLabel: "How sugar is produced from sugar cane",
    shortDescription: "A manufacturing process showing how sugar is made from sugar cane.",
    steps: [
      makeStep("Growing (12-18 months)", "Farmers grow sugar cane for 12-18 months.", "Sugar cane is grown for 12-18 months.", "sugar cane / grow / for 12-18 months", "grow / 12-18 months", "being grown for 12-18 months", "the harvesting of sugar cane"),
      makeStep("Harvesting", "Workers harvest the sugar cane.", "The sugar cane is harvested.", "the sugar cane / harvest", "harvest", "being harvested", "the crushing of the sugar cane"),
      makeStep("Crushing", "Machines crush the sugar cane.", "The sugar cane is crushed.", "the sugar cane / crush", "crush", "being crushed", "the purification of the juice"),
      makeStep("Purifying juice", "Workers purify the juice.", "The juice is purified.", "the juice / purify", "purify juice", "being purified", "the evaporation of the juice"),
      makeStep("Evaporator", "Heat turns the juice into syrup.", "The juice is turned into syrup.", "the juice / turn into syrup", "turn into syrup", "being turned into syrup", "the separation of sugar crystals from syrup"),
      makeStep("Centrifuge", "A centrifuge separates sugar crystals from syrup.", "Sugar crystals are separated from syrup.", "sugar crystals / separate / from syrup", "separate sugar crystals / syrup", "being separated from syrup", "the drying and cooling of the sugar"),
      makeStep("Drying and cooling", "Machines dry and cool the sugar.", "The sugar is dried and cooled.", "the sugar / dry and cool", "dry and cool sugar", "being dried and cooled", "the production of sugar")
    ]
  },
  noodles: {
    id: "noodles",
    title: "Instant Noodles",
    diagramLabel: "Manufacturing instant noodles",
    shortDescription: "A manufacturing process showing how instant noodles are made.",
    steps: [
      makeStep("Storage silos", "The factory stores flour in storage silos.", "Flour is stored in storage silos.", "flour / store / in storage silos", "storage silos / flour", "being stored in storage silos", "the mixing of flour, water and oil"),
      makeStep("Mixer (water + oil)", "Workers mix flour with water and oil.", "Flour is mixed with water and oil.", "flour / mix / with water and oil", "mixer / water / oil", "being mixed with water and oil", "the rolling of the dough into sheets"),
      makeStep("Dough sheets", "Machines roll the dough into sheets.", "The dough is rolled into sheets.", "the dough / roll / into sheets", "dough sheets", "being rolled into sheets", "the cutting of the dough into strips"),
      makeStep("Dough strips", "Machines cut the dough into strips.", "The dough is cut into strips.", "the dough / cut / into strips", "dough strips", "being cut into strips", "the formation of noodle discs"),
      makeStep("Noodle discs", "Machines form noodle discs.", "Noodle discs are formed.", "noodle discs / form", "noodle discs", "being formed", "the cooking and drying of the noodle discs"),
      makeStep("Cooking and drying", "Machines cook and dry the noodle discs.", "The noodle discs are cooked and dried.", "the noodle discs / cook and dry", "cooking / drying", "being cooked and dried", "the adding of vegetables and spices"),
      makeStep("Vegetables and spices", "Workers add vegetables and spices.", "Vegetables and spices are added.", "vegetables and spices / add", "vegetables / spices", "being added", "the labelling and sealing of the cups"),
      makeStep("Labelling and sealing", "Workers label and seal the cups.", "The cups are labelled and sealed.", "the cups / label and seal", "labelling / sealing", "being labelled and sealed", "the production of instant noodles")
    ]
  },
  recycling: {
    id: "recycling",
    title: "Plastic Bottle Recycling",
    diagramLabel: "How plastic bottles are recycled",
    shortDescription: "A recycling process showing how plastic bottles become new products.",
    steps: [
      makeStep("Recycling bin", "People place plastic bottles in a recycling bin.", "Plastic bottles are placed in a recycling bin.", "plastic bottles / place / in a recycling bin", "recycling bin / plastic bottles", "being placed in a recycling bin", "the collection of plastic bottles"),
      makeStep("Collection by truck", "A truck collects the plastic bottles.", "The plastic bottles are collected.", "the plastic bottles / collect", "collect", "being collected", "the sorting of plastic bottles"),
      makeStep("Sorting", "Workers sort the plastic bottles.", "The plastic bottles are sorted.", "the plastic bottles / sort", "sorting", "being sorted", "the compressing of plastic bottles into blocks"),
      makeStep("Compressing into blocks", "Machines compress the plastic bottles into blocks.", "The plastic bottles are compressed into blocks.", "the plastic bottles / compress / into blocks", "compressing / blocks", "being compressed into blocks", "the crushing of the blocks"),
      makeStep("Crushing", "Machines crush the blocks.", "The blocks are crushed.", "the blocks / crush", "crushing", "being crushed", "the producing of plastic pellets"),
      makeStep("Producing plastic pellets", "Machines produce plastic pellets.", "Plastic pellets are produced.", "plastic pellets / produce", "plastic pellets", "being produced", "the heating of the pellets to form raw material"),
      makeStep("Heating pellets", "Heat turns the pellets into raw material.", "The pellets are heated to form raw material.", "the pellets / heat / to form raw material", "heating pellets / raw material", "being heated to form raw material", "the production of end products"),
      makeStep("Producing end products", "Factories produce new products.", "New products are produced.", "new products / produce", "end products", "being produced", "the production of end products")
    ]
  }
};

interface Practice1Item {
  prompt: string;
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
      return { prompt: step.active, answer: step.passive, explanation: "Rewrite the sentence in the passive voice." };
    }
    if (level === "band6") {
      return { prompt: step.prompt6, answer: step.passive, explanation: "Write a complete passive sentence using the prompt." };
    }
    return { prompt: step.prompt65, answer: step.passive, explanation: "Use only words already shown in the diagram." };
  });
}

function buildPractice2(steps: Step[], level: string): Practice2Item[] {
  if (level === "band55") {
    const linkers = ["Firstly", "Next", "After that", "In the next stage", "Then", "After that", "Then", "Finally"];
    return steps.map((step, index) => ({
      type: "fill",
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: linkers[Math.min(index, linkers.length - 1)],
      explanation: "Fill in a suitable sequencing expression."
    }));
  }
  if (level === "band6") {
    const fillLinkers = ["Firstly", "Next", "Subsequently", "After that", "Subsequently", "Then", "After that", "Finally"];
    const fillItems = steps.map((step, index) => ({
      type: "fill",
      sentence: `__________, ${lowerFirst(step.passive)}`,
      answer: fillLinkers[Math.min(index, fillLinkers.length - 1)],
      explanation: "Fill in a sequencing expression."
    }));
    const combineItems = steps.slice(0, -1).map((step, index) => {
      const nextStep = steps[index + 1];
      const useBefore = index % 2 === 0;
      return {
        type: "combine",
        prompt: useBefore ? "Combine the sentences using 'before doing':" : "Combine the sentences using 'after doing':",
        parts: [step.passive, nextStep.passive],
        answer: useBefore ? `${step.passive.slice(0, -1)} before ${nextStep.gerund}.` : `${nextStep.passive.slice(0, -1)} after ${step.gerund}.`,
        explanation: "Check both sequence and verb form after before/after."
      };
    });
    return [...fillItems, ...combineItems];
  }
  return steps.slice(0, -1).map((step, index) => {
    const nextStep = steps[index + 1];
    const pattern = index % 3;
    if (pattern === 0) {
      return { type: "combine", prompt: "Combine the sentences using 'after doing':", parts: [step.passive, nextStep.passive], answer: `${nextStep.passive.slice(0, -1)} after ${step.gerund}.`, explanation: "Use after + doing / being done." };
    }
    if (pattern === 1) {
      return { type: "combine", prompt: "Combine the ideas using 'followed by':", parts: [step.passive, nextStep.passive], answer: `${step.passive.slice(0, -1)}, followed by ${nextStep.nounPhrase}.`, explanation: "Use followed by + noun or gerund phrase." };
    }
    return { type: "combine", prompt: "Combine the sentences using 'after which':", parts: [step.passive, nextStep.passive], answer: `${step.passive.slice(0, -1)}, after which ${lowerFirst(nextStep.passive)}.`, explanation: "Use after which to link two clauses." };
  });
}

function buildPractice3(steps: Step[], level: string): ParagraphTask {
  if (level === "band55") {
    return {
      title: "Band 5.5 Timed Paragraph Writing",
      instruction: "Write one factual body paragraph about the process using the passive sentences and basic sequencing expressions from the earlier practices.",
      notes: steps.map((s) => s.passive),
      hint: "Use basic sequencing expressions such as firstly, next, after that, then, and finally. Do not add information that is not shown in the diagram.",
      model: steps.map((s, i) => `${["Firstly", "Next", "After that", "In the next stage", "Then", "After that", "Then", "Finally"][Math.min(i, 7)]}, ${lowerFirst(s.passive)}`).join(" "),
      targetLength: "100+ words"
    };
  }
  if (level === "band6") {
    return {
      title: "Band 6 Timed Paragraph Writing",
      instruction: "Write one factual body paragraph describing the process. Reuse subsequently and before/after doing from Practice 2.",
      notes: steps.map((s) => s.passive),
      hint: "Use subsequently at least once and combine some stages with before/after doing. Keep your paragraph fully factual.",
      model: steps.slice(0, -1).map((s, i) => {
        const next = steps[i + 1];
        if (i % 2 === 0) return `${s.passive.slice(0, -1)} before ${next.gerund}.`;
        return `Subsequently, ${lowerFirst(next.passive)}`;
      }).join(" "),
      targetLength: "100+ words"
    };
  }
  return {
    title: "Band 6.5 Timed Paragraph Writing",
    instruction: "Write one factual body paragraph in a more academic style using after doing, followed by, and after which from Practice 2.",
    notes: steps.map((s) => s.passive),
    hint: "Use at least two advanced linking structures, but do not add any process details that are not shown in the diagram.",
    model: steps.slice(0, -1).map((s, i) => {
      const next = steps[i + 1];
      if (i % 3 === 0) return `${next.passive.slice(0, -1)} after ${s.gerund}.`;
      if (i % 3 === 1) return `${s.passive.slice(0, -1)}, followed by ${next.nounPhrase}.`;
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
  const keywords = process.steps.flatMap((s) => s.passive.toLowerCase().split(/[^a-z0-9-]+/)).filter((w) => w.length > 3);
  const keywordCount = [...new Set(keywords)].filter((w) => lower.includes(w)).length;
  const wordCount = getWordCount(text);
  const feedback: string[] = [];
  if (keywordCount >= 6) feedback.push("You included several key stages from the process.");
  else feedback.push("Try to include more important stages from the diagram.");
  if (sequencingWords.some((w) => lower.includes(w))) feedback.push("Your paragraph uses sequencing language clearly.");
  else feedback.push("Add clearer sequencing language to show the order of stages.");
  if (passiveMarkers.some((w) => ` ${lower} `.includes(w))) feedback.push("You used passive structures appropriately for a process diagram.");
  else feedback.push("Use passive voice more consistently when describing the process.");
  if (wordCount < 100) feedback.push("Try to write at least 100 words within the 20-minute limit.");
  if (level === "band65" && !lower.includes("after which") && !lower.includes("followed by")) feedback.push("Try to include at least one advanced linker such as 'followed by' or 'after which'.");
  return feedback;
}

function DiagramPanel({ process }: { process: ProcessData }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl"><Workflow className="h-5 w-5" /> Process Diagram Overview</CardTitle>
        <CardDescription>{process.diagramLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, index) => (
            <div key={index} className="rounded-2xl border bg-slate-50 p-3 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
              <p className="mt-2 font-medium">{step.label}</p>
              <p className="mt-2 leading-6 text-slate-600">{step.passive}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProcessWritingTrainingWebapp() {
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

  const resetTimer = () => { setTimeLeft(20 * 60); setIsRunning(false); };

  const getPassiveHint = (exercise: Practice1Item, input: string): string => {
    if (level === "band55") return `Structure: subject + is/are + past participle`;
    if (level === "band6") return `Hint: use the correct be verb and complete the whole passive sentence.`;
    if (!input.toLowerCase().includes("is") && !input.toLowerCase().includes("are")) return "Check whether you have built a passive sentence: be + past participle.";
    return "Check whether you only used vocabulary shown in the diagram.";
  };

  const handlePassiveCheck = (index: number) => {
    const item = passiveSet[index];
    const input = passiveAnswers[index] || "";
    setPassiveResults((prev) => ({ ...prev, [index]: compareAnswer(input, item.answer) }));
  };

  const handlePassiveHint = (index: number) => {
    const item = passiveSet[index];
    const input = passiveAnswers[index] || "";
    setPassiveHints((prev) => ({ ...prev, [index]: getPassiveHint(item, input) }));
  };

  const handleSequencingCheck = (index: number) => {
    const item = sequencingSet[index];
    const input = sequencingAnswers[index] || "";
    setSequencingResults((prev) => ({ ...prev, [index]: compareAnswer(input, item.answer) }));
  };

  const handleParagraphCheck = () => setParagraphFeedback(scoreParagraph(paragraph, level, process));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full">IELTS Academic Task 1</Badge>
                <Badge variant="secondary" className="rounded-full">Process Diagram</Badge>
                <Badge variant="outline" className="rounded-full">Training System</Badge>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">Process Writing Training System</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                A product-level prototype that keeps the process steps visible throughout the full training journey.
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
                <p className="mt-2 text-slate-600">{completionRate}% completed for {process.title} at {LEVEL_LABELS[level]}.</p>
              </div>
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
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <DiagramPanel process={process} />
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><Wand2 className="h-5 w-5" /> Passive Voice Transformation</CardTitle>
                  <CardDescription>Every step in the diagram is practised here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 max-h-[1000px] overflow-auto pr-2">
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
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                          {passiveHints[index]}
                        </div>
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
            </div>
          </TabsContent>

          <TabsContent value="practice2">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <DiagramPanel process={process} />
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5" /> Sequencing and Cohesion</CardTitle>
                  <CardDescription>Every step is linked in this stage as well.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 max-h-[1000px] overflow-auto pr-2">
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
            </div>
          </TabsContent>

          <TabsContent value="practice3">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <DiagramPanel process={process} />
              <div className="space-y-6">
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
                        <p className="mt-2 text-sm leading-6 text-slate-700">Write a factual paragraph of 100+ words while keeping the diagram visible, like a computer-based IELTS task.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-700">Sentence bank from earlier practice</p>
                      <ul className="space-y-2 text-sm text-slate-700 max-h-52 overflow-auto">
                        {paragraphSet.notes.map((note, index) => <li key={index}>• {note}</li>)}
                      </ul>
                    </div>

                    <Textarea 
                      className="min-h-[280px] rounded-2xl" 
                      placeholder="Write your paragraph here..." 
                      value={paragraph} 
                      onChange={(e) => setParagraph(e.target.value)} 
                    />

                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-xl" onClick={handleParagraphCheck}>Check Paragraph</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowHint((prev) => !prev)}>{showHint ? "Hide Hint" : "Show Hint"}</Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowModel((prev) => !prev)}>{showModel ? "Hide Model" : "Show Model"}</Button>
                    </div>

                    {paragraphFeedback.length > 0 && (
                      <div className="rounded-2xl border bg-white p-4">
                        <p className="text-sm font-medium text-slate-700">Feedback</p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {paragraphFeedback.map((item, index) => <li key={index}>• {item}</li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader><CardTitle className="text-lg">Learning Support</CardTitle></CardHeader>
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
                      <div className="rounded-2xl border border-dashed bg-slate-50 p-4 text-slate-500">Open Hint or Model to support learners when needed.</div>
                    )}
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
