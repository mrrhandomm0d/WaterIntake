import { fs, collection, onSnapshot } from "./firebase.js";

window.onload = function () {
  const dateElement = document.getElementById("date-today");
  const weekElement = document.getElementById("week-number");
  const waterText = document.querySelector(".water-text");
  const water = document.querySelector(".water");

  // --- DATE & WEEK DISPLAY ---
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = today.toLocaleDateString('en-US', options);

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const weekNumber = Math.ceil((today.getDate() + dayOfWeek) / 7);
  weekElement.textContent = `Week ${weekNumber}`;

  // Format date for Firestore YYYY-MM-DD
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // --- REAL-TIME FIRESTORE LISTENER ---
  const logsCol = collection(fs, "WaterLogs", dateStr, "Readings");
  let displayedML = 0; // current displayed mL for smooth number animation

  onSnapshot(logsCol, (snapshot) => {
    let totalML = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.mL) totalML += Number(data.mL);
    });

    // --- SMOOTH TEXT ANIMATION ---
    const duration = 500; // ms
    const startML = displayedML;
    const diff = totalML - startML;
    const startTime = performance.now();

    function animateText(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      displayedML = Math.round(startML + diff * progress);
      waterText.textContent = displayedML + " mL";
      if(progress < 1) requestAnimationFrame(animateText);
    }
    requestAnimationFrame(animateText);

    // --- SMOOTH WATER LEVEL ---
    const maxML = 5000; // 5000 mL = full
    const fillPercent = Math.min(totalML / maxML, 1);
    // 0 mL → bottom (400px), full → top (0px)
    const finalY = 400 * (1 - fillPercent);
    water.style.setProperty("--final-fill-y", `${finalY}px`);
    // wave animation continues; no restart needed
  });
};

// Optional: manually set fill percentage
function setFillPercentage(percent) {
  const water = document.querySelector('.water');
  const fillY = 400 * (1 - percent / 100);
  water.style.setProperty("--final-fill-y", `${fillY}px`);
}
