// ===============================
// SAAS CONFIG
// ===============================
const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

// ===============================
// SAAS SESSION LAYER
// ===============================
const SCHOOL_ID = localStorage.getItem("school_id");
const TOKEN = localStorage.getItem("token");

function requireAuth() {
    if (!SCHOOL_ID) {
        console.warn("No school_id found. Redirecting...");
        window.location.href = "school-register.html";
        return false;
    }
    return true;
}

// ===============================
// SAFE FETCH (SAAS-GRADE)
// ===============================
async function safeFetch(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return await res.json();

    } catch (err) {
        console.error("API Error:", url, err);

        // Prevent UI crash
        return [];
    }
}

// ===============================
// SAAS URL HELPER (MULTI-TENANT SAFE)
// ===============================
function withSchool(url) {
    if (!SCHOOL_ID) return url;
    return `${url}${url.includes("?") ? "&" : "?"}school_id=${SCHOOL_ID}`;
}

// ===============================
// DASHBOARD STATS (OPTIMIZED)
// ===============================
async function fetchTotalStudents() {
    const data = await safeFetch(withSchool(`${API_BASE}/students`));
    document.getElementById("total-students").innerText =
        `Total Students: ${data.length}`;
}

async function fetchTotalTeachers() {
    const data = await safeFetch(withSchool(`${API_BASE}/teachers`));
    document.getElementById("total-teachers").innerText =
        `Total Teachers: ${data.length}`;
}

async function fetchTotalExams() {
    const data = await safeFetch(withSchool(`${API_BASE}/exams`));
    document.getElementById("total-exams").innerText =
        `Total Exams: ${data.length}`;
}

async function fetchTotalClasses() {
    const data = await safeFetch(withSchool(`${API_BASE}/classes`));
    document.getElementById("total-classes").innerText =
        `Total Classes: ${data.length}`;
}

// ===============================
// NOTIFICATIONS (SAFE)
// ===============================
async function fetchRecentNotifications() {
    const list = document.getElementById("notifications-list");
    if (!list) return;

    const data = await safeFetch(withSchool(`${API_BASE}/notifications`));

    list.innerHTML = "";

    data.slice(0, 5).forEach(n => {
        const li = document.createElement("li");
        li.textContent = `🔔 ${n.title}: ${n.message}`;
        list.appendChild(li);
    });
}

// ===============================
// AI TUTOR (SAFE)
// ===============================
async function askAI(event) {
    event.preventDefault();

    const input = document.getElementById("question");
    const list = document.getElementById("ai-responses");

    if (!input || !list) return;

    const question = input.value.trim();
    if (!question) return;

    list.innerHTML += `<li>🧑 You: ${question}</li>`;

    try {
        const res = await fetch(withSchool(`${API_BASE}/aiTutor/ask`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: null,
                question
            })
        });

        const data = await res.json();

        list.innerHTML += `<li>🤖 AI: ${data.answer || "No response"}</li>`;

    } catch (err) {
        console.error(err);
        list.innerHTML += `<li style="color:red;">AI Error</li>`;
    }

    input.value = "";
}

// ===============================
// DASHBOARD INITIALIZER (SAAS CORE)
// ===============================
async function initDashboard() {
    if (!requireAuth()) return;

    try {
        await Promise.all([
            fetchTotalStudents(),
            fetchTotalTeachers(),
            fetchTotalExams(),
            fetchTotalClasses(),
            fetchRecentNotifications()
        ]);
    } catch (err) {
        console.error("Dashboard init failed:", err);
    }
}

// ===============================
// EVENTS
// ===============================
window.addEventListener("DOMContentLoaded", initDashboard);

document.getElementById("ai-form")?.addEventListener("submit", askAI);