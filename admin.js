// ===============================
// CONFIG
// ===============================
const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

if (!localStorage.getItem("school_id")) {
    const schoolId = prompt("Enter your School ID:");
    localStorage.setItem("school_id", schoolId);
}

const SCHOOL_ID = localStorage.getItem("school_id");

// ===============================
// SAFE FETCH CORE
// ===============================
async function safeFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");
        return await res.json();
    } catch (err) {
        console.error("API Error:", url, err);
        return [];
    }
}

// ===============================
// UI HELPERS
// ===============================
function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = msg;
    toast.style.display = "block";
    toast.style.background = type === "error" ? "red" : "green";

    setTimeout(() => toast.style.display = "none", 2500);
}

// ===============================
// ===============================
// 📊 DASHBOARD ENGINE (NEW CORE)
// ===============================
// ===============================

async function getDashboardData() {
    const [students, teachers, fees, exams, results] = await Promise.all([
        safeFetch(`${API_BASE}/students?school_id=${SCHOOL_ID}`),
        safeFetch(`${API_BASE}/teachers?school_id=${SCHOOL_ID}`),
        safeFetch(`${API_BASE}/fees?school_id=${SCHOOL_ID}`),
        safeFetch(`${API_BASE}/exams?school_id=${SCHOOL_ID}`),
        safeFetch(`${API_BASE}/results?school_id=${SCHOOL_ID}`)
    ]);

    return { students, teachers, fees, exams, results };
}

// KPI CALCULATIONS
function calculateKPIs(data) {
    const totalStudents = data.students.length;
    const totalTeachers = data.teachers.length;
    const totalExams = data.exams.length;

    const totalFees = data.fees.reduce(
        (sum, f) => sum + Number(f.paid_amount || 0),
        0
    );

    const passCount = data.results.filter(r => Number(r.marks) >= 50).length;
    const passRate = data.results.length
        ? ((passCount / data.results.length) * 100).toFixed(1)
        : 0;

    return {
        totalStudents,
        totalTeachers,
        totalExams,
        totalFees,
        passRate
    };
}

// MAIN DASHBOARD LOADER
async function loadDashboard() {
    const data = await getDashboardData();
    const kpi = calculateKPIs(data);

    // Update UI (you will connect these IDs in HTML)
    setText("kpi-students", kpi.totalStudents);
    setText("kpi-teachers", kpi.totalTeachers);
    setText("kpi-exams", kpi.totalExams);
    setText("kpi-fees", "KES " + kpi.totalFees);
    setText("kpi-passrate", kpi.passRate + "%");
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// Refresh dashboard manually
async function refreshDashboard() {
    await loadDashboard();
    showToast("Dashboard updated");
}

// ===============================
// STUDENTS (FIXED)
// ===============================
async function addStudent() {
    const name = document.getElementById("student-name").value;
    const class_id = document.getElementById("student-class").value;

    if (!name || !class_id)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: name,
            class_id,
            school_id: SCHOOL_ID
        })
    });

    showToast("Student added successfully");

    document.getElementById("student-name").value = "";
    document.getElementById("student-class").value = "";
}

async function viewStudents() {
    const class_id = document.getElementById("view-student-class").value;
    const list = document.getElementById("students-list");

    if (!class_id) return showToast("Enter class ID", "error");

    list.innerHTML = "Loading...";

    const data = await safeFetch(
        `${API_BASE}/students?school_id=${SCHOOL_ID}&class_id=${class_id}`
    );

    list.innerHTML = data.length
        ? data.map(s => `<div class="item">${s.full_name}</div>`).join("")
        : "<div class='state'>No students found</div>";
}

// ===============================
// TEACHERS
// ===============================
async function addTeacher() {
    const name = document.getElementById("teacher-name").value;
    const subject_id = document.getElementById("teacher-subject").value;

    if (!name || !subject_id)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: name,
            subject_id,
            school_id: SCHOOL_ID
        })
    });

    showToast("Teacher added");

    document.getElementById("teacher-name").value = "";
    document.getElementById("teacher-subject").value = "";
}

