import { useState, useEffect, useRef } from "react";
import QUESTION_BANKS from "./data/questions.js";
import { supabase } from "./supabaseClient";
import {
  Rocket, Star, Home, BookOpen, StickyNote, Check, X, Sparkles,
  Plus, Trash2, SkipForward, Loader2, Atom, Calculator, BookText, Type
} from "lucide-react";

// ---- Design tokens ----
// bg: #0B1026 (deep space) | surface: #161B33 | border: #232A4D
// accent: #00D9C0 (aurora teal) | violet: #6C5CE7 | gold: #FFC857 (stardust) | coral: #FF6B9D
// display: Space Grotesk | body: Inter | mono: JetBrains Mono

const STORAGE_KEY = "mission-progress";

const SUBJECTS = [
  { key: "Math", icon: Calculator, color: "#00D9C0" },
  { key: "Reading", icon: BookText, color: "#6C5CE7" },
  { key: "Science", icon: Atom, color: "#FF6B9D" },
  { key: "Vocabulary", icon: Type, color: "#FFC857" },
];

const FACTS = [
  "Marie Curie is the only person to win Nobel Prizes in two different sciences.",
  "A day on Venus is longer than its year.",
  "Neil Armstrong's heart rate peaked at 150 bpm during the Apollo 11 landing.",
  "Octopuses have three hearts and blue blood.",
  "The word 'quarantine' comes from the Italian for '40 days.'",
];

const SPACE_ICONS = ["🚀", "🪐", "⭐", "🌙", "☄️", "🛰️"];
const SCRAMBLE_WORDS = ["ORBIT", "NEBULA", "COMET", "LUNAR", "COSMOS", "GALAXY"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleWord(word) {
  let s = word;
  while (s === word) {
    s = shuffle(word.split("")).join("");
  }
  return s;
}

// ---------- shared bits ----------

function Companion({ mood = "idle", size = 64 }) {
  const anim = mood === "happy" ? "orbitBounce 0.6s ease-in-out infinite" : "orbitFloat 3s ease-in-out infinite";
  return (
    <div style={{ width: size, height: size, animation: anim }}>
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #2a3363, #10142c)",
          border: "2px solid #00D9C0", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: size * 0.5,
          boxShadow: mood === "happy" ? "0 0 24px rgba(0,217,192,0.6)" : "0 0 12px rgba(0,217,192,0.25)",
        }}
      >
        {mood === "happy" ? "✨" : mood === "sad" ? "🌙" : "🪐"}
      </div>
    </div>
  );
}

function StardustPill({ count, delta }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, background: "#161B33",
      border: "1px solid #232A4D", borderRadius: 999, padding: "6px 14px",
      fontFamily: "'JetBrains Mono', monospace", color: "#FFC857", fontSize: 14,
    }}>
      <Star size={14} fill="#FFC857" stroke="#FFC857" />
      {count}
      {delta ? <span style={{ color: "#00D9C0", marginLeft: 2 }}>+{delta}</span> : null}
    </div>
  );
}

