// In The Paint — app.js
// Demo mode: skips real auth, renders roster + schedule with fake data
// so there's something to click through and show the coach.
// Swap FAKE_PLAYERS / FAKE_SCHEDULE for real Supabase queries once auth is wired up.

const splashScreen = document.getElementById("splash-screen");
window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.add("fade-out");
    setTimeout(() => splashScreen.remove(), 700);
  }, 1600);
});

const authScreen = document.getElementById("auth-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginForm = document.getElementById("login-form");
const contentArea = document.getElementById("content-area");
const navItems = document.querySelectorAll(".nav-item");

// ---------- FAKE DATA (swap for Supabase queries later) ----------

const FAKE_PLAYERS = [
  { name: "Ezra Davis", jersey: "4", position: "PG", color: "#d4a017" },
  { name: "Malik Thomas", jersey: "11", position: "SG", color: "#3b82f6" },
  { name: "Jaylen Brooks", jersey: "23", position: "SF", color: "#22c55e" },
  { name: "Connor Hayes", jersey: "8", position: "PF", color: "#a855f7" },
  { name: "Tre Williams", jersey: "00", position: "C", color: "#ef4444" },
  { name: "Sam Patterson", jersey: "5", position: "SG", color: "#06b6d4" },
  { name: "DeShawn Lee", jersey: "15", position: "SF", color: "#f97316" },
  { name: "Owen Reyes", jersey: "21", position: "PF", color: "#84cc16" },
];

const FAKE_SCHEDULE = [
  { month: "JUL", day: "11", opponent: "vs. Triangle Elite", location: "Sandhills Rec Center", time: "6:00 PM", type: "league", homeAway: "home" },
  { month: "JUL", day: "13", opponent: "@ Carolina Heat", location: "Fayetteville Sportsplex", time: "10:30 AM", type: "league", homeAway: "away" },
  { month: "JUL", day: "19", opponent: "Pinehurst Summer Shootout", location: "Pinehurst Athletic Club", time: "All Day", type: "tournament", homeAway: "away" },
  { month: "JUL", day: "25", opponent: "vs. Cape Fear Ballers", location: "Sandhills Rec Center", time: "7:00 PM", type: "league", homeAway: "home" },
  { month: "AUG", day: "02", opponent: "@ Wilmington Wave", location: "Wilmington YMCA", time: "1:00 PM", type: "league", homeAway: "away" },
];

const FAKE_GALLERY = [
  { url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop", uploader: "Coach Aaron" },
  { url: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=300&h=300&fit=crop", uploader: "Tre's Dad" },
  { url: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=300&h=300&fit=crop", uploader: "Malik's Mom" },
  { url: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=300&h=300&fit=crop", uploader: "Coach Aaron" },
  { url: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=300&h=300&fit=crop", uploader: "Sam's Mom" },
  { url: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=300&h=300&fit=crop", uploader: "Coach Aaron" },
];

const FAKE_TRAINING_TEAM = [
  {
    type: "workout",
    title: "Ball Handling Circuit",
    exercises: [
      { name: "Stationary dribbling (both hands)", sets: 3, reps: "30 sec" },
      { name: "Crossover walk", sets: 3, reps: "20 yd" },
      { name: "Cone weave dribble", sets: 4, reps: "1 lap" },
    ],
  },
  {
    type: "skill_video",
    title: "Footwork: Pivoting Off Two Feet",
    description: "Coach Aaron breaks down jump-stop footwork before practice Thursday.",
  },
  {
    type: "workout",
    title: "Conditioning: Suicides + Defensive Slides",
    exercises: [
      { name: "Full-court suicides", sets: 4, reps: "1 run" },
      { name: "Defensive slide shuffle", sets: 3, reps: "30 sec" },
    ],
  },
];

const FAKE_TRAINING_MINE = [
  {
    type: "workout",
    title: "Ezra \u2014 Shooting Form Reps (Coach Note: focus on follow-through)",
    exercises: [
      { name: "Form shooting, 5 ft", sets: 3, reps: "10" },
      { name: "Free throws", sets: 5, reps: "5" },
    ],
  },
  {
    type: "skill_video",
    title: "Ezra \u2014 Left Hand Finishing Drill",
    description: "Assigned individually \u2014 work on finishing through contact with the off hand.",
  },
];

const FAKE_STATS = [
  { name: "Ezra Davis", color: "#d4a017", games: 9, points: 142, rebounds: 38, assists: 61, steals: 22 },
  { name: "Malik Thomas", color: "#3b82f6", games: 9, points: 98, rebounds: 51, assists: 12, steals: 14 },
  { name: "Jaylen Brooks", color: "#22c55e", games: 8, points: 87, rebounds: 44, assists: 9, steals: 19 },
  { name: "Connor Hayes", color: "#a855f7", games: 9, points: 76, rebounds: 63, assists: 7, steals: 8 },
  { name: "Tre Williams", color: "#ef4444", games: 7, points: 54, rebounds: 58, assists: 4, steals: 6 },
  { name: "Sam Patterson", color: "#06b6d4", games: 9, points: 49, rebounds: 21, assists: 28, steals: 17 },
  { name: "DeShawn Lee", color: "#f97316", games: 8, points: 41, rebounds: 19, assists: 11, steals: 13 },
  { name: "Owen Reyes", color: "#84cc16", games: 6, points: 33, rebounds: 27, assists: 5, steals: 9 },
];

const CURRENT_USER = { name: "Aaron Davis", role: "Head Coach", color: "#2980b9", initials: "AD" };

let scheduleView = "list";
let trainingView = "team";
let leaderStat = "points";
let leaderMode = "total"; // total or average

const FAKE_MESSAGES = [
  { sender: "Coach Aaron", color: "#2980b9", text: "Practice moved to 5:30 Thursday, gym conflict. Same location.", time: "Yesterday 7:42 PM", mine: true },
  { sender: "Malik's Mom", color: "#3b82f6", text: "Got it, thank you! Will Malik need his white jersey for Thursday or just practice gear?", time: "Yesterday 7:55 PM", mine: false },
  { sender: "Coach Aaron", color: "#2980b9", text: "Just practice gear, jerseys are for game day only.", time: "Yesterday 8:01 PM", mine: true },
  { sender: "Tre's Dad", color: "#ef4444", text: "Can someone confirm the address for the Pinehurst tournament? GPS is giving me two options.", time: "Today 9:14 AM", mine: false },
  { sender: "Coach Aaron", color: "#2980b9", text: "Pinehurst Athletic Club, 200 Beulah Hill Rd. I'll drop the maps link in the schedule too.", time: "Today 9:20 AM", mine: true },
];

// ---------- Auth screen toggle (still stubbed, demo skips straight to dashboard) ----------

async function checkSession() {
  // Demo mode: go straight to dashboard so roster/schedule can be reviewed.
  showDashboard();
}

function showAuth() {
  authScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
}

function showDashboard() {
  authScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  renderTab("schedule");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const identifier = document.getElementById("login-identifier").value.trim();
  alert(`Login flow not wired up yet. You entered: ${identifier}`);
});

// ---------- Tab rendering ----------

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const tab = item.getAttribute("href").replace("#", "");
    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    renderTab(tab);
  });
});

document.getElementById("header-avatar-btn").addEventListener("click", () => {
  navItems.forEach((n) => n.classList.remove("active"));
  renderProfile();
});

function renderTab(tab) {
  if (tab === "schedule") return renderSchedule();
  if (tab === "roster") return renderRoster();
  if (tab === "leaderboard") return renderLeaderboard();
  if (tab === "training") return renderTraining();
  if (tab === "chat") return renderChat();
  if (tab === "gallery") return renderGallery();
  if (tab === "profile") return renderProfile();
}

function renderRoster() {
  const cards = FAKE_PLAYERS.map((p) => `
    <div class="player-card" style="--player-color: ${p.color}">
      <div class="player-jersey">${p.jersey}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-position">${p.position}</div>
    </div>
  `).join("");

  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Roster</h2>
      <span class="count">${FAKE_PLAYERS.length} players</span>
    </div>
    <div class="roster-grid">${cards}</div>
  `;
}

function renderSchedule() {
  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Schedule</h2>
      <span class="count">${FAKE_SCHEDULE.length} upcoming</span>
    </div>
    <div class="view-toggle">
      <button class="toggle-btn ${scheduleView === "list" ? "active" : ""}" id="toggle-list">List</button>
      <button class="toggle-btn ${scheduleView === "calendar" ? "active" : ""}" id="toggle-calendar">Calendar</button>
    </div>
    <div id="schedule-body"></div>
  `;

  document.getElementById("toggle-list").addEventListener("click", () => {
    scheduleView = "list";
    renderSchedule();
  });
  document.getElementById("toggle-calendar").addEventListener("click", () => {
    scheduleView = "calendar";
    renderSchedule();
  });

  const body = document.getElementById("schedule-body");
  body.innerHTML = scheduleView === "list" ? scheduleListHTML() : scheduleCalendarHTML();
}

function scheduleListHTML() {
  return `<div class="schedule-list">${FAKE_SCHEDULE.map((ev) => {
    const badgeClass = ev.type === "tournament" ? "tournament" : ev.homeAway;
    const badgeLabel = ev.type === "tournament" ? "Tournament" : ev.homeAway;
    return `
      <div class="event-row">
        <div class="event-date">
          <span class="month">${ev.month}</span>
          <span class="day">${ev.day}</span>
        </div>
        <div class="event-body">
          <div class="event-opponent">${ev.opponent}</div>
          <div class="event-meta">
            <span class="badge ${badgeClass}">${badgeLabel}</span>
            ${ev.location} &middot; ${ev.time}
          </div>
        </div>
      </div>
    `;
  }).join("")}</div>`;
}

const MONTH_INDEX = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };

function scheduleCalendarHTML() {
  // Demo: render July 2026 since that's where the fake schedule events fall.
  const year = 2026;
  const monthIdx = 6; // July
  const monthLabel = "July 2026";
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const eventsByDay = {};
  FAKE_SCHEDULE.forEach((ev) => {
    if (MONTH_INDEX[ev.month] === monthIdx) {
      eventsByDay[parseInt(ev.day, 10)] = ev;
    }
  });

  let cells = "";
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const ev = eventsByDay[d];
    const dotClass = ev ? (ev.type === "tournament" ? "tournament" : ev.homeAway) : "";
    cells += `
      <div class="cal-cell ${ev ? "has-event" : ""}">
        <span class="cal-day-num">${d}</span>
        ${ev ? `<span class="cal-dot ${dotClass}"></span>` : ""}
      </div>
    `;
  }

  return `
    <div class="cal-month-label">${monthLabel}</div>
    <div class="cal-grid">
      <div class="cal-cell cal-weekday">S</div>
      <div class="cal-cell cal-weekday">M</div>
      <div class="cal-cell cal-weekday">T</div>
      <div class="cal-cell cal-weekday">W</div>
      <div class="cal-cell cal-weekday">T</div>
      <div class="cal-cell cal-weekday">F</div>
      <div class="cal-cell cal-weekday">S</div>
      ${cells}
    </div>
  `;
}

