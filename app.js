const db = window.supabase.createClient(
  "https://hxqkjnyxzerioqpoxdxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWtqbnl4emVyaW9xcG94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM4NDgsImV4cCI6MjA5NzgzOTg0OH0.tQBO2KljUf-_kJJQG4Bv4HBBZ5Leu4q0tvfJEtpX1jE"
);


let userId = localStorage.getItem("userId");
let username = localStorage.getItem("username");

const overlay = document.getElementById("overlay");

overlay.addEventListener("click", async () => {
  overlay.style.display = "none";

  await setupUser();
  loadAll();

  setInterval(loadLeaderboard, 3000);
});

/* CLICK SOUND */
function playClickTone() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(520, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + 0.15
  );

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

async function setupUser() {
  if (!userId) {
    username = prompt("Username?");

    userId = crypto.randomUUID();

    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);

    await db.from("users").insert({
      id: userId,
      username,
      clicks: 0
    });
  }
}

document.getElementById("clickBtn").addEventListener("click", click);

async function click() {
  playClickTone();

  const { data: stats } = await db
    .from("stats")
    .select("total_clicks")
    .eq("id", 1)
    .single();

  await db
    .from("stats")
    .update({
      total_clicks: stats.total_clicks + 1
    })
    .eq("id", 1);

  const { data: user } = await db
    .from("users")
    .select("clicks")
    .eq("id", userId)
    .single();

  await db
    .from("users")
    .update({
      clicks: user.clicks + 1
    })
    .eq("id", userId);

  showPlusOne();
  loadCount();
}

function showPlusOne() {
  const el = document.createElement("div");
  el.className = "plus-one";
  el.textContent = "+1";

  el.style.left =
    window.innerWidth / 2 +
    (Math.random() * 100 - 50) +
    "px";

  el.style.top = window.innerHeight / 2 + "px";

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 700);
}

async function loadCount() {
  const { data } = await db
    .from("stats")
    .select("total_clicks")
    .eq("id", 1)
    .single();

  document.getElementById("count").textContent =
    data.total_clicks;
}

async function loadLeaderboard() {
  const { data } = await db
    .from("users")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(10);

  const board = document.getElementById("leaderboard");
  board.innerHTML = "<h2>Leaderboard</h2>";

  data.forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "leaderboard-item";
    row.innerHTML = `
      <span>${i + 1}. ${u.username}</span>
      <span>${u.clicks}</span>
    `;
    board.appendChild(row);
  });
}

function loadAll() {
  loadCount();
  loadLeaderboard();
}