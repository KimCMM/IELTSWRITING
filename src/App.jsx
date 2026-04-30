const { memo, useCallback, useEffect, useMemo, useState } = React;

const initialPracticeState = {
  p1Answers: {},
  p1Feedback: {},
  p2Answers: Array(8).fill(""),
  p2Feedback: [],
  cohesionAnswers: {},
  cohesionFeedback: {},
  writing: "",
  submitted: false,
  reflection: ["", "", ""],
};

const linkerOptions = ["first", "next", "then", "in the next stage", "the following stage", "after", "finally"];

const buildBand55Paragraph = (steps) => {
  const answers = steps.map((_, index) => {
    if (index === 0) return "first";
    if (index === 1) return "then";
    if (index === 2) return "after";
    if (index === steps.length - 1) return "finally";
    return index % 2 === 0 ? "then" : "next";
  });

  const text = steps.map((step, index) => {
    if (index === 2) return [index, ` that, ${step.passive} `];
    return [index, `, ${step.passive} `];
  });

  return { text, answers };
};

const makeProcess = (title, task, image, noun, steps) => ({
  title,
  task,
  image,
  steps,
  band65: steps.slice(0, 4).map((step) => ({
    prompt: step.passive,
    task: "Upgrade the sentence with a more formal or precise expression.",
    answer: step.passive,
  })),
  p2Band55: buildBand55Paragraph(steps),
  p2Band6: [
    { type: "fill", sentence: "N____, the material is processed further.", answer: "Next" },
    { type: "fill", sentence: "A____ that, it is shaped into a final form.", answer: "After" },
    { type: "combine", prompt: "Combine with after being.", parts: ["The material is filtered.", "It is dried."], answer: "After being filtered, the material is dried." },
  ],
  p2Band65: [
    { type: "combine", prompt: "Combine with followed by.", parts: ["The material is crushed.", "The separation of fibres takes place."], answer: "The material is crushed, followed by the separation of fibres." },
    { type: "combine", prompt: "Combine with after which.", parts: ["The material is softened.", "It is spun into yarn."], answer: "The material is softened, after which it is spun into yarn." },
  ],
});

const processData = {
  bamboo: makeProcess(
    "Bamboo Fabric",
    "The diagram below shows how fabric is manufactured from bamboo.",
    "https://i0.wp.com/ieltspracticeonline.com/wp-content/uploads/2025/07/Writing-Task-1-BHow-fabric-is-manufactured-from-bamboo.png",
    "bamboo plants",
    [
      { active: "People plant bamboo plants in spring.", passive: "Bamboo plants are planted in spring.", prompt6: "bamboo plants / plant / spring" },
      { active: "People harvest bamboo plants in autumn.", passive: "Bamboo plants are harvested in autumn.", prompt6: "bamboo plants / harvest / autumn" },
      { active: "Workers cut bamboo plants into strips.", passive: "Bamboo plants are cut into strips.", prompt6: "bamboo plants / cut / strips" },
      { active: "Machines crush the strips into pulp.", passive: "The strips are crushed into pulp.", prompt6: "strips / crush / pulp" },
      { active: "Workers separate long fibres.", passive: "Long fibres are separated.", prompt6: "long fibres / separate" },
      { active: "Machines spin the fibres into yarn.", passive: "The fibres are spun into yarn.", prompt6: "fibres / spin / yarn" },
      { active: "Workers weave yarn into fabric.", passive: "Yarn is woven into fabric.", prompt6: "yarn / weave / fabric" },
    ]
  ),
  sugar: makeProcess("Sugar Cane", "The diagram below shows how sugar is produced from sugar cane.", "https://placehold.co/900x520/eef2ff/1e293b?text=Sugar+Cane+Process", "sugar canes", [
    { active: "Farmers grow sugar cane.", passive: "Sugar cane is grown.", prompt6: "sugar cane / grow" },
    { active: "Farmers harvest the cane.", passive: "The cane is harvested.", prompt6: "cane / harvest" },
    { active: "Machines crush the cane.", passive: "The cane is crushed.", prompt6: "cane / crush" },
    { active: "Workers purify the juice.", passive: "The juice is purified.", prompt6: "juice / purify" },
    { active: "Machines evaporate the liquid.", passive: "The liquid is evaporated.", prompt6: "liquid / evaporate" },
  ]),
  noodles: makeProcess("Instant Noodles", "The diagram below shows how instant noodles are manufactured.", "https://placehold.co/900x520/f0fdf4/14532d?text=Instant+Noodles+Process", "noodles", [
    { active: "Workers store flour in silos.", passive: "Flour is stored in silos.", prompt6: "flour / store / silos" },
    { active: "Machines mix flour with water and oil.", passive: "Flour is mixed with water and oil.", prompt6: "flour / mix / water and oil" },
    { active: "Machines roll the dough.", passive: "The dough is rolled.", prompt6: "dough / roll" },
    { active: "Machines cut the noodles.", passive: "The noodles are cut.", prompt6: "noodles / cut" },
    { active: "Workers pack the noodles in cups.", passive: "The noodles are packed in cups.", prompt6: "noodles / pack / cups" },
  ]),
  recycling: makeProcess("Recycling", "The diagram below shows how plastic bottles are recycled.", "https://placehold.co/900x520/ecfeff/164e63?text=Recycling+Process", "plastic bottles", [
    { active: "People collect plastic bottles.", passive: "Plastic bottles are collected.", prompt6: "plastic bottles / collect" },
    { active: "Workers sort the bottles.", passive: "The bottles are sorted.", prompt6: "bottles / sort" },
    { active: "Machines compress the bottles.", passive: "The bottles are compressed.", prompt6: "bottles / compress" },
    { active: "Machines crush the plastic.", passive: "The plastic is crushed.", prompt6: "plastic / crush" },
    { active: "Factories produce new products.", passive: "New products are produced.", prompt6: "new products / produce" },
  ]),
};