function LaunchTrajectory({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ padding: "4px 0 18px" }}>
      <svg width="100%" height="46" viewBox="0 0 300 46" preserveAspectRatio="none">
        <path d="M 10 40 Q 150 -10 290 40" fill="none" stroke="#232A4D" strokeWidth="3" />
        <path d="M 10 40 Q 150 -10 290 40" fill="none" stroke="#00D9C0" strokeWidth="3"
          strokeDasharray="400" strokeDashoffset={400 - (400 * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        <circle cx={10 + (280 * pct) / 100} cy={40 - Math.sin((Math.PI * pct) / 100) * 46} r="7" fill="#FFC857" />
      </svg>
      <div style={{ color: "#8B93B8", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
        QUESTION {step} / {total}
      </div>
    </div>
  );
}

// ---------- screens ----------
function LoginScreen({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <Companion mood="idle" size={64} />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 22, margin: 0 }}>
          {isSignUp ? "Start your mission" : "Welcome back to orbit"}
        </h1>
        <div style={{ color: "#8B93B8", fontSize: 13, marginTop: 6 }}>
          {isSignUp ? "Create an account to save your progress" : "Sign in to pick up where you left off"}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {error && (
          <div style={{ color: "#FF6B9D", fontSize: 12, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
            {error}
          </div>
        )}
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" required
          style={{
            background: "#161B33", border: "1px solid #232A4D", borderRadius: 10,
            padding: "12px 14px", color: "#F1F3F9", fontSize: 14, outline: "none",
          }}
        />
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" required minLength={6}
          style={{
            background: "#161B33", border: "1px solid #232A4D", borderRadius: 10,
            padding: "12px 14px", color: "#F1F3F9", fontSize: 14, outline: "none",
          }}
        />
        <button type="submit" disabled={loading} style={{
          background: "#00D9C0", border: "none", color: "#0B1026", borderRadius: 12,
          padding: "13px 0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
          fontSize: 15, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          marginTop: 4,
        }}>
          {loading ? "Launching..." : isSignUp ? "Create account" : "Log in"}
        </button>
      </form>

      <div style={{ color: "#8B93B8", fontSize: 13 }}>
        {isSignUp ? "Already have an account? " : "New to Orbit? "}
        <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: "#00D9C0", cursor: "pointer", fontWeight: 600 }}>
          {isSignUp ? "Log in" : "Sign up"}
        </span>
      </div>
    </div>
  );
}

