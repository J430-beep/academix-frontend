// ===============================
// CONFIG
// ===============================
const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

// SCHOOL ID (multi-tenant SaaS fix)
const SCHOOL_ID = localStorage.getItem("school_id");

// ===============================
// SAFE FETCH
// ===============================
async function safeFetch(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        return await res.json();

    } catch (err) {
        console.error("Fetch failed:", url, err);
        return [];
    }
}

// ===============================
// DASHBOARD STATS (SCHOOL FILTERED)
// ===============================
async function fetchTotalStudents() {
    const students = await safeFetch(`${API_BASE}/students?school_id=${SCHOOL_ID}`);
    document.getElementById('total-students').innerText =
        `Total Students: ${students.length}`;
}

async function fetchTotalTeachers() {
    const teachers = await safeFetch(`${API_BASE}/teachers?school_id=${SCHOOL_ID}`);
    document.getElementById('total-teachers').innerText =
        `Total Teachers: ${teachers.length}`;
}

async function fetchTotalExams() {
    const exams = await safeFetch(`${API_BASE}/exams?school_id=${SCHOOL_ID}`);
    document.getElementById('total-exams').innerText =
        `Total Exams: ${exams.length}`;
}

async function fetchTotalClasses() {
    const classes = await safeFetch(`${API_BASE}/classes?school_id=${SCHOOL_ID}`);
    document.getElementById('total-classes').innerText =
        `Total Classes: ${classes.length}`;
}

// ===============================
// NOTIFICATIONS
// ===============================
async function fetchRecentNotifications() {
    const notifications = await safeFetch(`${API_BASE}/notifications?school_id=${SCHOOL_ID}`);

    const list = document.getElementById('notifications-list');
    if (!list) return;

    list.innerHTML = '';

    notifications.slice(0, 5).forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `🔔 <b>${n.title}</b>: ${n.message}`;
        list.appendChild(li);
    });
}

// ===============================
// AI TUTOR (DASHBOARD LEVEL)
// ===============================
async function askAI(event) {
    event.preventDefault();

    const input = document.getElementById("question");
    const list = document.getElementById("ai-responses");

    const question = input.value.trim();
    if (!question) return;

    list.innerHTML += `<li>🧑 You: ${question}</li>`;

    try {
        const res = await fetch(`${API_BASE}/aiTutor/ask?school_id=${SCHOOL_ID}`, {
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
// INIT DASHBOARD
// ===============================
async function initDashboard() {
    await fetchTotalStudents();
    await fetchTotalTeachers();
    await fetchTotalExams();
    await fetchTotalClasses();
    await fetchRecentNotifications();
}

// ===============================
// EVENTS
// ===============================
window.addEventListener('DOMContentLoaded', initDashboard);

document.getElementById("ai-form")?.addEventListener("submit", askAI);