const normalize = (text) =>
  text.toLowerCase().replace(/[.,!?;:]/g, "").replace(/[\-–]/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();

const fuzzyMatch = (user, expected, tolerance = 0.85) => {
  const userNorm = normalize(user);
  const expectedNorm = normalize(expected);
  if (userNorm === expectedNorm) return true;
  if (!userNorm || !expectedNorm) return false;
  const longer = userNorm.length > expectedNorm.length ? userNorm : expectedNorm;
  const shorter = longer === userNorm ? expectedNorm : userNorm;
  let matches = 0;
  for (let i = 0; i < shorter.length; i += 1) if (longer[i] === shorter[i]) matches += 1;
  return matches / longer.length >= tolerance;
};

const createErrorRules = (processKey) => [
  { id: "g1", type: "grammar", pattern: /\b(are|is)\s+(place|collect|sort|compress|harvest|spin)\b(?!\w)/gi, message: "Use passive form: are/is + past participle." },
  { id: "l1", type: "lexis", pattern: /\b(end|final)\s+goods\b/gi, message: "Use 'end products' instead of 'end/final goods'." },
  { id: "l2", type: "lexis", pattern: /plastic\s+balls/gi, message: "Use 'plastic pellets', not 'plastic balls'." },
  { id: "l3", type: "lexis", pattern: /raw\s+materials\b/gi, message: "Use 'raw material' in this context." },
  { id: "l4", type: "lexis", pattern: /spinned/gi, message: "Use 'spun', not 'spinned'." },
  ...(processKey === "bamboo" ? [{ id: "b1", type: "lexis", pattern: /\b(fabric|cloth)\s+(is\s+)?manufacture\b/gi, message: "Use 'manufactured' or 'is manufactured'." }] : []),
];

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((previous) => {
        const nextValue = value instanceof Function ? value(previous) : value;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

const Card = memo(({ title, children }) => (
  <section className="card">
    <h2>{title}</h2>
    {children}
  </section>
));

const Tab = memo(({ value, label, active, onSelect }) => (
  <button className={`tab ${active === value ? "active" : ""}`} type="button" onClick={() => onSelect(value)} role="tab" aria-selected={active === value}>
    {label}
  </button>
));

function App() {
  const [processKey, setProcessKey] = useState("bamboo");
  const [level, setLevel] = useState("band55");
  const [activePractice, setActivePractice] = useState("practice1");
  const [scoreMap, setScoreMap] = useLocalStorage("ieltsScores", {});
  const [state, setState] = useState(initialPracticeState);
  const [p1Hints, setP1Hints] = useState({});
  const [p2Hint, setP2Hint] = useState("");
  const [writingHint, setWritingHint] = useState("");
  const [selectedLinker, setSelectedLinker] = useState("");

  const current = processData[processKey] || processData.bamboo;
  const scoreKey = `${processKey}-${level}`;
  const earned = scoreMap[scoreKey] || {};
  const totalScore = (earned.p1 ? 2 : 0) + (earned.p2 ? 3 : 0) + (earned.p3 ? 5 : 0);

  const reset = useCallback(() => {
    setState({ ...initialPracticeState, p2Answers: Array(8).fill(""), reflection: ["", "", ""] });
    setP1Hints({});
    setP2Hint("");
    setWritingHint("");
  }, []);

  const changeProcessOrLevel = useCallback(
    (nextProcess, nextLevel) => {
      setProcessKey(nextProcess);
      setLevel(nextLevel);
      reset();
    },
    [reset]
  );

  const award = useCallback(
    (practice) => {
      setScoreMap((previous) => {
        const currentScore = previous[scoreKey] || {};
        if (currentScore[practice]) return previous;
        return { ...previous, [scoreKey]: { ...currentScore, [practice]: true } };
      });
    },
    [scoreKey, setScoreMap]
  );

  const practice1Tasks = useMemo(() => {
    if (level === "band55") return current.steps.map((s) => ({ prompt: s.active, answer: s.passive, instruction: "Rewrite the active sentence in the passive voice." }));
    if (level === "band6") return current.steps.map((s) => ({ prompt: s.prompt6, answer: s.passive, instruction: "Use the words and the diagram to write a passive sentence." }));
    return current.band65.map((s) => ({ prompt: s.prompt, answer: s.answer, instruction: s.task }));
  }, [current, level]);

  const cohesionTasks = level === "band6" ? current.p2Band6 : current.p2Band65;
  const errorRules = useMemo(() => createErrorRules(processKey), [processKey]);
  const wordCount = useMemo(() => (state.writing.trim() ? state.writing.trim().split(/\s+/).length : 0), [state.writing]);

  const detectedErrors = useMemo(() => {
    if (!state.submitted) return [];
    const found = [];
    errorRules.forEach((rule) => {
      for (const match of state.writing.matchAll(rule.pattern)) found.push({ ...rule, match: match[0], index: match.index || 0 });
    });
    return found.sort((a, b) => a.index - b.index);
  }, [state.submitted, state.writing, errorRules]);

  const reflectionComplete = state.reflection.every((item) => item.trim());
  const p3Pass = state.submitted && detectedErrors.length === 0 && reflectionComplete;

  useEffect(() => {
    if (p3Pass && !earned.p3) award("p3");
  }, [p3Pass, earned.p3, award]);

  const checkP1 = (index) => {
    const ok = fuzzyMatch(state.p1Answers[index] || "", practice1Tasks[index].answer);
    setState((prev) => ({ ...prev, p1Feedback: { ...prev.p1Feedback, [index]: ok } }));
    const allCorrect = practice1Tasks.every((task, i) => fuzzyMatch(i === index ? state.p1Answers[index] || "" : state.p1Answers[i] || "", task.answer));
    if (allCorrect) award("p1");
  };

  const showP1Hint = (index, task) => {
    let hint;
    if (level === "band55") {
      hint = `Task ${index + 1}: Use the present simple passive voice: is/are + past participle (done). Move the object to the subject position, then choose is or are.`;
    } else if (level === "band6") {
      hint = `Task ${index + 1}: Use present simple passive voice: is/are + past participle. Add the details from the prompt in the correct order.`;
    } else {
      hint = `Task ${index + 1}: ${task.instruction}`;
    }
    setP1Hints((previous) => ({ ...previous, [index]: hint }));
  };

  const fillBlank = (index) => {
    if (!selectedLinker) return;
    setState((prev) => {
      const p2Answers = [...prev.p2Answers];
      p2Answers[index] = selectedLinker;
      return { ...prev, p2Answers, p2Feedback: [] };
    });
  };

  const checkParagraph = () => {
    const feedback = current.p2Band55.answers.map((expected, index) => normalize(state.p2Answers[index] || "") === normalize(expected));
    setState((prev) => ({ ...prev, p2Feedback: feedback }));
    if (feedback.length === current.p2Band55.answers.length && feedback.every(Boolean)) award("p2");
  };

  const checkCohesion = (index) => {
    const ok = fuzzyMatch(state.cohesionAnswers[index] || "", cohesionTasks[index].answer);
    setState((prev) => ({ ...prev, cohesionFeedback: { ...prev.cohesionFeedback, [index]: ok } }));
    const allCorrect = cohesionTasks.every((task, i) => fuzzyMatch(i === index ? state.cohesionAnswers[index] || "" : state.cohesionAnswers[i] || "", task.answer));
    if (allCorrect) award("p2");
  };

  const highlightedWriting = useMemo(() => {
    if (!state.submitted || detectedErrors.length === 0) return state.writing;
    const output = [];
    let cursor = 0;
    detectedErrors.forEach((error, index) => {
      if (error.index < cursor) return;
      output.push(state.writing.slice(cursor, error.index));
      output.push(
        <strong key={`${error.id}-${index}`} className={error.type === "grammar" ? "error grammar" : "error lexis"} title={error.message}>
          {state.writing.slice(error.index, error.index + error.match.length)}
        </strong>
      );
      cursor = error.index + error.match.length;
    });
    output.push(state.writing.slice(cursor));
    return output;
  }, [state.submitted, state.writing, detectedErrors]);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">IELTS Academic Writing Task 1</p>
          <h1>Process Writing Training System</h1>
          <p className="muted">Four process diagrams, three bands, sentence, cohesion and writing training.</p>
        </div>
        <div className="selectors">
          <select value={processKey} onChange={(e) => changeProcessOrLevel(e.target.value, level)}>
            <option value="bamboo">Bamboo fabric</option>
            <option value="sugar">Sugar cane</option>
            <option value="noodles">Instant noodles</option>
            <option value="recycling">Recycling</option>
          </select>
          <select value={level} onChange={(e) => changeProcessOrLevel(processKey, e.target.value)}>
            <option value="band55">Band 5.5</option>
            <option value="band6">Band 6</option>
            <option value="band65">Band 6.5</option>
          </select>
        </div>
      </header>

      <section className="scorebar">
        <div>
          <strong>{current.title}</strong>
          <p>{current.task}</p>
        </div>
        <div className="score">Score: {totalScore} / 10</div>
      </section>

      <div className="layout">
        <aside className="diagram">
          <h2>Process Diagram</h2>
          <img src={current.image} alt={current.title} loading="lazy" onError={(e) => (e.currentTarget.src = "https://placehold.co/900x520?text=Image+Not+Found")} />
        </aside>

        <section className="workspace">
          <div className="tabs" role="tablist">
            <Tab value="practice1" label="Practice 1" active={activePractice} onSelect={setActivePractice} />
            <Tab value="practice2" label="Practice 2" active={activePractice} onSelect={setActivePractice} />
            <Tab value="practice3" label="Practice 3" active={activePractice} onSelect={setActivePractice} />
          </div>

          {activePractice === "practice1" && (
            <Card title="Practice 1 · Passive Voice / Sentence Upgrade">
              {practice1Tasks.map((task, index) => (
                <div className="task" key={`${processKey}-${level}-${index}`}>
                  <span className="taskNo">Task {index + 1}</span>
                  <p>{task.instruction}</p>
                  <div className="prompt">{task.prompt}</div>
                  <input
                    value={state.p1Answers[index] || ""}
                    onChange={(e) =>
                      setState((prev) => {
                        const feedback = { ...prev.p1Feedback };
                        delete feedback[index];
                        return { ...prev, p1Answers: { ...prev.p1Answers, [index]: e.target.value }, p1Feedback: feedback };
                      })
                    }
                    placeholder="Write your answer here..."
                  />
                  <div className="actions">
                    <button onClick={() => checkP1(index)}>Check</button>
                    <button className="secondary" onClick={() => showP1Hint(index, task)}>Hint</button>
                  </div>
                  {p1Hints[index] && <div className="hint taskHint">{p1Hints[index]}</div>}
                  {state.p1Feedback[index] !== undefined && <div className={state.p1Feedback[index] ? "feedback ok" : "feedback bad"}>{state.p1Feedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}</div>}
                </div>
              ))}
            </Card>
          )}

          {activePractice === "practice2" && level === "band55" && (
            <Card title="Practice 2 · Controlled Paragraph Cohesion">
              <div className="paragraph">
                {current.p2Band55.text.map(([index, text]) => (
                  <span key={index}>
                    <button className={`blank ${state.p2Feedback.length ? (state.p2Feedback[index] ? "ok" : "bad") : ""}`} onClick={() => fillBlank(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => fillBlank(index)}>
                      {state.p2Answers[index] || "_____"}
                    </button>
                    {text}
                  </span>
                ))}
              </div>
              <div className="chips">
                {linkerOptions.map((option) => (
                  <button key={option} draggable onDragStart={() => setSelectedLinker(option)} onClick={() => setSelectedLinker(option)} className={selectedLinker === option ? "chip active" : "chip"}>
                    {option}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button className="secondary" onClick={() => setP2Hint("Click a linker, then click a blank. 'After' goes before 'that'; 'the following stage' fits 'is to + verb'.")}>Hint</button>
                <button onClick={checkParagraph}>Check</button>
                <button className="secondary" onClick={reset}>Reset</button>
              </div>
              {p2Hint && <div className="hint">{p2Hint}</div>}
            </Card>
          )}

          {activePractice === "practice2" && level !== "band55" && (
            <Card title={level === "band6" ? "Practice 2 · Band 6 Cohesion" : "Practice 2 · Band 6.5 Complex Cohesion"}>
              {cohesionTasks.map((task, index) => (
                <div className="task" key={`${processKey}-${level}-cohesion-${index}`}>
                  <span className="taskNo">Task {index + 1}</span>
                  {task.type === "fill" ? <div className="prompt">{task.sentence}</div> : <div className="prompt"><strong>{task.prompt}</strong><br />1. {task.parts[0]}<br />2. {task.parts[1]}</div>}
                  <input
                    value={state.cohesionAnswers[index] || ""}
                    onChange={(e) =>
                      setState((prev) => {
                        const feedback = { ...prev.cohesionFeedback };
                        delete feedback[index];
                        return { ...prev, cohesionAnswers: { ...prev.cohesionAnswers, [index]: e.target.value }, cohesionFeedback: feedback };
                      })
                    }
                    placeholder="Write your answer here..."
                  />
                  <div className="actions">
                    <button onClick={() => checkCohesion(index)}>Check</button>
                    <button className="secondary" onClick={() => setP2Hint("Check the target structure: after being done, followed by + noun phrase, or after which + clause.")}>Hint</button>
                  </div>
                  {state.cohesionFeedback[index] !== undefined && <div className={state.cohesionFeedback[index] ? "feedback ok" : "feedback bad"}>{state.cohesionFeedback[index] ? "Correct." : `Suggested answer: ${task.answer}`}</div>}
                </div>
              ))}
              {p2Hint && <div className="hint">{p2Hint}</div>}
            </Card>
          )}

          {activePractice === "practice3" && (
            <Card title="Practice 3 · Timed Writing + Self-correction">
              <textarea value={state.writing} onChange={(e) => setState((prev) => ({ ...prev, writing: e.target.value, submitted: false }))} placeholder="Write your process paragraph here..." />
              <div className="meta">
                <span>Word count: <strong>{wordCount}</strong></span>
                <span>Target: <strong>100+ words</strong></span>
                {state.submitted && <span>Errors: <strong>{detectedErrors.length}</strong></span>}
              </div>
              <div className="actions">
                <button disabled={wordCount < 100} onClick={() => (wordCount < 100 ? setWritingHint(`Please write at least 100 words. Current: ${wordCount}.`) : setState((prev) => ({ ...prev, submitted: true })))}>Submit</button>
                <button className="secondary" onClick={() => setWritingHint(!state.submitted ? `Submit first. You need ${Math.max(0, 100 - wordCount)} more words.` : detectedErrors[0]?.message || "Complete all three reflection points.")}>Hint</button>
              </div>
              {writingHint && <div className="hint">{writingHint}</div>}
              {state.submitted && <div className="writingPreview">{highlightedWriting || "No writing submitted."}</div>}
              <div className="reflection">
                <strong>Self-reflection</strong>
                {state.reflection.map((item, index) => (
                  <input
                    key={index}
                    value={item}
                    onChange={(e) =>
                      setState((prev) => {
                        const reflection = [...prev.reflection];
                        reflection[index] = e.target.value;
                        return { ...prev, reflection };
                      })
                    }
                    placeholder={`Reflection ${index + 1}`}
                  />
                ))}
              </div>
              {p3Pass && <div className="pass">PASS · +5 points</div>}
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
