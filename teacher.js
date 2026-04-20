// ===============================
// 🚀 LEVEL 7 SAAS TEACHER PORTAL
// ===============================

const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

// 🔐 AUTH (SaaS Ready)
const TEACHER_ID = localStorage.getItem("teacher_id");
const TOKEN = localStorage.getItem("token");
const SCHOOL_ID = localStorage.getItem("school_id");

// -------------------------------
// AUTH GUARD
// -------------------------------
if (!TOKEN || !TEACHER_ID || !SCHOOL_ID) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
}

// -------------------------------
// SAFE FETCH (ENTERPRISE)
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
// SAFE DOM
// -------------------------------
function safeGet(id) {
    const el = document.getElementById(id);
    if (!el) console.warn("Missing:", id);
    return el;
}

// ===============================
// EXAMS
// ===============================
async function fetchExams() {
    const list = safeGet('exams-list');
    if (!list) return;

    const exams = await secureFetch(
        `${API_BASE}/exams?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = '';

    (exams || []).forEach(e => {
        list.innerHTML += `
            <li>
                📘 ${e.title} (${e.subject})<br>
                Class: ${e.class} | Date: ${e.date}
                <br>
                <button onclick="deleteExam('${e.id}')">Delete</button>
            </li>
        `;
    });
}

async function addExam() {
    const title = document.getElementById('exam-title').value;
    const className = document.getElementById('exam-class').value;
    const subject = document.getElementById('exam-subject').value;
    const date = document.getElementById('exam-date').value;
    const syllabus = document.getElementById('exam-syllabus').value;

    await secureFetch(`${API_BASE}/exams`, {
        method: 'POST',
        body: JSON.stringify({
            teacher_id: TEACHER_ID,
            school_id: SCHOOL_ID,
            title,
            class: className,
            subject,
            date,
            syllabus
        })
    });

    document.getElementById('exam-title').value = '';
    document.getElementById('exam-class').value = '';
    document.getElementById('exam-subject').value = '';
    document.getElementById('exam-date').value = '';
    document.getElementById('exam-syllabus').value = '';

    fetchExams();
}

async function deleteExam(id) {
    await secureFetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
    fetchExams();
}

function showAddExamForm() {
    const form = safeGet('add-exam-form');
    if (!form) return;
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// ===============================
// RESULTS
// ===============================
async function fetchResults() {
    const list = safeGet('results-list');
    if (!list) return;

    const results = await secureFetch(
        `${API_BASE}/results?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = '';

    (results || []).forEach(r => {
        list.innerHTML += `
            <li>
                👨‍🎓 ${r.student_name}<br>
                ${r.exam_title}: ${r.marks_obtained}/${r.total_marks}<br>
                Rank: ${r.rank || "-"}
            </li>
        `;
    });
}

// ===============================
// ANALYTICS (AI POWERED)
// ===============================
async function fetchClassAnalytics() {
    const classId = prompt('Enter class ID:');
    if (!classId) return;

    const data = await secureFetch(
        `${API_BASE}/aiAnalytics/class/${classId}?school_id=${SCHOOL_ID}`
    );

    safeGet('analytics-results').innerText =
        JSON.stringify(data || {}, null, 2);
}

async function fetchSubjectAnalytics() {
    const subject = prompt('Enter subject:');
    if (!subject) return;

    const data = await secureFetch(
        `${API_BASE}/aiAnalytics/subject/${subject}?school_id=${SCHOOL_ID}`
    );

    safeGet('analytics-results').innerText =
        JSON.stringify(data || {}, null, 2);
}

// ===============================
// NOTIFICATIONS
// ===============================
async function fetchNotifications() {
    const list = safeGet('notifications-list');
    if (!list) return;

    const notifications = await secureFetch(
        `${API_BASE}/notifications?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = '';

    (notifications || []).forEach(n => {
        list.innerHTML += `
            <li>
                🔔 ${n.title}<br>
                ${n.message} (${n.category})
            </li>
        `;
    });
}

async function addNotification() {
    const user_id = document.getElementById('notification-user').value;
    const title = document.getElementById('notification-title').value;
    const message = document.getElementById('notification-message').value;
    const category = document.getElementById('notification-category').value;

    await secureFetch(`${API_BASE}/notifications`, {
        method: 'POST',
        body: JSON.stringify({
            user_id,
            school_id: SCHOOL_ID,
            title,
            message,
            category
        })
    });

    document.getElementById('notification-user').value = '';
    document.getElementById('notification-title').value = '';
    document.getElementById('notification-message').value = '';

    fetchNotifications();
}

function showAddNotificationForm() {
    const form = safeGet('add-notification-form');
    if (!form) return;
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// ===============================
// 🚀 INIT (LEVEL 7)
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        fetchExams(),
        fetchResults(),
        fetchNotifications()
    ]);
});