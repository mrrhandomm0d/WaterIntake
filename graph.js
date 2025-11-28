import { fs, collection, onSnapshot } from "./firebase.js";

const chartContainer = document.getElementById("chart");
const filterBtn = document.getElementById("filterBtn");
const weekButtonsContainer = document.getElementById("weekButtons");

let currentWeek = null;

// --- Toggle week buttons ---
filterBtn.addEventListener("click", () => {
  weekButtonsContainer.style.display = weekButtonsContainer.style.display === "none" ? "flex" : "none";
});

// --- Week calculation ---
function getTotalWeeksInMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();
  return Math.ceil((lastDay + firstDayWeekday) / 7);
}

function getWeekNumber(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayWeekday = new Date(year, month, 1).getDay();
  const week = Math.ceil((date.getDate() + firstDayWeekday) / 7);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const totalWeeks = Math.ceil((lastDay + firstDayWeekday) / 7);
  return Math.min(week, totalWeeks);
}

// --- Generate week buttons dynamically ---
function generateWeekButtons() {
  weekButtonsContainer.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalWeeks = getTotalWeeksInMonth(year, month);

  currentWeek = getWeekNumber(today);

  for (let w = 1; w <= totalWeeks; w++) {
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.dataset.week = w;
    btn.textContent = `Week ${w}`;
    if (w === currentWeek) btn.classList.add("active-week");

    btn.addEventListener("click", () => {
      document.querySelectorAll(".week-btn").forEach(b => b.classList.remove("active-week"));
      btn.classList.add("active-week");
      currentWeek = w;
      renderWeekGraph();
    });

    weekButtonsContainer.appendChild(btn);
  }
}

// --- Get all dates for a week ---
function getWeekDates(year, month, weekNumber) {
  const firstDay = new Date(year, month, 1);
  const firstDayWeekday = firstDay.getDay();
  let startDay = (weekNumber - 1) * 7 - firstDayWeekday + 1;
  if (startDay < 1) startDay = 1;

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month, startDay + i);
    if (d.getMonth() !== month) break;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    dates.push(dateStr);
  }
  return dates;
}

// --- Render week graph ---
function renderWeekGraph() {
  chartContainer.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weekDates = getWeekDates(year, month, currentWeek);
  const maxML = 5000;

  weekDates.forEach(dateStr => {
    const readingsCol = collection(fs, "WaterLogs", dateStr, "Readings");

    // Create bar container
    const bar = document.createElement("div");
    bar.className = "bar";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = dateStr;

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = "0%";

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent = "0 mL";

    bar.appendChild(label);
    bar.appendChild(fill);
    bar.appendChild(value);
    chartContainer.appendChild(bar);

    // Listen real-time for each day
    onSnapshot(readingsCol, snapshot => {
      let totalML = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.mL) totalML += Number(data.mL);
      });
      fill.style.width = Math.min((totalML / maxML) * 100, 100) + "%";
      value.textContent = totalML + " mL";
    });
  });
}

// --- Initialize ---
function init() {
  generateWeekButtons();
  renderWeekGraph();
}

init();
