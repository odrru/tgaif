"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: number;
  category: string;
  text: string;
  hint?: string;
};

const tasks: Task[] = [
  { id: 1, category: "Arrive", text: "Take a team selfie at the entrance", hint: "Proof or it didn’t happen" },
  { id: 2, category: "Arrive", text: "Try the signature welcome drink" },
  { id: 3, category: "Arrive", text: "Add one song to the party queue" },
  { id: 4, category: "Arrive", text: "Say hello to someone from another team" },
  { id: 5, category: "Connect", text: "Learn a new Luganda word from a colleague" },
  { id: 6, category: "Connect", text: "Introduce two people who haven’t met" },
  { id: 7, category: "Connect", text: "Find someone who joined the office this year" },
  { id: 8, category: "Connect", text: "Compliment someone’s recent work" },
  { id: 9, category: "Connect", text: "Get a photo with someone wearing green" },
  { id: 10, category: "Taste", text: "Try a party bite you’ve never had before" },
  { id: 11, category: "Taste", text: "Share a plate with someone" },
  { id: 12, category: "Taste", text: "Vote for your favourite party snack" },
  { id: 13, category: "Taste", text: "Drink a full glass of water", hint: "Sustainable partying, too" },
  { id: 14, category: "Play", text: "Win — or loudly cheer on — a party game" },
  { id: 15, category: "Play", text: "Start a three-person dance circle" },
  { id: 16, category: "Play", text: "Do the official TG(AI)F pose for a photo" },
  { id: 17, category: "Play", text: "Make someone laugh out loud" },
  { id: 18, category: "Play", text: "Give someone a five-second dance lesson" },
  { id: 19, category: "Imagine", text: "Share one idea for a greener office" },
  { id: 20, category: "Imagine", text: "Sketch a tiny bamboo pavilion" },
  { id: 21, category: "Imagine", text: "Name a bamboo building you’d love to visit" },
  { id: 22, category: "Imagine", text: "Spot three things at the party made from natural materials" },
  { id: 23, category: "Celebrate", text: "Tell someone why you like working here" },
  { id: 24, category: "Celebrate", text: "Thank a behind-the-scenes organiser" },
  { id: 25, category: "Celebrate", text: "Toast to something the team achieved" },
  { id: 26, category: "Celebrate", text: "Take a photo of your growing plantation" },
  { id: 27, category: "Celebrate", text: "Stay for the big group photo" },
  { id: 28, category: "Celebrate", text: "Show your plantation to another grower" },
];

const plotPositions = [
  [18, 28], [31, 19], [46, 28], [62, 17], [77, 26], [86, 43], [69, 40],
  [53, 46], [37, 39], [22, 49], [13, 64], [29, 61], [45, 65], [61, 59],
  [77, 62], [88, 76], [70, 78], [54, 75], [37, 79], [20, 78], [12, 89],
  [28, 91], [44, 88], [60, 91], [77, 89], [91, 58], [7, 43], [52, 17],
];

const categoryNotes: Record<string, string> = {
  Arrive: "Warm up",
  Connect: "Meet your people",
  Taste: "Fuel the fun",
  Play: "Make a memory",
  Imagine: "Design a greener tomorrow",
  Celebrate: "Finish strong",
};

function stageFor(count: number) {
  if (count === 0) return { name: "Bare earth", next: 1, note: "Your first shoot is one tick away" };
  if (count < 6) return { name: "First shoots", next: 6, note: "A small grove is taking root" };
  if (count < 13) return { name: "Young grove", next: 13, note: "The canopy is beginning to form" };
  if (count < 21) return { name: "Growing canopy", next: 21, note: "Now this looks like a plantation" };
  if (count < tasks.length) return { name: "Bamboo boss", next: tasks.length, note: "The finish line is in sight" };
  return { name: "Full plantation", next: tasks.length, note: "Legendary party energy" };
}