function Dashboard({ stardust, streak, subject, onPickSubject, onStart }) {
  return (
    <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#8B93B8", fontSize: 13 }}>Mission Control</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 26, margin: "2px 0 0" }}>
            Ready for launch?
          </h1>
        </div>
        <Companion mood="idle" size={56} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StardustPill count={stardust} />
        <div style={{
          display: "flex", alignItems: "center", gap: 6, background: "#161B33",
          border: "1px solid #232A4D", borderRadius: 999, padding: "6px 14px",
          fontFamily: "'JetBrains Mono', monospace", color: "#FF6B9D", fontSize: 14,
        }}>
          🔥 {streak} day streak
        </div>
      </div>

      <div>
        <div style={{ color: "#8B93B8", fontSize: 12, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          CHOOSE YOUR MISSION
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SUBJECTS.map(({ key, icon: Icon, color }) => {
            const active = subject === key;
            return (
              <button
                key={key}
                onClick={() => onPickSubject(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "12px 12px",
                  borderRadius: 12, cursor: "pointer",
                  border: `1px solid ${active ? color : "#232A4D"}`,
                  background: active ? `${color}22` : "#161B33",
                  color: active ? color : "#8B93B8",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                }}
              >
                <Icon size={16} /> {key}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #161B33, #1c2247)",
        border: "1px solid #232A4D", borderRadius: 20, padding: 20,
      }}>
        <div style={{ color: "#F1F3F9", fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, marginBottom: 6 }}>
          Today's mission
        </div>
        <div style={{ color: "#8B93B8", fontSize: 14, marginBottom: 16 }}>
          5 questions · {subject} · ~4 min
        </div>
        <button onClick={onStart} style={{
          width: "100%", background: "#00D9C0", color: "#0B1026", border: "none",
          borderRadius: 14, padding: "14px 0", fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600, fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Rocket size={18} /> Start test
        </button>
      </div>

      <div style={{ color: "#8B93B8", fontSize: 12, lineHeight: 1.5 }}>
        Every 45 minutes of study, you'll get a short break with a mini-game. You can always skip it.
      </div>
    </div>
  );
}

function TestScreen({ subject, onFinish }) {
  const [questions] = useState(() => shuffle(QUESTION_BANKS[subject]).slice(0, 5));
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[i];

  function choose(idx) {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    const isRight = idx === q.answer;
    if (isRight) setCorrectCount((c) => c + 1);
   setShowExplanation(true);
   }

  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
      <LaunchTrajectory step={i + 1} total={questions.length} />
      <div style={{ color: "#6C5CE7", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
        {subject.toUpperCase()}
      </div>
      <div style={{ color: "#F1F3F9", fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, margin: "8px 0 18px", lineHeight: 1.4 }}>
        {q.q}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, idx) => {
          let bg = "#161B33", border = "#232A4D";
          if (selected !== null) {
            if (idx === q.answer) { bg = "rgba(0,217,192,0.15)"; border = "#00D9C0"; }
            else if (idx === selected) { bg = "rgba(255,107,157,0.15)"; border = "#FF6B9D"; }
          }
          return (
            <button key={idx} onClick={() => choose(idx)} disabled={locked} style={{
              textAlign: "left", background: bg, border: `1px solid ${border}`, borderRadius: 12,
              padding: "13px 16px", color: "#F1F3F9", fontSize: 14,
              cursor: locked ? "default" : "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              {opt}
              {selected !== null && idx === q.answer && <Check size={16} color="#00D9C0" />}
              {selected !== null && idx === selected && idx !== q.answer && <X size={16} color="#FF6B9D" />}
            </button>
          );
        })}
      </div>
      {showExplanation && (
  <div
    style={{
      marginTop: 20,
      padding: 16,
      background: "#161B33",
      border: "1px solid #232A4D",
      borderRadius: 12,
      color: "#F1F3F9",
    }}
  >
    <div
      style={{
        color: "#FFC857",
        fontWeight: "bold",
        marginBottom: 8,
      }}
    >
      💡 Explanation
    </div>

    <div style={{ lineHeight: 1.6 }}>
      {q.explanation || "Explanation coming soon.🚀"}
    </div>

    <button
      onClick={() => {
        setShowExplanation(false);

        if (i + 1 < questions.length) {
          setI(i + 1);
          setSelected(null);
          setLocked(false);
        } else {
          onFinish(correctCount, questions.length);
        }
      }}
      style={{
        marginTop: 16,
        padding: "10px 18px",
        background: "#00D9C0",
        color: "#0B1026",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Next Question →
    </button>
  </div>
)}
    </div>
  );
}

function ResultsScreen({ score, total, onContinue, onSkipBreak }) {
  const pct = Math.round((score / total) * 100);
  const mood = pct >= 60 ? "happy" : "sad";
  const earned = score * 15;
  return (
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
      <Companion mood={mood} size={84} />
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 24 }}>
        {score} / {total} correct
      </div>
      <div style={{ color: "#8B93B8", fontSize: 14 }}>
        {pct >= 80 ? "Full thrust — that's excellent." : pct >= 60 ? "Solid orbit. Keep pushing." : "Turbulence, but you'll refine this."}
      </div>
      <StardustPill count={earned} />
      <div style={{ display: "flex", gap: 10, marginTop: 18, width: "100%" }}>
        <button onClick={onSkipBreak} style={{
          flex: 1, background: "transparent", border: "1px solid #232A4D", color: "#8B93B8",
          borderRadius: 12, padding: "12px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <SkipForward size={15} /> Skip break
        </button>
        <button onClick={onContinue} style={{
          flex: 1, background: "#6C5CE7", border: "none", color: "#F1F3F9", borderRadius: 12,
          padding: "12px 0", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, cursor: "pointer",
        }}>
          Take a break
        </button>
      </div>
    </div>
  );
}

// ---- mini-games ----

function MemoryMatchGame({ onDone }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    setCards(shuffle([...SPACE_ICONS, ...SPACE_ICONS]).map((icon, idx) => ({ id: idx, icon })));
  }, []);

  function flip(idx) {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (cards[a].icon === cards[b].icon) { setMatched((m) => [...m, a, b]); setFlipped([]); }
      else setTimeout(() => setFlipped([]), 600);
    }
  }
  const won = matched.length === cards.length && cards.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ color: "#8B93B8", fontSize: 13 }}>Match the pairs</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, width: "100%", maxWidth: 280 }}>
        {cards.map((c, idx) => {
          const revealed = flipped.includes(idx) || matched.includes(idx);
          return (
            <button key={c.id} onClick={() => flip(idx)} style={{
              aspectRatio: "1", borderRadius: 10, border: "1px solid #232A4D",
              background: revealed ? "#1c2247" : "#161B33", fontSize: 22, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#F1F3F9",
            }}>
              {revealed ? c.icon : ""}
            </button>
          );
        })}
      </div>
      {won && <div style={{ color: "#00D9C0", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>All matched! +10 stardust</div>}
      <button onClick={() => onDone(won ? 10 : 0)} style={{
        background: "#00D9C0", border: "none", color: "#0B1026", borderRadius: 12,
        padding: "11px 24px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
      }}>
        {won ? "Continue" : "Done for now"}
      </button>
    </div>
  );
}

function MathSprintGame({ onDone }) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(null);
  const [options, setOptions] = useState([]);
  const [over, setOver] = useState(false);
  const timerRef = useRef(null);

  function newProblem() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let correct;
    if (op === "+") correct = a + b;
    else if (op === "-") correct = a - b;
    else correct = a * b;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = Math.floor(Math.random() * 9) - 4;
      const w = correct + delta;
      if (w !== correct) wrongs.add(w);
    }
    setProblem(`${a} ${op} ${b}`);
    setOptions(shuffle([correct, ...wrongs]));
  }

  useEffect(() => {
    newProblem();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  function answer(val) {
    if (over) return;
    const correct = eval(problem.replace("×", "*"));
    if (val === correct) setScore((s) => s + 1);
    newProblem();
  }

  const bonus = Math.min(score * 2, 20);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ color: "#8B93B8", fontSize: 13 }}>Quick math — solve fast!</div>
      {!over ? (
        <>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FFC857", fontSize: 13 }}>
            ⏱ {timeLeft}s · Score: {score}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 32 }}>
            {problem} = ?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 260 }}>
            {options.map((o, idx) => (
              <button key={idx} onClick={() => answer(o)} style={{
                background: "#161B33", border: "1px solid #232A4D", borderRadius: 10,
                padding: "12px 0", color: "#F1F3F9", fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16, cursor: "pointer",
              }}>
                {o}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ color: "#00D9C0", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          Time's up — {score} correct! +{bonus} stardust
        </div>
      )}
      <button onClick={() => onDone(over ? bonus : 0)} disabled={!over} style={{
        background: over ? "#00D9C0" : "#232A4D", border: "none", color: over ? "#0B1026" : "#8B93B8",
        borderRadius: 12, padding: "11px 24px", fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600, fontSize: 14, cursor: over ? "pointer" : "default",
      }}>
        {over ? "Continue" : "Playing..."}
      </button>
    </div>
  );
}

