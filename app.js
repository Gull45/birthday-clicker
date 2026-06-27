const db = window.supabase.createClient(
  "https://hxqkjnyxzerioqpoxdxo.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWtqbnl4emVyaW9xcG94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM4NDgsImV4cCI6MjA5NzgzOTg0OH0.tQBO2KljUf-_kJJQG4Bv4HBBZ5Leu4q0tvfJEtpX1jE"
);

const overlay = document.getElementById("overlay");
const results = document.getElementById("results");

const music = document.getElementById("music");
const tickSound = document.getElementById("tick");

overlay.addEventListener("click", async () => {

    overlay.style.pointerEvents = "none";

    music.volume = 0.35;
    music.play();

    await sleep(1300);

    overlay.style.opacity = "0";

    await sleep(600);

    overlay.remove();

    results.classList.remove("hidden");

    await revealLeaderboard();

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function revealLeaderboard() {

    const { data: players, error } = await db
        .from("users")
        .select("username, clicks")
        .order("clicks", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    results.innerHTML = "";

    for (let i = 0; i < players.length; i++) {

        const player = players[i];

        const row = document.createElement("div");
        row.className = "player";

        const place = document.createElement("div");
        place.className = "place";
        place.textContent = "#" + (i + 1);

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = player.username;

        const score = document.createElement("div");
        score.className = "score";
        score.textContent = "0";

        row.appendChild(place);
        row.appendChild(name);
        row.appendChild(score);

        results.appendChild(row);

        requestAnimationFrame(() => {
            row.classList.add("show");
        });

        await animateScore(score, player.clicks);

        await sleep(180);
    }

}

async function animateScore(element, target) {

    let current = 0;

    const step = Math.max(1, Math.ceil(target / 90));

    while (current < target) {

        current += step;

        if (current > target)
            current = target;

        element.textContent = current.toLocaleString();

        const s = tickSound.cloneNode();

        s.volume = 0.18;

        s.play().catch(() => {});

        await sleep(18);
    }

}