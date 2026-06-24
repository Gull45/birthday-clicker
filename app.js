const db = window.supabase.createClient(
  "https://hxqkjnyxzerioqpoxdxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWtqbnl4emVyaW9xcG94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM4NDgsImV4cCI6MjA5NzgzOTg0OH0.tQBO2KljUf-_kJJQG4Bv4HBBZ5Leu4q0tvfJEtpX1jE"
);


const overlay = document.getElementById("overlay");
const app = document.getElementById("app");
const music = document.getElementById("music");

let userId = null;
let username = null;

/* START GAME */
overlay.addEventListener("click", async () => {
  overlay.style.display = "none";

  setTimeout(() => {
    music.volume = 0.3;
    music.play();
  }, 240);

  await initUser();

  app.style.display = "flex";

  loadAll();
  setInterval(loadLeaderboard, 3000);
});

/* USER CHECK + CREATE IF NEEDED */
async function initUser() {
  const storedId = localStorage.getItem("userId");
  const storedName = localStorage.getItem("username");

  if (storedId) {
    const { data, error } = await db
      .from("users")
      .select("*")
      .eq("id", storedId)
      .maybeSingle();

    if (data) {
      userId = storedId;
      username = storedName;
      return;
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
  }

  username = prompt("Enter your username");

  if (!username) username = "Player";

  userId = crypto.randomUUID();

  localStorage.setItem("userId", userId);
  localStorage.setItem("username", username);

  await db.from("users").insert({
    id: userId,
    username,
    clicks: 0
  });
}

/* CLICK SOUND */
function playClickTone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 520;

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + 0.12
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

/* CLICK */
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

  if (user) {
    await db
      .from("users")
      .update({
        clicks: user.clicks + 1
      })
      .eq("id", userId);
  }

  showPlusOne();
  loadCount();
}

/* +1 EFFECT */
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

/* LOAD COUNT */
async function loadCount() {
  const { data } = await db
    .from("stats")
    .select("total_clicks")
    .eq("id", 1)
    .single();

  document.getElementById("count").textContent =
    data.total_clicks;
}

/* LEADERBOARD */
async function loadLeaderboard() {
  const { data } = await db
    .from("users")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(10);

  const board = document.getElementById("leaderboard");
  board.innerHTML = "";

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

/* INIT */
function loadAll() {
  loadCount();
  loadLeaderboard();
}