function WordScrambleGame({ onDone }) {
  const [word] = useState(() => SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)]);
  const [scrambled] = useState(() => scrambleWord(word));
  const [guess, setGuess] = useState("");
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function check() {
    if (guess.trim().toUpperCase() === word) { setSolved(true); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ color: "#8B93B8", fontSize: 13 }}>Unscramble the space word</div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", color: "#FFC857", fontSize: 28,
        letterSpacing: 4,
      }}>
        {scrambled}
      </div>
      {!solved && !revealed && (
        <>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Your guess..."
            style={{
              background: "#161B33", border: "1px solid #232A4D", borderRadius: 10,
              padding: "10px 14px", color: "#F1F3F9", fontSize: 15, textAlign: "center",
              outline: "none", width: 180, textTransform: "uppercase",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={check} style={{
              background: "#6C5CE7", border: "none", color: "#fff", borderRadius: 10,
              padding: "9px 18px", fontSize: 13, cursor: "pointer",
            }}>
              Check
            </button>
            <button onClick={() => setRevealed(true)} style={{
              background: "transparent", border: "1px solid #232A4D", color: "#8B93B8",
              borderRadius: 10, padding: "9px 18px", fontSize: 13, cursor: "pointer",
            }}>
              Reveal
            </button>
          </div>
        </>
      )}
      {solved && <div style={{ color: "#00D9C0", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>Correct! +8 stardust</div>}
      {revealed && !solved && <div style={{ color: "#FF6B9D", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>It was {word}</div>}
      <button onClick={() => onDone(solved ? 8 : 0)} style={{
        background: "#00D9C0", border: "none", color: "#0B1026", borderRadius: 12,
        padding: "11px 24px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
        fontSize: 14, cursor: "pointer",
      }}>
        {solved || revealed ? "Continue" : "Skip"}
      </button>
    </div>
  );
}

function ReactionTapGame({ onDone }) {
  const ROUNDS = 5;
  const [phase, setPhase] = useState("waiting"); // waiting | ready | tooSoon | done
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (phase !== "waiting") return;
    const delay = 1000 + Math.random() * 2200;
    timeoutRef.current = setTimeout(() => {
      setStartedAt(performance.now());
      setPhase("ready");
    }, delay);
    return () => clearTimeout(timeoutRef.current);
  }, [phase, round]);

  function handleTap() {
    if (phase === "waiting") {
      clearTimeout(timeoutRef.current);
      setPhase("tooSoon");
      return;
    }
    if (phase === "ready") {
      const rt = Math.round(performance.now() - startedAt);
      const nextTimes = [...times, rt];
      setTimes(nextTimes);
      if (round + 1 >= ROUNDS) setPhase("done");
      else { setRound((r) => r + 1); setPhase("waiting"); }
    }
  }

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const bonus = avg === 0 ? 0 : Math.max(2, Math.min(15, Math.round(15 - avg / 40)));

  if (phase === "done") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ color: "#8B93B8", fontSize: 13 }}>Reaction average</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FFC857", fontSize: 30 }}>{avg}ms</div>
        <div style={{ color: "#00D9C0", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>+{bonus} stardust</div>
        <button onClick={() => onDone(bonus)} style={{
          background: "#00D9C0", border: "none", color: "#0B1026", borderRadius: 12,
          padding: "11px 24px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
          fontSize: 14, cursor: "pointer",
        }}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ color: "#8B93B8", fontSize: 13 }}>
        Round {round + 1} / {ROUNDS} — tap when it turns green
      </div>
      <button onClick={handleTap} style={{
        width: 220, height: 220, borderRadius: 20, border: "none", cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600,
        background: phase === "ready" ? "#00D9C0" : phase === "tooSoon" ? "#FF6B9D" : "#232A4D",
        color: phase === "ready" ? "#0B1026" : "#F1F3F9",
        transition: "background 0.15s ease",
      }}>
        {phase === "waiting" && "Wait for it..."}
        {phase === "ready" && "TAP NOW!"}
        {phase === "tooSoon" && "Too soon!"}
      </button>
      {phase === "tooSoon" && (
        <button onClick={() => setPhase("waiting")} style={{
          background: "transparent", border: "1px solid #232A4D", color: "#8B93B8",
          borderRadius: 10, padding: "8px 18px", fontSize: 13, cursor: "pointer",
        }}>
          Try that round again
        </button>
      )}
      {times.length > 0 && phase !== "tooSoon" && (
        <div style={{ color: "#8B93B8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          Last: {times[times.length - 1]}ms
        </div>
      )}
    </div>
  );
}

const MINI_GAMES = [MemoryMatchGame, MathSprintGame, WordScrambleGame, ReactionTapGame];

function BreakScreen({ onDone }) {
  const [Game] = useState(() => MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)]);
  return (
    <div style={{ padding: "30px 20px" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 18, marginBottom: 16, textAlign: "center" }}>
        Orbit break
      </div>
      <Game onDone={onDone} />
    </div>
  );
}

