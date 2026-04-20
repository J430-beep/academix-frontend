// ===============================
// 🚀 LEVEL 7 SAAS STUDENT PORTAL
// ===============================

const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

// 🔐 SaaS AUTH (multi-school ready)
const STUDENT_ID = localStorage.getItem("student_id");
const TOKEN = localStorage.getItem("token");
const SCHOOL_ID = localStorage.getItem("school_id");

// -------------------------------
// AUTH GUARD (ENTERPRISE SAFE)
// -------------------------------
if (!TOKEN || !STUDENT_ID || !SCHOOL_ID) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
}

// -------------------------------
// SAFE FETCH (LEVEL 7)
// -------------------------------
async function secureFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        return await res.json();

    } catch (err) {
        console.error("API ERROR:", url, err);
        return null;
    }
}

// -------------------------------
// SAFE RENDER HELPERS
// -------------------------------
function safeGet(id) {
    const el = document.getElementById(id);
    if (!el) console.warn("Missing element:", id);
    return el;
}

// ===============================
// EXAMS
// ===============================
async function fetchExams() {
    const list = safeGet("exams-list");
    if (!list) return;

    const exams = await secureFetch(
        `${API_BASE}/exams?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (exams || []).forEach(e => {
        list.innerHTML += `
            <li>
                📘 ${e.title} (${e.subject})<br>
                📅 ${e.date}
            </li>
        `;
    });
}

// ===============================
// RESULTS
// ===============================
async function fetchResults() {
    const list = safeGet("results-list");
    if (!list) return;

    const results = await secureFetch(
        `${API_BASE}/results?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (results || []).forEach(r => {
        list.innerHTML += `
            <li>
                📊 ${r.exam_title}<br>
                Marks: ${r.marks_obtained}/${r.total_marks}<br>
                Rank: ${r.rank || "-"}
            </li>
        `;
    });
}

// ===============================
// FEES
// ===============================
async function fetchFees() {
    const list = safeGet("fees-list");
    if (!list) return;

    const fees = await secureFetch(
        `${API_BASE}/fees?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (fees || []).forEach(f => {
        list.innerHTML += `
            <li>
                💰 ${f.description}<br>
                Amount: ${f.amount} KES<br>
                Status: ${f.status}
            </li>
        `;
    });
}

// ===============================
// NOTIFICATIONS (LIVE READY)
// ===============================
async function fetchNotifications() {
    const list = safeGet("notifications-list");
    if (!list) return;

    const notifications = await secureFetch(
        `${API_BASE}/notifications?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (notifications || []).forEach(n => {
        list.innerHTML += `
            <li>
                🔔 ${n.title}<br>
                ${n.message}
            </li>
        `;
    });
}

// ===============================
// 🤖 AI TUTOR (LEVEL 7 UPGRADE)
// ===============================
const aiForm = document.getElementById("ai-form");

aiForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = document.getElementById("question").value;
    const list = safeGet("ai-responses");

    if (!question.trim()) return;

    list.innerHTML += `<li>⏳ Thinking...</li>`;

    const data = await secureFetch(
        `${API_BASE}/aiTutor`,
        {
            method: "POST",
            body: JSON.stringify({
                student_id: STUDENT_ID,
                school_id: SCHOOL_ID,
                question
            })
        }
    );

    list.innerHTML += `
        <li>
            🧑 ${question}<br>
            🤖 ${data?.answer || "No response"}
        </li>
    `;

    document.getElementById("question").value = "";
});

// ===============================
// 🚀 SYSTEM BOOT (ENTERPRISE INIT)
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        fetchExams(),
        fetchResults(),
        fetchFees(),
        fetchNotifications()
    ]);
});