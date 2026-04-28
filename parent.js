// ===============================
// CONFIG
// ===============================
const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

const SCHOOL_ID = localStorage.getItem("school_id");
const TOKEN = localStorage.getItem("token");

if (!TOKEN || !SCHOOL_ID) {
    alert("Please login first");
    window.location.href = "login.html";
}

// ===============================
// STATE
// ===============================
let CURRENT_STUDENT_ID = null;
let NOTIF_COUNT = 0;

// ===============================
// SAFE FETCH (LEVEL 3)
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

        const data = await res.json();
        return data;

    } catch (err) {
        console.error("API ERROR:", url, err);
        return null;
    }
}

// ===============================
// LOAD CHILDREN
// ===============================
async function loadChildren() {
    const select = document.getElementById("child-selector");

    const data = await secureFetch(
        `${API_BASE}/parent/students?school_id=${SCHOOL_ID}`
    );

    select.innerHTML = `<option value="">Select Child</option>`;

    (data || []).forEach(child => {
        select.innerHTML += `
            <option value="${child.id}">
                ${child.full_name}
            </option>
        `;
    });

    select.addEventListener("change", () => {
        CURRENT_STUDENT_ID = select.value;
        if (CURRENT_STUDENT_ID) loadAll();
    });
}

// ===============================
// LOAD ALL DATA
// ===============================
function loadAll() {
    loadResults();
    loadFees();
    loadExams();
    loadNotifications();
}

// ===============================
// RESULTS
// ===============================
async function loadResults() {
    if (!CURRENT_STUDENT_ID) return;

    const list = document.getElementById("results-list");

    const data = await secureFetch(
        `${API_BASE}/parent/results?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (data || []).forEach(r => {
        list.innerHTML += `
            <li>📘 ${r.subject_name} - ${r.marks}/${r.total_marks}</li>
        `;
    });
}

// ===============================
// FEES
// ===============================
async function loadFees() {
    if (!CURRENT_STUDENT_ID) return;

    const list = document.getElementById("fees-list");

    const data = await secureFetch(
        `${API_BASE}/parent/fees?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    if (!data) return;

    const balance = (data.total_fee || 0) - (data.paid_amount || 0);

    list.innerHTML = `
        <li>
            Total: ${data.total_fee} <br>
            Paid: ${data.paid_amount} <br>
            Balance: ${balance}
        </li>
    `;
}

// ===============================
// EXAMS
// ===============================
async function loadExams() {
    if (!CURRENT_STUDENT_ID) return;

    const list = document.getElementById("exams-list");

    const data = await secureFetch(
        `${API_BASE}/parent/exams?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (data || []).forEach(e => {
        list.innerHTML += `<li>📘 ${e.name}</li>`;
    });
}

// ===============================
// NOTIFICATIONS (LIVE STYLE)
// ===============================
async function loadNotifications() {
    if (!CURRENT_STUDENT_ID) return;

    const list = document.getElementById("notifications-list");
    const badge = document.getElementById("notifBadge");

    const data = await secureFetch(
        `${API_BASE}/parent/notifications?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    NOTIF_COUNT = (data || []).length;
    badge.innerText = NOTIF_COUNT;

    (data || []).forEach(n => {
        list.innerHTML += `
            <li>🔔 ${n.title}: ${n.message}</li>
        `;
    });
}

// ===============================
// AI TUTOR
// ===============================
document.getElementById("ai-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!CURRENT_STUDENT_ID) {
        alert("Select a child first");
        return;
    }

    const question = document.getElementById("question").value;
    const list = document.getElementById("ai-responses");

    list.innerHTML += `<li>⏳ Thinking...</li>`;

    const data = await secureFetch(
        `${API_BASE}/aiTutor/ask?school_id=${SCHOOL_ID}`,
        {
            method: "POST",
            body: JSON.stringify({
                student_id: CURRENT_STUDENT_ID,
                question
            })
        }
    );

    list.innerHTML += `
        <li>
            🧑 ${question} <br>
            🤖 ${data?.answer || "No response"}
        </li>
    `;
});

// ===============================
// AUTO REFRESH (LEVEL 3 FEATURE)
// ===============================
setInterval(() => {
    if (CURRENT_STUDENT_ID) {
        loadNotifications();
    }
}, 15000); // every 15 seconds

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    loadChildren();
});