function renderChat() {
  const bubbles = FAKE_MESSAGES.map((m) => `
    <div class="chat-bubble-row ${m.mine ? "mine" : ""}">
      ${!m.mine ? `<div class="chat-sender" style="--sender-color:${m.color}">${m.sender}</div>` : ""}
      <div class="chat-bubble" style="--sender-color:${m.color}">${m.text}</div>
      <div class="chat-timestamp">${m.time}</div>
    </div>
  `).join("");

  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Team Chat</h2>
      <span class="count">Sandhills Ballers</span>
    </div>
    <div class="chat-thread" style="padding-bottom: 4.5rem;">${bubbles}</div>
    <div class="chat-input-row">
      <button class="chat-attach-btn" id="chat-attach" title="Attach photo">📷</button>
      <input type="text" placeholder="Message the team..." id="chat-input" />
      <button id="chat-send">Send</button>
    </div>
  `;

  document.getElementById("chat-attach").addEventListener("click", () => {
    alert("Photo attach isn't wired up yet \u2014 once live, this saves to Supabase Storage and auto-adds to the team Gallery tab.");
  });

  document.getElementById("chat-send").addEventListener("click", () => {
    alert("Sending isn't wired up yet \u2014 this is demo data.");
  });
}

function renderGallery() {
  const thumbs = FAKE_GALLERY.map((p) => `
    <div class="gallery-thumb" style="background-image: url('${p.url}')">
      <div class="gallery-thumb-uploader">${p.uploader}</div>
    </div>
  `).join("");

  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Gallery</h2>
      <span class="count">${FAKE_GALLERY.length} photos</span>
    </div>
    <div class="gallery-grid">${thumbs}</div>
    <p style="color: var(--chalk); font-size: 0.8rem; margin-bottom: 1rem;">Photos shared in Team Chat are automatically added here.</p>
  `;
}