async function viewTeachers() {
    const subject_id = document.getElementById("view-teacher-subject").value;
    const list = document.getElementById("teachers-list");

    if (!subject_id) return showToast("Enter subject ID", "error");

    list.innerHTML = "Loading...";

    const data = await safeFetch(
        `${API_BASE}/teachers?school_id=${SCHOOL_ID}&subject_id=${subject_id}`
    );

    list.innerHTML = data.length
        ? data.map(t => `<div class="item">${t.full_name}</div>`).join("")
        : "<div class='state'>No teachers</div>";
}

// ===============================
// EXAMS
// ===============================
async function addExam() {
    const name = document.getElementById("exam-title").value;
    const class_id = document.getElementById("exam-class").value;

    if (!name || !class_id)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            class_id,
            school_id: SCHOOL_ID
        })
    });

    showToast("Exam added");

    document.getElementById("exam-title").value = "";
    document.getElementById("exam-class").value = "";
}

async function viewExams() {
    const class_id = document.getElementById("view-exam-class").value;
    const list = document.getElementById("exams-list");

    if (!class_id) return showToast("Enter class ID", "error");

    list.innerHTML = "Loading...";

    const data = await safeFetch(
        `${API_BASE}/exams?school_id=${SCHOOL_ID}&class_id=${class_id}`
    );

    list.innerHTML = data.length
        ? data.map(e => `<div class="item">${e.name}</div>`).join("")
        : "<div class='state'>No exams</div>";
}

// ===============================
// RESULTS
// ===============================
async function addResult() {
    const student_id = document.getElementById("result-student").value;
    const subject_id = document.getElementById("result-subject").value;
    const marks = document.getElementById("result-marks").value;

    if (!student_id || !subject_id || !marks)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            student_id,
            subject_id,
            marks,
            school_id: SCHOOL_ID
        })
    });

    showToast("Result saved");
}

async function viewResults() {
    const class_id = document.getElementById("view-result-class").value;
    const list = document.getElementById("results-list");

    if (!class_id) return showToast("Enter class ID", "error");

    list.innerHTML = "Loading...";

    const data = await safeFetch(
        `${API_BASE}/results?school_id=${SCHOOL_ID}&class_id=${class_id}`
    );

    list.innerHTML = data.length
        ? data.map(r =>
            `<div class="item">${r.students?.full_name || "Student"} - ${r.marks}</div>`
        ).join("")
        : "<div class='state'>No results</div>";
}

// ===============================
// FEES
// ===============================
async function addFee() {
    const student_id = document.getElementById("fee-student").value;
    const amount = document.getElementById("fee-amount").value;

    if (!student_id || !amount)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/fees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            student_id,
            paid_amount: Number(amount),
            school_id: SCHOOL_ID
        })
    });

    showToast("Fee saved");
}

async function viewFees() {
    const student_id = document.getElementById("view-fee-student").value;
    const list = document.getElementById("fees-list");

    if (!student_id) return showToast("Enter student ID", "error");

    list.innerHTML = "Loading...";

    const data = await safeFetch(
        `${API_BASE}/fees?school_id=${SCHOOL_ID}&student_id=${student_id}`
    );

    list.innerHTML = data.length
        ? data.map(f => `<div class="item">KES ${f.paid_amount}</div>`).join("")
        : "<div class='state'>No fees</div>";
}

// ===============================
// MPESA
// ===============================
async function triggerMpesaPayment() {
    const phone = document.getElementById("mpesa-phone").value;
    const amount = document.getElementById("mpesa-amount").value;

    if (!phone || !amount)
        return showToast("Fill all fields", "error");

    await fetch(`${API_BASE}/mpesa/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            school_id: SCHOOL_ID,
            phone,
            amount: Number(amount)
        })
    });

    showToast("STK Push sent");
}

// ===============================
// INITIAL BOOTSTRAP
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});