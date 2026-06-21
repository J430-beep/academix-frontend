const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

// ===============================
// AUTH
// ===============================
const TEACHER_ID = localStorage.getItem("teacher_id");
const TOKEN = localStorage.getItem("token");
const SCHOOL_ID = localStorage.getItem("school_id");

if (!TOKEN || !TEACHER_ID || !SCHOOL_ID) {
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
// SAFE DOM
// ===============================
function safeGet(id) {
    const el = document.getElementById(id);
    if (!el) console.warn("Missing element:", id);
    return el;
}

// ===============================
// EXAMS (FIXED)
// ===============================
async function fetchExams() {
    const list = safeGet("exams-list");
    if (!list) return;

    const exams = await secureFetch(
        `${API_BASE}/exams?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (exams || []).forEach(e => {
        list.innerHTML += `
            <li>
                📘 ${e.name || e.title}<br>
                🏫 Class: ${e.class_id || e.class || "-"}<br>
                📅 Date: ${e.exam_date || e.date || "-"}
                <br>
                <button onclick="deleteExam('${e.id}')">Delete</button>
            </li>
        `;
    });
}

// ===============================
// ADD EXAM (FIXED)
// ===============================
async function addExam() {
    const name = document.getElementById("exam-title").value.trim();
    const class_id = document.getElementById("exam-class").value.trim();
    const subject_id = document.getElementById("exam-subject").value.trim();
    const exam_date = document.getElementById("exam-date").value;
    const syllabus = document.getElementById("exam-syllabus").value;

    if (!name || !class_id || !subject_id || !exam_date) {
        alert("Please fill all required fields");
        return;
    }

    await secureFetch(`${API_BASE}/exams`, {
        method: "POST",
        body: JSON.stringify({
            teacher_id: TEACHER_ID,
            school_id: SCHOOL_ID,
            name,
            class_id,
            subject_id,
            exam_date,
            syllabus
        })
    });

    fetchExams();
}

// ===============================
// DELETE EXAM
// ===============================
async function deleteExam(id) {
    if (!id) return;

    await secureFetch(`${API_BASE}/exams/${id}`, {
        method: "DELETE"
    });

    fetchExams();
}

// ===============================
// RESULTS (FIXED)
// ===============================
async function fetchResults() {
    const list = safeGet("results-list");
    if (!list) return;

    const results = await secureFetch(
        `${API_BASE}/results?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
    );

    list.innerHTML = "";

    (results || []).forEach(r => {
        list.innerHTML += `
            <li>
                👨‍🎓 ${r.student_name || "Student"}<br>
                📘 ${r.exam_name || r.exam_title || "-"}<br>
                📊 ${r.marks}/${r.total_marks || 100}
            </li>
        `;
    });
}

// ===============================
// ANALYTICS (SAFER)
// ===============================
async function fetchClassAnalytics() {
    const classId = prompt("Enter class ID:");
    if (!classId) return;

    const data = await secureFetch(
        `${API_BASE}/analytics/class/${classId}?school_id=${SCHOOL_ID}`
    );

    safeGet("analytics-results").innerText =
        JSON.stringify(data || {}, null, 2);
}

async function fetchSubjectAnalytics() {
    const subject = prompt("Enter subject ID:");
    if (!subject) return;

    const data = await secureFetch(
        `${API_BASE}/analytics/subject/${subject}?school_id=${SCHOOL_ID}`
    );

    safeGet("analytics-results").innerText =
        JSON.stringify(data || {}, null, 2);
}

// ===============================
// NOTIFICATIONS (FIXED)
// ===============================
async function fetchNotifications() {
    const list = safeGet("notifications-list");
    if (!list) return;

    const notifications = await secureFetch(
        `${API_BASE}/notifications?teacher_id=${TEACHER_ID}&school_id=${SCHOOL_ID}`
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
// ADD NOTIFICATION
// ===============================
async function addNotification() {
    const user_id = document.getElementById("notification-user").value.trim();
    const title = document.getElementById("notification-title").value.trim();
    const message = document.getElementById("notification-message").value.trim();
    const category = document.getElementById("notification-category").value;

    if (!user_id || !title || !message) {
        alert("Fill all fields");
        return;
    }

    await secureFetch(`${API_BASE}/notifications`, {
        method: "POST",
        body: JSON.stringify({
            user_id,
            school_id: SCHOOL_ID,
            title,
            message,
            category
        })
    });

    fetchNotifications();
}

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        fetchExams(),
        fetchResults(),
        fetchNotifications()
    ]);
});