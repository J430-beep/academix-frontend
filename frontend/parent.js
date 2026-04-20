// ===============================
// CONFIG (PRODUCTION SAFE)
// ===============================
const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

const SCHOOL_ID = localStorage.getItem("school_id");
const TOKEN = localStorage.getItem("token");

// 🔐 AUTH CHECK
if (!TOKEN || !SCHOOL_ID) {
    alert("Please login first");
    window.location.href = "login.html";
}

// ===============================
// 🏢 LEVEL 7 SAAS LAYER (ADDED)
// ===============================
const TENANT = {
    schoolId: SCHOOL_ID,
    plan: localStorage.getItem("plan") || "basic"
};

async function checkSubscription() {
    try {
        const res = await fetch(`${API_BASE}/saas/subscription/check`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        const data = await res.json();

        if (!data.active) {
            alert("Subscription expired. Please renew to continue.");
            window.location.href = "billing.html";
        }
    } catch (err) {
        console.error("Subscription check failed:", err);
    }
}

// Feature control (SaaS)
const Features = {
    aiTutor: true,
    feesModule: true,
    examsModule: true,
    analytics: true
};

function canUse(feature) {
    return Features[feature] === true;
}

// ===============================
// SECURE FETCH (UPGRADED)
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
            return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        return await res.json();

    } catch (err) {
        console.error("API ERROR:", url, err);
        return null;
    }
}

// ===============================
// GET CHILDREN
// ===============================
let CURRENT_STUDENT_ID = null;

async function loadChildren() {
    const data = await secureFetch(
        `${API_BASE}/parent/students?school_id=${SCHOOL_ID}`
    );

    const select = document.getElementById("child-selector");
    if (!select) return;

    select.innerHTML = '<option value="">Select Child</option>';

    (data || []).forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.full_name}</option>`;
    });

    select.addEventListener("change", () => {
        CURRENT_STUDENT_ID = select.value;
        initChildDashboard();
    });
}

// ===============================
// CHILD DASHBOARD
// ===============================
async function initChildDashboard() {
    if (!CURRENT_STUDENT_ID) return;

    await Promise.all([
        loadResults(),
        loadFees(),
        loadExams(),
        loadNotifications()
    ]);
}

// ===============================
// RESULTS
// ===============================
async function loadResults() {
    const list = document.getElementById("results-list");
    if (!list || !CURRENT_STUDENT_ID) return;

    const data = await secureFetch(
        `${API_BASE}/parent/results?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (data || []).forEach(r => {
        list.innerHTML += `
            <li>
                📘 ${r.subject_name || r.subject_id}<br>
                Marks: ${r.marks || 0}/${r.total_marks || 100}
            </li>
        `;
    });
}

// ===============================
// FEES
// ===============================
async function loadFees() {
    const list = document.getElementById("fees-list");
    if (!list || !CURRENT_STUDENT_ID) return;

    const data = await secureFetch(
        `${API_BASE}/parent/fees?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    if (!data) return;

    const balance = (data.total_fee || 0) - (data.paid_amount || 0);

    list.innerHTML = `
        <li>
            💰 Total: ${data.total_fee || 0}<br>
            Paid: ${data.paid_amount || 0}<br>
            Balance: ${balance}
        </li>
    `;
}

// ===============================
// EXAMS
// ===============================
async function loadExams() {
    const list = document.getElementById("exams-list");
    if (!list || !CURRENT_STUDENT_ID) return;

    const data = await secureFetch(
        `${API_BASE}/parent/exams?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (data || []).forEach(e => {
        list.innerHTML += `<li>📘 ${e.name}</li>`;
    });
}

// ===============================
// NOTIFICATIONS
// ===============================
async function loadNotifications() {
    const list = document.getElementById("notifications-list");
    if (!list || !CURRENT_STUDENT_ID) return;

    const data = await secureFetch(
        `${API_BASE}/parent/notifications?student_id=${CURRENT_STUDENT_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (data || []).forEach(n => {
        list.innerHTML += `
            <li>🔔 ${n.title}: ${n.message}</li>
        `;
    });
}

// ===============================
// 🤖 AI TUTOR
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
            🧑 ${question}<br>
            🤖 ${data?.answer || "No response"}
        </li>
    `;
});

// ===============================
// 🚀 LEVEL 7 SAAS BOOT
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    await checkSubscription();
    await loadChildren();
});