function renderTraining() {
  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Training</h2>
      <span class="count">${trainingView === "team" ? FAKE_TRAINING_TEAM.length : FAKE_TRAINING_MINE.length} items</span>
    </div>
    <div class="view-toggle">
      <button class="toggle-btn ${trainingView === "team" ? "active" : ""}" id="toggle-team">Team Drills</button>
      <button class="toggle-btn ${trainingView === "mine" ? "active" : ""}" id="toggle-mine">My Plan</button>
    </div>
    <div id="training-body"></div>
  `;

  document.getElementById("toggle-team").addEventListener("click", () => {
    trainingView = "team";
    renderTraining();
  });
  document.getElementById("toggle-mine").addEventListener("click", () => {
    trainingView = "mine";
    renderTraining();
  });

  const items = trainingView === "team" ? FAKE_TRAINING_TEAM : FAKE_TRAINING_MINE;
  document.getElementById("training-body").innerHTML = items.map(trainingCardHTML).join("");
}

function trainingCardHTML(item) {
  if (item.type === "workout") {
    const rows = item.exercises.map((ex) => `
      <div class="exercise-row">
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-sets">${ex.sets} &times; ${ex.reps}</span>
      </div>
    `).join("");
    return `
      <div class="training-card">
        <div class="training-card-tag workout">Workout</div>
        <div class="training-card-title">${item.title}</div>
        <div class="exercise-list">${rows}</div>
      </div>
    `;
  }
  return `
    <div class="training-card">
      <div class="training-card-tag video">Skill Video</div>
      <div class="training-card-title">${item.title}</div>
      <div class="training-card-desc">${item.description}</div>
      <div class="video-placeholder">&#9658; Tap to watch</div>
    </div>
  `;
}

const STAT_LABELS = { points: "PTS", rebounds: "REB", assists: "AST", steals: "STL" };

function renderLeaderboard() {
  contentArea.innerHTML = `
    <div class="section-heading">
      <h2>Leaderboard</h2>
      <button class="export-btn" id="export-csv-btn">Export CSV</button>
    </div>
    <div class="view-toggle">
      <button class="toggle-btn ${leaderMode === "total" ? "active" : ""}" id="toggle-total">Total</button>
      <button class="toggle-btn ${leaderMode === "average" ? "active" : ""}" id="toggle-average">Per-Game Avg</button>
    </div>
    <div class="leader-stat-tabs">
      ${Object.keys(STAT_LABELS).map((key) => `
        <button class="leader-stat-tab ${leaderStat === key ? "active" : ""}" data-stat="${key}">${STAT_LABELS[key]}</button>
      `).join("")}
    </div>
    <div id="leader-body"></div>
  `;

  document.getElementById("export-csv-btn").addEventListener("click", exportLeaderboardCSV);

  document.getElementById("toggle-total").addEventListener("click", () => { leaderMode = "total"; renderLeaderboard(); });
  document.getElementById("toggle-average").addEventListener("click", () => { leaderMode = "average"; renderLeaderboard(); });
  document.querySelectorAll(".leader-stat-tab").forEach((btn) => {
    btn.addEventListener("click", () => { leaderStat = btn.dataset.stat; renderLeaderboard(); });
  });

  const ranked = [...FAKE_STATS]
    .map((p) => ({
      ...p,
      value: leaderMode === "total" ? p[leaderStat] : (p[leaderStat] / p.games),
    }))
    .sort((a, b) => b.value - a.value);

  document.getElementById("leader-body").innerHTML = ranked.map((p, i) => `
    <div class="leader-row">
      <span class="leader-rank ${i < 3 ? "top3" : ""}">${i + 1}</span>
      <span class="leader-dot" style="background:${p.color}"></span>
      <span class="leader-name">${p.name}</span>
      <span class="leader-value">${leaderMode === "total" ? p.value : p.value.toFixed(1)}</span>
    </div>
  `).join("");
}

function exportLeaderboardCSV() {
  const headers = ["Player", "Games", "Points", "Rebounds", "Assists", "Steals"];
  const rows = FAKE_STATS.map((p) => [p.name, p.games, p.points, p.rebounds, p.assists, p.steals]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sandhills-ballers-season-stats.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function renderProfile() {
  contentArea.innerHTML = `
    <div class="section-heading"><h2>Profile</h2></div>
    <div class="profile-card">
      <div class="profile-avatar" style="--player-color:${CURRENT_USER.color}">${CURRENT_USER.initials}</div>
      <div>
        <div class="profile-name">${CURRENT_USER.name}</div>
        <div class="profile-role">${CURRENT_USER.role}</div>
      </div>
    </div>
    <div class="settings-list">
      <div class="settings-row"><span>Notification Preferences</span><span class="chev">&gt;</span></div>
      <div class="settings-row"><span>Manage Roster</span><span class="chev">&gt;</span></div>
      <div class="settings-row"><span>Team Settings</span><span class="chev">&gt;</span></div>
      <div class="settings-row"><span>Sign Out</span><span class="chev">&gt;</span></div>
    </div>
  `;
}

function renderPlaceholder(title, message) {
  contentArea.innerHTML = `
    <div class="section-heading"><h2>${title}</h2></div>
    <p style="color: var(--chalk); font-size: 0.9rem;">${message}</p>
  `;
}

checkSession();