function NotesScreen({ notes, setNotes }) {
  const [draft, setDraft] = useState("");

  function add() {
    if (!draft.trim()) return;
    setNotes((n) => [...n, { id: Date.now(), text: draft.trim(), done: false }]);
    setDraft("");
  }
  function toggle(id) { setNotes((n) => n.map((x) => (x.id === id ? { ...x, done: !x.done } : x))); }
  function remove(id) { setNotes((n) => n.filter((x) => x.id !== id)); }

  return (
    <div style={{ padding: "28px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F1F3F9", fontSize: 20 }}>Flight log</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a to-do..."
          style={{
            flex: 1, background: "#161B33", border: "1px solid #232A4D", borderRadius: 10,
            padding: "10px 12px", color: "#F1F3F9", fontSize: 14, outline: "none",
          }}
        />
        <button onClick={add} style={{
          background: "#6C5CE7", border: "none", borderRadius: 10, width: 40, color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Plus size={18} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.map((n) => (
          <div key={n.id} style={{
            display: "flex", alignItems: "center", gap: 10, background: "#161B33",
            border: "1px solid #232A4D", borderRadius: 10, padding: "10px 12px",
          }}>
            <button onClick={() => toggle(n.id)} style={{
              width: 20, height: 20, borderRadius: 6,
              border: `1.5px solid ${n.done ? "#00D9C0" : "#8B93B8"}`,
              background: n.done ? "#00D9C0" : "transparent", cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {n.done && <Check size={13} color="#0B1026" />}
            </button>
            <span style={{
              flex: 1, color: n.done ? "#8B93B8" : "#F1F3F9",
              textDecoration: n.done ? "line-through" : "none", fontSize: 14,
            }}>
              {n.text}
            </span>
            <button onClick={() => remove(n.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Trash2 size={15} color="#8B93B8" />
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <div style={{ color: "#8B93B8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No entries yet. Add your first to-do above.
          </div>
        )}
      </div>
    </div>
  );
}

function FunFactToast({ fact, onClose }) {
  if (!fact) return null;
  return (
    <div style={{
      position: "absolute", bottom: 78, left: 16, right: 16, background: "#1c2247",
      border: "1px solid #6C5CE7", borderRadius: 14, padding: "12px 14px", display: "flex",
      gap: 10, alignItems: "flex-start", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 20,
    }}>
      <Sparkles size={16} color="#FFC857" style={{ marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, color: "#F1F3F9", fontSize: 13, lineHeight: 1.4 }}>
        <strong style={{ color: "#FFC857" }}>Did you know? </strong>{fact}
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
        <X size={14} color="#8B93B8" />
      </button>
    </div>
  );
}

// ---------- root ----------

export default function StudyAppPrototype() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  const [stardust, setStardust] = useState(120);
  const [streak, setStreak] = useState(4);
  const [subject, setSubject] = useState("Math");
  const [notes, setNotes] = useState([
    { id: 1, text: "Review quadratic formulas", done: false },
    { id: 2, text: "Read 2 pages of vocab list", done: true },
  ]);
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(5);
  const [fact, setFact] = useState(null);

 // Load saved progress when the app starts
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      if (typeof data.stardust === "number") setStardust(data.stardust);
      if (typeof data.streak === "number") setStreak(data.streak);
      if (data.subject) setSubject(data.subject);
      if (Array.isArray(data.notes)) setNotes(data.notes);
    }
  } catch (e) {
    console.error("Failed to load progress:", e);
  } finally {
    setLoaded(true);
  }
}, []);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setCheckingSession(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setCheckingSession(false);
  });

  return () => subscription.unsubscribe();
}, []);
 // Save progress whenever it changes
useEffect(() => {
  if (!loaded) return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stardust,
        streak,
        subject,
        notes,
      })
    );

    setSaveError(false);
  } catch (e) {
    console.error("Failed to save progress:", e);
    setSaveError(true);
  }
}, [loaded, stardust, streak, subject, notes]);

  useEffect(() => {
    if (screen === "dashboard") {
      const t = setTimeout(() => setFact(FACTS[Math.floor(Math.random() * FACTS.length)]), 1200);
      return () => clearTimeout(t);
    } else {
      setFact(null);
    }
  }, [screen]);

    if (!loaded) {
    return (
      <div style={{
        maxWidth: 380, margin: "0 auto", background: "#0B1026", borderRadius: 28,
        border: "1px solid #232A4D", minHeight: 640, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "Inter, sans-serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Loader2 size={28} color="#00D9C0" style={{ animation: "spin 1s linear infinite" }} />
        <div style={{ color: "#8B93B8", fontSize: 13 }}>Loading your mission data...</div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div style={{
        maxWidth: 380,
        margin: "0 auto",
        background: "#0B1026",
        borderRadius: 28,
        border: "1px solid #232A4D",
        minHeight: 640,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "Inter, sans-serif",
      }}>
        <Loader2
          size={28}
          color="#00D9C0"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <div style={{ color: "#8B93B8", fontSize: 13 }}>
          Checking your account...
        </div>
      </div>
    );
  }

  if (!session) {
  return (
    <div style={{
      maxWidth: 380, margin: "0 auto", background: "#0B1026", borderRadius: 28,
      border: "1px solid #232A4D", minHeight: 640, fontFamily: "Inter, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <LoginScreen />
    </div>
  );
}

  return (
    <div style={{
      maxWidth: 380, margin: "0 auto", background: "#0B1026", borderRadius: 28,
      border: "1px solid #232A4D", minHeight: 640, position: "relative", overflow: "hidden",
      fontFamily: "Inter, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes orbitFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes orbitBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        button:focus-visible { outline: 2px solid #00D9C0; outline-offset: 2px; }
      `}</style>

      <div style={{ minHeight: 560 }}>
        {screen === "dashboard" && (
          <Dashboard
            stardust={stardust} streak={streak} subject={subject}
            onPickSubject={setSubject}
            onStart={() => setScreen("test")}
          />
        )}
        {screen === "test" && (
          <TestScreen
            subject={subject}
            onFinish={(score, total) => { setLastScore(score); setLastTotal(total); setScreen("results"); }}
          />
        )}
        {screen === "results" && (
          <ResultsScreen
            score={lastScore} total={lastTotal}
            onContinue={() => setScreen("break")}
            onSkipBreak={() => { setStardust((s) => s + lastScore * 15); setScreen("dashboard"); }}
          />
        )}
        {screen === "break" && (
          <BreakScreen onDone={(bonus) => { setStardust((s) => s + lastScore * 15 + bonus); setScreen("dashboard"); }} />
        )}
        {screen === "notes" && <NotesScreen notes={notes} setNotes={setNotes} />}
      </div>

      <FunFactToast fact={fact} onClose={() => setFact(null)} />

      {saveError && (
        <div style={{
          position: "absolute", top: 10, left: 16, right: 16, background: "#2a1c2a",
          border: "1px solid #FF6B9D", borderRadius: 10, padding: "8px 12px",
          color: "#FF6B9D", fontSize: 11, textAlign: "center", zIndex: 30,
        }}>
          Couldn't save progress — it may not persist this session.
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, display: "flex",
        borderTop: "1px solid #232A4D", background: "#0B1026",
      }}>
        {[
          { key: "dashboard", icon: Home, label: "Home" },
          { key: "test", icon: BookOpen, label: "Practice" },
          { key: "notes", icon: StickyNote, label: "Notes" },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setScreen(key)} style={{
            flex: 1, background: "none", border: "none", padding: "12px 0 14px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            cursor: "pointer", color: screen === key ? "#00D9C0" : "#8B93B8",
          }}>
            <Icon size={19} />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}