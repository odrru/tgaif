"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type Task = {
  id: number;
  category: string;
  text: string;
  hint?: string;
};

type LeaderboardEntry = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  completed_count: number;
  last_completion_at: string | null;
};

type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce: string;
    ux_mode: "popup";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      shape: "pill";
      theme: "outline";
      text: "continue_with";
      size: "large";
      logo_alignment: "left";
      width: number;
    }
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentity;
      };
    };
  }
}

// Google OAuth client IDs are public browser configuration, not secrets.
// An environment variable can replace this value without changing the app.
const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "526361313034-dtjcpe94ecamece9tllunn1vvh3it2f8.apps.googleusercontent.com";

async function generateGoogleNonce() {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { nonce, hashedNonce };
}

const tasks: Task[] = [
  { id: 1, category: "A. Arrival, greetings, and social sneaking", text: "Arrive and greet someone with unnecessary enthusiasm." },
  { id: 2, category: "A. Arrival, greetings, and social sneaking", text: "Say \"Happy TG(AI)F\" to someone who was not ready for it." },
  { id: 3, category: "A. Arrival, greetings, and social sneaking", text: "Ask someone how their week was and actually listen." },
  { id: 4, category: "A. Arrival, greetings, and social sneaking", text: "Secretly learn one new thing about a colleague." },
  { id: 5, category: "A. Arrival, greetings, and social sneaking", text: "Genuinely compliment someone's outfit, shoes, hair, bag, or general vibe." },
  { id: 6, category: "A. Arrival, greetings, and social sneaking", text: "Shake someone's hand like you are closing a major construction contract." },
  { id: 7, category: "A. Arrival, greetings, and social sneaking", text: "Give someone a nickname for the evening." },
  { id: 8, category: "A. Arrival, greetings, and social sneaking", text: "Get someone to laugh within 30 seconds of starting a conversation." },
  { id: 9, category: "A. Arrival, greetings, and social sneaking", text: "Introduce yourself to someone you do not usually talk to." },
  { id: 10, category: "A. Arrival, greetings, and social sneaking", text: "Join a conversation, say one useful thing, and disappear right there and then." },
  { id: 11, category: "B. Secret mischief, but harmless", text: "Say \"this needs coordination\" about something completely unrelated to work." },
  { id: 12, category: "B. Secret mischief, but harmless", text: "Ask \"who approved this?\" while looking at snacks or drinks." },
  { id: 13, category: "B. Secret mischief, but harmless", text: "Tell someone \"we need a site meeting\" about the food table." },
  { id: 14, category: "B. Secret mischief, but harmless", text: "Use the word \"deliverable\" in a normal social conversation." },
  { id: 15, category: "B. Secret mischief, but harmless", text: "Use the word \"bamboo\" three times without explaining why." },
  { id: 16, category: "B. Secret mischief, but harmless", text: "Pretend to inspect a chair before sitting on it." },
  { id: 17, category: "B. Secret mischief, but harmless", text: "Announce that the music has passed structural review." },
  { id: 18, category: "B. Secret mischief, but harmless", text: "Say \"we shall revert\" and then walk away." },
  { id: 19, category: "B. Secret mischief, but harmless", text: "Secretly start a rumour that someone is winning the bamboo forest." },
  { id: 20, category: "B. Secret mischief, but harmless", text: "Ask someone if their drink has been approved by QA/QC." },
  { id: 21, category: "C. Food and drink challenges", text: "Drink one bottle of beer." },
  { id: 22, category: "C. Food and drink challenges", text: "Drink two bottles of beer." },
  { id: 23, category: "C. Food and drink challenges", text: "Drink three bottles of beer." },
  { id: 24, category: "C. Food and drink challenges", text: "Drink four bottles of beer." },
  { id: 25, category: "C. Food and drink challenges", text: "Drink five bottles of beer, responsibly, with water and food." },
  { id: 26, category: "C. Food and drink challenges", text: "Drink no alcohol at all and still have maximum vibes." },
  { id: 27, category: "C. Food and drink challenges", text: "Drink only soda or juice the whole time." },
  { id: 28, category: "C. Food and drink challenges", text: "Drink a full glass of water between drinks." },
  { id: 29, category: "C. Food and drink challenges", text: "Convince someone else to drink water." },
  { id: 30, category: "C. Food and drink challenges", text: "Eat something and describe it like a professional food critic." },
  { id: 31, category: "C. Food and drink challenges", text: "Recommend a snack to someone with full confidence." },
  { id: 32, category: "C. Food and drink challenges", text: "Say \"this food is a project success.\"" },
  { id: 33, category: "C. Food and drink challenges", text: "Hold a drink dramatically while giving advice." },
  { id: 34, category: "C. Food and drink challenges", text: "Finish the night hydrated." },
  { id: 35, category: "D. Conversation missions", text: "Ask someone what they would do if they had a free one-acre plot." },
  { id: 36, category: "D. Conversation missions", text: "Ask someone what their bamboo forest would be called." },
  { id: 37, category: "D. Conversation missions", text: "Ask someone what their hidden talent is." },
  { id: 38, category: "D. Conversation missions", text: "Ask someone for their most harmless office confession." },
  { id: 39, category: "D. Conversation missions", text: "Ask someone what song describes their week." },
  { id: 40, category: "D. Conversation missions", text: "Ask someone what they would ban from meetings forever." },
  { id: 41, category: "D. Conversation missions", text: "Ask someone what they would add to every TGIF." },
  { id: 42, category: "D. Conversation missions", text: "Ask someone what job they would do if Localworks did not exist." },
  { id: 43, category: "D. Conversation missions", text: "Ask someone which Localworks project has the best vibes." },
  { id: 44, category: "D. Conversation missions", text: "Ask someone to explain their work badly on purpose." },
  { id: 45, category: "E. Games, competition, and small victories", text: "Beat someone at foosball." },
  { id: 46, category: "E. Games, competition, and small victories", text: "Lose at foosball and blame \"poor site conditions.\"" },
  { id: 47, category: "E. Games, competition, and small victories", text: "Score one foosball goal and celebrate like Uganda won the World Cup." },
  { id: 48, category: "E. Games, competition, and small victories", text: "Challenge someone to rock-paper-scissors." },
  { id: 49, category: "E. Games, competition, and small victories", text: "Win rock-paper-scissors." },
  { id: 50, category: "E. Games, competition, and small victories", text: "Lose rock-paper-scissors and demand a rematch." },
  { id: 51, category: "E. Games, competition, and small victories", text: "Start a clap rhythm and get at least two people to join." },
  { id: 52, category: "E. Games, competition, and small victories", text: "Dance for at least 10 seconds." },
  { id: 53, category: "E. Games, competition, and small victories", text: "Dance while seated." },
  { id: 54, category: "E. Games, competition, and small victories", text: "Make someone dance who claimed they do not dance." },
  { id: 55, category: "E. Games, competition, and small victories", text: "Start a mini chant for someone." },
  { id: 56, category: "E. Games, competition, and small victories", text: "Quietly copy someone's dance move." },
  { id: 57, category: "E. Games, competition, and small victories", text: "Do a victory pose after completing any activity." },
  { id: 58, category: "E. Games, competition, and small victories", text: "Celebrate someone else's small win loudly." },
  { id: 59, category: "E. Games, competition, and small victories", text: "Declare yourself temporarily unbeatable at something." },
  { id: 60, category: "F. MC, speaker, and room interaction", text: "Interrupt the MC politely with a funny comment." },
  { id: 61, category: "F. MC, speaker, and room interaction", text: "Ask the MC a completely unnecessary question." },
  { id: 62, category: "F. MC, speaker, and room interaction", text: "Cheer for a speaker before they start." },
  { id: 63, category: "F. MC, speaker, and room interaction", text: "Say \"point of information\" during a casual moment." },
  { id: 64, category: "F. MC, speaker, and room interaction", text: "Ask someone to \"take minutes\" of a funny conversation." },
  { id: 65, category: "F. MC, speaker, and room interaction", text: "Clap as if a major contract has just been awarded." },
  { id: 66, category: "F. MC, speaker, and room interaction", text: "Ask for a vote on something silly." },
  { id: 67, category: "F. MC, speaker, and room interaction", text: "Nominate someone as Minister of Vibes." },
  { id: 68, category: "F. MC, speaker, and room interaction", text: "Give someone a fake award title." },
  { id: 69, category: "F. MC, speaker, and room interaction", text: "Whisper \"this is going in the report\" after something funny happens." },
  { id: 70, category: "G. Localworks-flavoured fun", text: "Mention bamboo in a conversation where it does not belong." },
  { id: 71, category: "G. Localworks-flavoured fun", text: "Describe your drink as a \"locally sourced material.\"" },
  { id: 72, category: "G. Localworks-flavoured fun", text: "Call the snack table a \"mixed-use development.\"" },
  { id: 73, category: "G. Localworks-flavoured fun", text: "Refer to the dance floor as \"public realm.\"" },
  { id: 74, category: "G. Localworks-flavoured fun", text: "Say a chair has \"good structural integrity.\"" },
  { id: 75, category: "G. Localworks-flavoured fun", text: "Tell someone their outfit has \"excellent detailing.\"" },
  { id: 76, category: "G. Localworks-flavoured fun", text: "Describe someone's laugh as \"good acoustic performance.\"" },
  { id: 77, category: "G. Localworks-flavoured fun", text: "Call a group of people a \"cluster development.\"" },
  { id: 78, category: "G. Localworks-flavoured fun", text: "Say your bamboo forest is \"low carbon and high vibes.\"" },
  { id: 79, category: "G. Localworks-flavoured fun", text: "Explain your mood using an engineering or architectural term." },
  { id: 80, category: "G. Localworks-flavoured fun", text: "Say \"I am just here for the bamboo\" with a straight face." },
  { id: 81, category: "G. Localworks-flavoured fun", text: "Invent a fake Localworks department." },
  { id: 82, category: "H. Secret identity and bragging missions", text: "Name your bamboo forest." },
  { id: 83, category: "H. Secret identity and bragging missions", text: "Tell someone your bamboo forest is growing faster than theirs." },
  { id: 84, category: "H. Secret identity and bragging missions", text: "Form a secret bamboo alliance with one person." },
  { id: 85, category: "H. Secret identity and bragging missions", text: "Betray your bamboo alliance politely." },
  { id: 86, category: "H. Secret identity and bragging missions", text: "Tell someone you are \"not here to compete\" while clearly competing." },
  { id: 87, category: "H. Secret identity and bragging missions", text: "Quietly check your bamboo count and smile suspiciously." },
  { id: 88, category: "H. Secret identity and bragging missions", text: "Accuse someone of having illegal bamboo." },
  { id: 89, category: "H. Secret identity and bragging missions", text: "Declare yourself the most fun person in the room, privately or publicly." },
  { id: 90, category: "H. Secret identity and bragging missions", text: "Create a fake campaign slogan for your bamboo forest." },
  { id: 91, category: "H. Secret identity and bragging missions", text: "Secretly complete 10 activities before anyone notices." },
  { id: 92, category: "I. Funny personal dares", text: "Speak in a serious meeting voice for one full minute." },
  { id: 93, category: "I. Funny personal dares", text: "Speak in a fake radio presenter voice for one sentence." },
  { id: 94, category: "I. Funny personal dares", text: "Use a proverb badly but confidently." },
  { id: 95, category: "I. Funny personal dares", text: "Say \"as per my last bamboo\" in conversation." },
  { id: 96, category: "I. Funny personal dares", text: "Laugh at a joke you did not fully hear." },
  { id: 97, category: "I. Funny personal dares", text: "Pretend to understand a story, then ask one unrelated question but make it seem like it comes from the story's context." },
  { id: 98, category: "I. Funny personal dares", text: "Give life advice that sounds wise but means almost nothing." },
  { id: 99, category: "I. Funny personal dares", text: "Say \"I was young then\" about something that happened last week." },
  { id: 100, category: "I. Funny personal dares", text: "Make a dramatic entrance or exit." },
  { id: 101, category: "I. Funny personal dares", text: "End the night by telling someone, \"My forest has grown.\"" },
];