function BambooMark() {
  return (
    <span className="bamboo-mark" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function GoogleMark() {
  return <span className="google-mark" aria-hidden="true">G</span>;
}

export default function Home() {
  const [screen, setScreen] = useState<"login" | "game">("login");
  const [loggingIn, setLoggingIn] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [query, setQuery] = useState("");
  const [newPlant, setNewPlant] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [shareLabel, setShareLabel] = useState("Show off my plantation");
  const plantationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("tgaif-completed");
    const entered = window.sessionStorage.getItem("tgaif-entered");
    if (stored) {
      try {
        setCompleted(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem("tgaif-completed");
      }
    }
    if (entered === "true") setScreen("game");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tgaif-completed", JSON.stringify(completed));
  }, [completed]);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "done" && completed.includes(task.id)) ||
        (filter === "todo" && !completed.includes(task.id));
      const matchesSearch =
        !search ||
        task.text.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [completed, filter, query]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce<Record<string, Task[]>>((groups, task) => {
      (groups[task.category] ||= []).push(task);
      return groups;
    }, {});
  }, [filteredTasks]);

  const stage = stageFor(completed.length);
  const progress = Math.round((completed.length / tasks.length) * 100);

  function enterGame() {
    setLoggingIn(true);
    window.setTimeout(() => {
      window.sessionStorage.setItem("tgaif-entered", "true");
      setLoggingIn(false);
      setScreen("game");
    }, 650);
  }

  function toggleTask(id: number) {
    const isDone = completed.includes(id);
    setCompleted((current) =>
      isDone ? current.filter((item) => item !== id) : [...current, id]
    );
    if (!isDone) {
      setNewPlant(id);
      setToast("New bamboo! Your plantation just got greener.");
      window.setTimeout(() => setNewPlant(null), 1200);
      window.setTimeout(() => setToast(""), 2600);
    }
  }

  function resetPlantation() {
    if (completed.length === 0) return;
    if (window.confirm("Clear every tick and return this plot to bare earth?")) {
      setCompleted([]);
      setToast("Fresh plot. Ready to grow again.");
      window.setTimeout(() => setToast(""), 2200);
    }
  }

  function exitPreview() {
    window.sessionStorage.removeItem("tgaif-entered");
    setScreen("login");
  }

  async function sharePlantation() {
    const message = `I grew ${completed.length} of ${tasks.length} bamboo clumps at TG(AI)F — ${stage.name}! 🎋`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My TG(AI)F plantation", text: message });
      } else {
        await navigator.clipboard.writeText(message);
        setShareLabel("Score copied!");
        window.setTimeout(() => setShareLabel("Show off my plantation"), 1800);
      }
    } catch {
      // Closing the native share sheet should leave the experience unchanged.
    }
  }

  if (screen === "login") {
    return (
      <main className="login-shell">
        <header className="login-nav">
          <a className="brand-lockup" href="#" aria-label="TG(AI)F home">
            <BambooMark />
            <span>TG<span className="ai">(AI)</span>F</span>
          </a>
          <span className="event-pill"><span /> Tonight · Kampala</span>
        </header>

        <section className="login-card" aria-labelledby="welcome-title">
          <div className="eyebrow">THE OFFICE PARTY BUCKET LIST</div>
          <h1 id="welcome-title">Do more.<br /><span>Grow more.</span></h1>
          <p className="login-lede">
            Every party mission you tick off plants a new bamboo clump.
            How lush can your plot get before the night ends?
          </p>

          <button className="google-button" onClick={enterGame} disabled={loggingIn}>
            {loggingIn ? <span className="spinner" /> : <GoogleMark />}
            <span>{loggingIn ? "Opening your plot…" : "Continue with Google"}</span>
          </button>
          <p className="preview-note">Local preview · no real account needed yet</p>

          <div className="how-it-works" aria-label="How the game works">
            <div><strong>01</strong><span>Do the thing</span></div>
            <i>→</i>
            <div><strong>02</strong><span>Tick it off</span></div>
            <i>→</i>
            <div><strong>03</strong><span>Grow bamboo</span></div>
          </div>
        </section>

        <div className="login-art" aria-hidden="true">
          <div className="sun-disc" />
          <div className="hero-stalk hero-stalk-one"><i /><i /><i /></div>
          <div className="hero-stalk hero-stalk-two"><i /><i /></div>
          <div className="hero-stalk hero-stalk-three"><i /><i /><i /></div>
          <span className="hero-leaf leaf-a" />
          <span className="hero-leaf leaf-b" />
          <span className="hero-leaf leaf-c" />
          <span className="hero-leaf leaf-d" />
          <span className="hero-leaf leaf-e" />
        </div>

        <footer className="login-footer">
          <span>Built to grow good times</span>
          <span className="footer-dot">•</span>
          <span>One tick = one bamboo clump</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <a className="brand-lockup compact" href="#" aria-label="TG(AI)F">
          <BambooMark />
          <span>TG<span className="ai">(AI)</span>F</span>
        </a>
        <div className="header-progress" aria-label={`${progress}% complete`}>
          <div className="header-progress-copy">
            <span>TONIGHT&apos;S PROGRESS</span>
            <strong>{completed.length}<small> / {tasks.length}</small></strong>
          </div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
        <button className="avatar-button" onClick={exitPreview} title="Return to welcome screen">
          PG<span>Party Guest</span>
        </button>
      </header>

      <div className="game-grid">
        <section className="missions-panel" aria-labelledby="missions-heading">
          <div className="missions-heading-row">
            <div>
              <p className="eyebrow">TONIGHT&apos;S BUCKET LIST</p>
              <h1 id="missions-heading">Make it count.</h1>
            </div>
            <button
              className="jump-to-land"
              onClick={() => plantationRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              See my land <span>↘</span>
            </button>
          </div>
          <p className="missions-intro">
            Pick your adventures in any order. Be honest — the bamboo knows.
          </p>

          <div className="list-tools">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the bucket list"
                aria-label="Search the bucket list"
              />
            </label>
            <div className="filters" aria-label="Filter tasks">
              {(["all", "todo", "done"] as const).map((value) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                >
                  {value === "all" ? "All" : value === "todo" ? "To do" : "Done"}
                </button>
              ))}
            </div>
          </div>

          <div className="task-list">
            {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
              <section className="task-group" key={category}>
                <div className="category-heading">
                  <h2>{category}</h2>
                  <span>{categoryNotes[category]}</span>
                  <i />
                </div>
                <div className="category-tasks">
                  {categoryTasks.map((task) => {
                    const isDone = completed.includes(task.id);
                    return (
                      <button
                        className={`task-row ${isDone ? "done" : ""}`}
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        aria-pressed={isDone}
                      >
                        <span className="checkbox" aria-hidden="true">
                          <i>✓</i>
                        </span>
                        <span className="task-copy">
                          <strong>{task.text}</strong>
                          {task.hint && <small>{task.hint}</small>}
                        </span>
                        <span className="task-number">{String(task.id).padStart(2, "0")}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            {filteredTasks.length === 0 && (
              <div className="empty-list">
                <span>🌿</span>
                <strong>No missions found</strong>
                <p>Try another search or filter.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="plantation-panel" ref={plantationRef} aria-labelledby="plantation-heading">
          <div className="plantation-card">
            <div className="plantation-topline">
              <div>
                <p className="eyebrow">YOUR LIVING SCORE</p>
                <h2 id="plantation-heading">{stage.name}</h2>
              </div>
              <div className="plant-count">
                <strong>{completed.length}</strong>
                <span>bamboo<br />clumps</span>
              </div>
            </div>

            <div className="plot-window">
              <div className="sky-glow" />
              <span className="cloud cloud-one" />
              <span className="cloud cloud-two" />
              <div className="hills hill-back" />
              <div className="hills hill-front" />
              <div className="land-scene">
                <div className="land-top">
                  <span className="plot-path" />
                  {plotPositions.map(([left, top], index) => {
                    const taskId = index + 1;
                    const planted = completed.includes(taskId);
                    return (
                      <div
                        className={`plant-spot spot-${index % 5} ${planted ? "planted" : ""} ${newPlant === taskId ? "new" : ""}`}
                        key={taskId}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          zIndex: Math.round(top),
                          animationDelay: `${(index % 6) * 70}ms`,
                        }}
                      >
                        <span className="soil-ring" />
                        {planted && (
                          <span className="bamboo-clump">
                            <i className="stalk stalk-one"><b /><b /><b /></i>
                            <i className="stalk stalk-two"><b /><b /></i>
                            <i className="stalk stalk-three"><b /><b /><b /></i>
                            <em className="bamboo-leaf l1" />
                            <em className="bamboo-leaf l2" />
                            <em className="bamboo-leaf l3" />
                            <em className="bamboo-leaf l4" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="land-edge" />
              </div>
              {completed.length === 0 && (
                <div className="first-shoot-note"><span>↓</span> Tick a mission to plant here</div>
              )}
              <div className="plot-caption"><span className="live-dot" /> LIVE PLOT · KAMPALA</div>
            </div>

            <div className="stage-progress">
              <div>
                <span>{stage.note}</span>
                <strong>{completed.length === tasks.length ? "Maximum growth" : `${stage.next - completed.length} to next stage`}</strong>
              </div>
              <div className="stage-dots" aria-hidden="true">
                {[1, 6, 13, 21, 28].map((point) => (
                  <i key={point} className={completed.length >= point ? "active" : ""} />
                ))}
              </div>
            </div>

            <button className="share-button" onClick={sharePlantation} disabled={completed.length === 0}>
              <span>↗</span> {shareLabel}
            </button>
            <button className="reset-button" onClick={resetPlantation}>Reset this preview</button>
          </div>

          <div className="impact-note">
            <BambooMark />
            <p><strong>Bamboo is a quiet climate hero.</strong> Fast-growing, renewable and wonderfully strong — just like a good team.</p>
          </div>
        </aside>
      </div>

      <div className={`growth-toast ${toast ? "visible" : ""}`} role="status">
        <span>🎋</span>{toast}
      </div>
    </main>
  );
}
