const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

// ===============================
// AUTH
// ===============================
const STUDENT_ID = localStorage.getItem("student_id");
const TOKEN = localStorage.getItem("token");
const SCHOOL_ID = localStorage.getItem("school_id");

if (!TOKEN || !STUDENT_ID || !SCHOOL_ID) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
}

// ===============================
// SAFE FETCH
// ===============================
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
            return null;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        return await res.json();

    } catch (err) {
        console.error("API ERROR:", url, err);
        return null;
    }
}

// ===============================
// EXAMS (FIXED)
// ===============================
async function fetchExams() {
    const list = document.getElementById("exams-list");
    if (!list) return;

    const exams = await secureFetch(
        `${API_BASE}/exams?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (exams || []).forEach(e => {
        list.innerHTML += `
            <li>
                📘 ${e.name || "Exam"}<br>
                🏫 Class: ${e.class_id || "-"}
            </li>
        `;
    });
}

// ===============================
// RESULTS (FIXED)
// ===============================
async function fetchResults() {
    const list = document.getElementById("results-list");
    if (!list) return;

    const results = await secureFetch(
        `${API_BASE}/results?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (results || []).forEach(r => {
        const percent =
            r.total_marks
                ? ((r.marks / r.total_marks) * 100).toFixed(1)
                : 0;

        list.innerHTML += `
            <li>
                📊 Subject: ${r.subjects?.name || r.subject_id}<br>
                Marks: ${r.marks}/${r.total_marks}<br>
                Score: ${percent}%
            </li>
        `;
    });
}

// ===============================
// FEES (FIXED)
// ===============================
async function fetchFees() {
    const list = document.getElementById("fees-list");
    if (!list) return;

    const fees = await secureFetch(
        `${API_BASE}/fees?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    if (!Array.isArray(fees)) {
        list.innerHTML = "<li>No fee data</li>";
        return;
    }

    fees.forEach(f => {
        list.innerHTML += `
            <li>
                💰 Paid: ${f.paid_amount || 0} KES<br>
                Total: ${f.total_fee || 0} KES<br>
                Balance: ${(f.total_fee || 0) - (f.paid_amount || 0)}
            </li>
        `;
    });
}

// ===============================
// NOTIFICATIONS (FIXED)
// ===============================
async function fetchNotifications() {
    const list = document.getElementById("notifications-list");
    if (!list) return;

    const notifications = await secureFetch(
        `${API_BASE}/notifications?student_id=${STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (notifications || []).forEach(n => {
        list.innerHTML += `
            <li>
                🔔 ${n.title || "Notice"}<br>
                ${n.message || ""}
            </li>
        `;
    });
}

// ===============================
// AI TUTOR (FIXED ENDPOINT)
// ===============================
document.getElementById("ai-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = document.getElementById("question").value.trim();
    const list = document.getElementById("ai-responses");

    if (!question) return;

    list.innerHTML += `<li>⏳ Thinking...</li>`;

    const data = await secureFetch(
        `${API_BASE}/aiTutor/ask`,
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
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        fetchExams(),
        fetchResults(),
        fetchFees(),
        fetchNotifications()
    ]);
});