const plotPositions = Array.from({ length: tasks.length }, (_, index) => {
  const column = index % 11;
  const row = Math.floor(index / 11);
  const left = 7 + column * 8.6 + (row % 2) * 2.2;
  const top = 17 + row * 7.8 + ((column % 3) - 1) * 1.1;
  return [left, top];
});

const categoryNotes: Record<string, string> = {
  "A. Arrival, greetings, and social sneaking": "10 tasks",
  "B. Secret mischief, but harmless": "10 tasks",
  "C. Food and drink challenges": "14 tasks",
  "D. Conversation missions": "10 tasks",
  "E. Games, competition, and small victories": "15 tasks",
  "F. MC, speaker, and room interaction": "10 tasks",
  "G. Localworks-flavoured fun": "12 tasks",
  "H. Secret identity and bragging missions": "10 tasks",
  "I. Funny personal dares": "10 tasks",
};

function stageFor(count: number) {
  if (count === 0) return { name: "Bare earth" };
  if (count < 20) return { name: "First clumps" };
  if (count < 40) return { name: "Young bamboo" };
  if (count < 70) return { name: "Tall bamboo" };
  if (count < tasks.length) return { name: "Dense bamboo" };
  return { name: "Full plot" };
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PG";
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
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [playerName, setPlayerName] = useState("TGIF party guest");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [syncingIds, setSyncingIds] = useState<number[]>([]);
  const [taskCompletionCounts, setTaskCompletionCounts] = useState<Record<number, number>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [plantationView, setPlantationView] = useState<"plot" | "leaders">("plot");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [query, setQuery] = useState("");
  const [newPlant, setNewPlant] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const plantationRef = useRef<HTMLElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleSetupVersionRef = useRef(0);

  const loadTaskCompletionCounts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("task_completion_counts")
      .select("task_id, completion_count");

    if (!error && data) {
      setTaskCompletionCounts(
        Object.fromEntries(
          data.map((entry: { task_id: number; completion_count: number }) => [
            Number(entry.task_id),
            Number(entry.completion_count),
          ])
        )
      );
    }
  }, []);

  useEffect(() => {
    const authMessage = new URLSearchParams(window.location.search).get("auth_error");
    if (authMessage) {
      queueMicrotask(() => setAuthError(authMessage));
      window.history.replaceState({}, "", window.location.pathname);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      const stored = window.localStorage.getItem("tgaif-completed");
      const entered = window.sessionStorage.getItem("tgaif-entered");
      let storedCompletions: number[] | null = null;
      if (stored) {
        try {
          storedCompletions = JSON.parse(stored);
        } catch {
          window.localStorage.removeItem("tgaif-completed");
        }
      }
      queueMicrotask(() => {
        if (storedCompletions) setCompleted(storedCompletions);
        if (entered === "true") setScreen("game");
        setAuthReady(true);
      });
      return;
    }

    let active = true;

    async function initialiseAccount() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error && error.name !== "AuthSessionMissingError") {
        setAuthError("The app cannot restore your session. Sign in again.");
      }
      if (data.user) {
        setUser(data.user);
        setScreen("game");
        await loadPlayerData(data.user);
      }
      setAuthReady(true);
    }

    void initialiseAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoggingIn(false);
      if (session?.user) {
        setScreen("game");
        void loadPlayerData(session.user);
      } else {
        setCompleted([]);
        setLeaderboard([]);
        setScreen("login");
      }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      window.localStorage.setItem("tgaif-completed", JSON.stringify(completed));
    }
  }, [completed]);

  useEffect(() => {
    if (!isSupabaseConfigured || screen !== "game") return;

    const initialRefreshId = window.setTimeout(() => {
      void loadTaskCompletionCounts();
    }, 0);
    const intervalId = window.setInterval(() => {
      void loadTaskCompletionCounts();
    }, 5000);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
    };
  }, [loadTaskCompletionCounts, screen]);

  useEffect(() => {
    if (
      !isSupabaseConfigured ||
      !authReady ||
      !googleScriptReady ||
      screen !== "login" ||
      !window.google ||
      !googleButtonRef.current
    ) {
      return;
    }

    const buttonElement = googleButtonRef.current;
    const setupVersion = ++googleSetupVersionRef.current;

    async function setupGoogleButton() {
      try {
        const { nonce, hashedNonce } = await generateGoogleNonce();
        if (
          setupVersion !== googleSetupVersionRef.current ||
          googleButtonRef.current !== buttonElement ||
          !window.google
        ) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          nonce: hashedNonce,
          ux_mode: "popup",
          callback: async (response) => {
            const supabase = getSupabaseBrowserClient();
            if (!supabase) return;

            setAuthError("");
            setLoggingIn(true);
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            });

            if (error) {
              setAuthError(error.message);
              setLoggingIn(false);
            }
          },
        });

        buttonElement.replaceChildren();
        window.google.accounts.id.renderButton(buttonElement, {
          type: "standard",
          shape: "pill",
          theme: "outline",
          text: "continue_with",
          size: "large",
          logo_alignment: "left",
          width: Math.min(380, Math.max(240, buttonElement.clientWidth)),
        });
        setGoogleButtonReady(true);
      } catch {
        setAuthError("Google sign-in did not load. Refresh the page and try again.");
      }
    }

    void setupGoogleButton();

    return () => {
      googleSetupVersionRef.current += 1;
    };
  }, [authReady, googleScriptReady, screen]);

  async function loadPlayerData(account: User) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const [profileResult, completionResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", account.id)
        .maybeSingle(),
      supabase
        .from("completions")
        .select("task_id")
        .eq("user_id", account.id),
    ]);

    const metadataName =
      account.user_metadata.full_name ??
      account.user_metadata.name ??
      account.email?.split("@")[0] ??
      "TGIF party guest";
    const metadataAvatar =
      account.user_metadata.avatar_url ??
      account.user_metadata.picture ??
      null;

    setPlayerName(profileResult.data?.display_name ?? metadataName);
    setAvatarUrl(profileResult.data?.avatar_url ?? metadataAvatar);
    setCompleted(
      completionResult.data
        ?.map((row: { task_id: number }) => Number(row.task_id))
        .sort((a: number, b: number) => a - b) ?? []
    );
    await Promise.all([loadLeaderboard(), loadTaskCompletionCounts()]);
  }

  async function loadLeaderboard() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("leaderboard")
      .select("id, display_name, avatar_url, completed_count, last_completion_at")
      .order("completed_count", { ascending: false })
      .order("last_completion_at", { ascending: true, nullsFirst: false })
      .limit(100);

    if (!error && data) {
      setLeaderboard(
        data.map((entry: LeaderboardEntry) => ({
          ...entry,
          completed_count: Number(entry.completed_count),
        }))
      );
    }
  }

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
  const currentRank = user
    ? leaderboard.findIndex((entry) => entry.id === user.id) + 1
    : 0;

  async function enterGame() {
    setAuthError("");
    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      setAuthError("Google sign-in is loading. Try again.");
      return;
    }

    setLoggingIn(true);
    window.setTimeout(() => {
      window.sessionStorage.setItem("tgaif-entered", "true");
      setLoggingIn(false);
      setScreen("game");
    }, 650);
  }

  async function toggleTask(id: number) {
    if (syncingIds.includes(id)) return;

    const isDone = completed.includes(id);
    const isFull = (taskCompletionCounts[id] ?? 0) >= 5 && !isDone;
    if (isFull) {
      setToast("Five players already ticked this task.");
      window.setTimeout(() => setToast(""), 2600);
      return;
    }

    const previous = completed;
    setCompleted((current) =>
      isDone ? current.filter((item) => item !== id) : [...current, id]
    );

    if (!isDone) {
      setNewPlant(id);
      setToast("The tick planted one clump on your plot.");
      window.setTimeout(() => setNewPlant(null), 1200);
      window.setTimeout(() => setToast(""), 2600);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    setSyncingIds((current) => [...current, id]);
    const result = isDone
      ? await supabase
          .from("completions")
          .delete()
          .eq("user_id", user.id)
          .eq("task_id", id)
      : await supabase
          .from("completions")
          .insert({ user_id: user.id, task_id: id });

    setSyncingIds((current) => current.filter((item) => item !== id));

    if (result.error) {
      setCompleted(previous);
      setNewPlant(null);
      setToast(
        result.error.message.includes("task_full")
          ? "Five players already ticked this task."
          : "The app did not save the tick. Try again."
      );
      window.setTimeout(() => setToast(""), 2800);
      await loadTaskCompletionCounts();
      return;
    }

    await Promise.all([loadLeaderboard(), loadTaskCompletionCounts()]);
  }

  async function resetPlantation() {
    if (completed.length === 0) return;
    if (!window.confirm("Are you sure? This will clear all ticks.")) return;

    const previous = completed;
    setCompleted([]);
    const supabase = getSupabaseBrowserClient();

    if (supabase && user) {
      const { error } = await supabase
        .from("completions")
        .delete()
        .eq("user_id", user.id);
      if (error) {
        setCompleted(previous);
        setToast("The app did not reset your plot. Try again.");
        window.setTimeout(() => setToast(""), 2600);
        return;
      }
      await Promise.all([loadLeaderboard(), loadTaskCompletionCounts()]);
    }

    setToast("The plot is empty. Tick a task to plant a clump.");
    window.setTimeout(() => setToast(""), 2200);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      return;
    }
    window.sessionStorage.removeItem("tgaif-entered");
    setScreen("login");
  }

  if (screen === "login") {
    return (
      <main className="login-shell">
        <header className="login-nav">
          <a className="brand-lockup" href="#" aria-label="TG(AI)F home">
            <BambooMark />
            <span>TG<span className="ai">(AI)</span>F</span>
          </a>
        </header>

        <section className="login-card" aria-labelledby="welcome-title">
          <div className="eyebrow">THE TGIF PARTY TASK LIST</div>
          <h1 id="welcome-title">Do tasks.<br /><span>Grow bamboo.</span></h1>
          <p className="login-lede">
            Each tick plants one bamboo clump on your plot.
            Grow as much as you can.
          </p>

          {isSupabaseConfigured ? (
            <>
              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onReady={() => setGoogleScriptReady(true)}
                onError={() =>
                  setAuthError("Google sign-in did not load. Refresh the page and try again.")
                }
              />
              <div
                className={`google-signin-wrap ${
                  googleButtonReady && !loggingIn ? "is-ready" : ""
                }`}
                aria-busy={!googleButtonReady || loggingIn}
              >
                <div className="google-signin-button" ref={googleButtonRef} />
                {(!googleButtonReady || loggingIn) && (
                  <button className="google-button google-placeholder" disabled>
                    <span className="spinner" />
                    <span>
                      {!authReady || !googleButtonReady
                        ? "Loading secure sign-in…"
                        : "Opening the task list…"}
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              className="google-button"
              onClick={enterGame}
              disabled={loggingIn || !authReady}
            >
              {loggingIn || !authReady ? <span className="spinner" /> : <GoogleMark />}
              <span>
                {!authReady
                  ? "Checking your account…"
                  : loggingIn
                    ? "Opening the task list…"
                    : "Continue with Google"}
              </span>
            </button>
          )}
          <p className={`preview-note ${authError ? "auth-error" : ""}`}>
            {authError
              ? authError
              : isSupabaseConfigured
                ? "The app saves your progress to your account."
                : ""}
          </p>

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
          <span></span>
          <span className="footer-dot"></span>
          <span>ONE TICK = ONE CLUMP</span>
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
        <div className="header-progress" aria-label={`Progress: ${completed.length} of ${tasks.length}`}>
          <div className="header-progress-copy">
            <span>PROGRESS:</span>
            <strong>{completed.length}<small> OF {tasks.length}</small></strong>
          </div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
        <button className="avatar-button" onClick={signOut} title={`Sign out as ${playerName}.`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            initialsFor(playerName)
          )}
          <span>{playerName}</span>
        </button>
      </header>

      <div className="game-grid">
        <section className="missions-panel" aria-labelledby="missions-heading">
          <div className="missions-heading-row">
            <div>
              <p className="eyebrow">TONIGHT&apos;S TASKS</p>
              <h1 id="missions-heading">Do the tasks.</h1>
            </div>
            <button
              className="jump-to-land"
              onClick={() => plantationRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              View my plot <span>↘</span>
            </button>
          </div>
          <p className="missions-intro">
            Do the tasks in any sequence. Tick a task only when it is done.
          </p>

          <div className="list-tools">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a task"
                aria-label="Find a task"
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
                    const isSyncing = syncingIds.includes(task.id);
                    const isFull =
                      (taskCompletionCounts[task.id] ?? 0) >= 5 && !isDone;
                    return (
                      <button
                        className={`task-row ${isDone ? "done" : ""} ${isSyncing ? "syncing" : ""} ${isFull ? "full" : ""}`}
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        aria-pressed={isDone}
                        aria-label={
                          isFull
                            ? `${task.text} Five players already ticked this task.`
                            : task.text
                        }
                        disabled={isSyncing || isFull}
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
                <strong>No tasks found.</strong>
                <p>Try another search or filter.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="plantation-panel" ref={plantationRef} aria-labelledby="plantation-heading">
          <div className="plantation-card">
            <div className="plantation-topline">
              <div>
                <p className="eyebrow">YOUR PLOT</p>
                <h2 id="plantation-heading">
                  {plantationView === "plot" ? stage.name : "Top players"}
                </h2>
              </div>
              <div className="plant-count">
                <strong>{plantationView === "plot" ? completed.length : currentRank || "—"}</strong>
                <span>{plantationView === "plot" ? <>clumps<br /></> : <>your<br />rank</>}</span>
              </div>
            </div>

            {isSupabaseConfigured && (
              <div className="plantation-tabs" role="tablist" aria-label="Plot views">
                <button
                  className={plantationView === "plot" ? "active" : ""}
                  onClick={() => setPlantationView("plot")}
                  role="tab"
                  aria-selected={plantationView === "plot"}
                >
                  My plot
                </button>
                <button
                  className={plantationView === "leaders" ? "active" : ""}
                  onClick={() => {
                    setPlantationView("leaders");
                    void loadLeaderboard();
                  }}
                  role="tab"
                  aria-selected={plantationView === "leaders"}
                >
                  Leaderboard <span>{leaderboard.length}</span>
                </button>
              </div>
            )}

            {plantationView === "plot" ? (
              <>
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
                    <div className="first-shoot-note"><span>↓</span> Tick a task to plant a clump.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="leaderboard-board">
                <div className="leaderboard-labels">
                  <span>Player</span>
                  <span>Clumps</span>
                </div>
                <div className="leaderboard-list">
                  {leaderboard.map((entry, index) => (
                    <div
                      className={`leaderboard-row ${entry.id === user?.id ? "is-you" : ""}`}
                      key={entry.id}
                    >
                      <span className={`leader-rank rank-${index + 1}`}>{index + 1}</span>
                      <span className="leader-avatar">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" referrerPolicy="no-referrer" />
                        ) : (
                          initialsFor(entry.display_name)
                        )}
                      </span>
                      <span className="leader-name">
                        <strong>{entry.display_name}</strong>
                        <small>{entry.id === user?.id ? "You" : stageFor(entry.completed_count).name}</small>
                      </span>
                      <span className="leader-score">
                        <strong>{entry.completed_count}</strong>
                        <small>clumps</small>
                      </span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="leaderboard-empty">
                      <span>🎋</span>
                      <strong>No player has a score.</strong>
                      <p>Tick one task to enter the leaderboard.</p>
                    </div>
                  )}
                </div>
                <p className="leaderboard-footnote">
                  The leaderboard updates after each tick.
                </p>
              </div>
            )}

            <button className="reset-button" onClick={resetPlantation}>
              Reset my plot
            </button>
          </div>

          <div className="impact-note">
            <BambooMark />
            <p><strong>Bamboo grows quickly.</strong> It is renewable and strong.</p>
          </div>
        </aside>
      </div>

      <div className={`growth-toast ${toast ? "visible" : ""}`} role="status">
        <span>🎋</span>{toast}
      </div>
    </main>
  );
}
