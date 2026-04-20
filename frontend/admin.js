// ===============================
// CONFIG
// ===============================
const API_BASE = 'https://academix-backend-pe8o.onrender.com/api';

if (!localStorage.getItem("school_id")) {
    const schoolId = prompt("Enter your School ID:");
    localStorage.setItem("school_id", schoolId);
}

const SCHOOL_ID = localStorage.getItem("school_id");

async function safeFetch(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        return await res.json();

    } catch (err) {
        console.error("API Error:", url, err);
        return []; // ALWAYS return empty array so UI doesn't crash
    }
}

// ===============================
// UI STATE CONTROL (FIX)
// ===============================
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.innerText = message;
    toast.style.display = "block";

    toast.style.background =
        type === "success" ? "green" :
        type === "error" ? "red" :
        "#333";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

function setLoading(btn, state) {
    if (!btn) return;

    btn.disabled = state;
    btn.innerText = state ? "Loading..." : "Submit";
}

// ===============================
// LEVEL 3: GLOBAL EDIT STATE
// ===============================
let editingId = null;
let editingType = null;

// ===============================
// SHOW / HIDE FORMS
// ===============================
function toggleForm(id) {
    const form = document.getElementById(id);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showAddStudentForm() {
    toggleForm('add-student-form');
}

function showAddTeacherForm() {
    toggleForm('add-teacher-form');
}

function showAddExamForm() {
    toggleForm('add-exam-form');
}

function showAddNotificationForm() {
    toggleForm('add-notification-form');
}


// ===============================
// STUDENTS
// ===============================
async function fetchStudents() {
    try {
        const students = await safeFetch(`${API_BASE}/students?school_id=${SCHOOL_ID}`);

        const list = document.getElementById('students-list');
        list.innerHTML = '';

        students.forEach(s => {
            const li = document.createElement('li');

            li.innerHTML = `
                ${s.full_name} (Class: ${s.classes?.name || 'N/A'})
                <button onclick="editStudent('${s.id}', '${s.full_name}', '${s.class_id || ''}', '${s.photo_url || ''}')">Edit</button>
                <button onclick="deleteStudent('${s.id}')">Delete</button>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("fetchStudents error:", err);
    }
}

async function addStudent() {
             const btn = event.target;

    const full_name = document.getElementById('student-name').value.trim();
    const class_id = document.getElementById('student-class').value;
    const photo_url = document.getElementById('student-image').value.trim();

    if (!full_name || !class_id) {
        return showToast("Please fill required fields", "error");
    }

   const payload = { full_name, class_id, photo_url, school_id: SCHOOL_ID };

    try {
        setLoading(btn, true);

        const url = editingType === "student"
            ? `${API_BASE}/students/${editingId}?school_id=${SCHOOL_ID}`
            : `${API_BASE}/students`;

        const method = editingType === "student" ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        editingId = null;
        editingType = null;

        document.getElementById('student-name').value = "";
        document.getElementById('student-class').value = "";
        document.getElementById('student-image').value = "";

        await fetchStudents();

        showToast("Student saved successfully");

    } catch (err) {
        console.error(err);
        showToast("Failed to save student", "error");

    } finally {
        setLoading(btn, false);
    }
}

async function deleteStudent(id) {
    await fetch(`${API_BASE}/students/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchStudents();
}

function editStudent(id, name, class_id, photo_url) {
    document.getElementById('student-name').value = name;
    document.getElementById('student-class').value = class_id;
    document.getElementById('student-image').value = photo_url;

    editingId = id;
    editingType = "student";

    showAddStudentForm();
}

function searchStudents() {
    const value = document.getElementById('search-students').value.toLowerCase();
    const items = document.querySelectorAll('#students-list li');

    items.forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
}


// ===============================
// TEACHERS
// ===============================
async function fetchTeachers() {
    try {
        const teachers = await safeFetch(`${API_BASE}/teachers?school_id=${SCHOOL_ID}`);

        const list = document.getElementById('teachers-list');
        list.innerHTML = '';

        teachers.forEach(t => {

            const subject =
                t.subjects?.[0]?.name ||
                t.subjects?.name ||
                "N/A";

            const li = document.createElement('li');

            li.innerHTML = `
                ${t.full_name} (Subject: ${subject})
                <button onclick="deleteTeacher('${t.id}')">Delete</button>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("fetchTeachers error:", err);
    }
}

async function addTeacher() {
    const full_name = document.getElementById('teacher-name').value;
    const subject_id = document.getElementById('teacher-subject').value;

    try {
        await fetch(`${API_BASE}/teachers?school_id=${SCHOOL_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ full_name, subject_id, school_id: SCHOOL_ID })
        });

        document.getElementById('teacher-name').value = '';
        document.getElementById('teacher-subject').value = '';

        fetchTeachers();

    } catch (err) {
        console.error(err);
    }
}

async function deleteTeacher(id) {
    await fetch(`${API_BASE}/teachers/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchTeachers();
}


// ===============================
// EXAMS
// ===============================
async function fetchExams() {
    try {
        const exams = await safeFetch(`${API_BASE}/exams?school_id=${SCHOOL_ID}`);

        const list = document.getElementById('exams-list');
        list.innerHTML = '';

        exams.forEach(e => {

            const className =
                e.classes?.name ||
                e.classes?.[0]?.name ||
                "N/A";

            const subjectName =
                e.subjects?.name ||
                e.subjects?.[0]?.name ||
                "N/A";

            const li = document.createElement('li');

            li.innerHTML = `
                <div style="padding:8px;border:1px solid #ddd;margin:5px;">
                    <b>${e.name}</b><br>
                    Class: ${className} <br>
                    Subject: ${subjectName} <br>
                    Date: ${e.exam_date || 'N/A'} <br><br>
                    <button onclick="deleteExam('${e.id}')">Delete</button>
                </div>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("fetchExams error:", err);
    }
}

async function addExam() {
    const name = document.getElementById('exam-title').value;
    const class_id = document.getElementById('exam-class').value;
    const subject_id = document.getElementById('exam-subject').value;
    const exam_date = document.getElementById('exam-date').value;
    const syllabus = document.getElementById('exam-syllabus').value;

    try {
        await fetch(`${API_BASE}/exams?school_id=${SCHOOL_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name, class_id, subject_id, exam_date, syllabus, school_id: SCHOOL_ID })
        });

        document.getElementById('exam-title').value = '';
        document.getElementById('exam-class').value = '';
        document.getElementById('exam-subject').value = '';
        document.getElementById('exam-date').value = '';
        document.getElementById('exam-syllabus').value = '';

        fetchExams();

    } catch (err) {
        console.error(err);
    }
}

async function deleteExam(id) {
    await fetch(`${API_BASE}/exams/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchExams();
}

// ===============================
// PROFESSIONAL RESULTS SYSTEM
// ===============================

function getGrade(percentage) {
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "E";
}

async function fetchResults() {
    try {
        const res = await fetch(`${API_BASE}/results?school_id=${SCHOOL_ID}`);
        const results = await res.json();
        const list = document.getElementById('results-list');
        list.innerHTML = '';

        results.forEach(r => {

            const marks = Number(r.marks) || 0;
            const total = Number(r.total_marks) || 100;

            const percentage = total > 0 ? (marks / total) * 100 : 0;

            const grade = getGrade(percentage);

            const student =
                r.students?.full_name ||
                "N/A";

            const subject =
                r.subjects?.name ||
                r.subjects?.[0]?.name ||
                "N/A";

            const li = document.createElement('li');

            li.innerHTML = `
                <div style="padding:12px;border:1px solid #ddd;margin:8px;border-radius:8px;background:#fafafa;">
                    <b>Student:</b> ${student} <br>
                    <b>Subject:</b> ${subject} <br>
                    <b>Marks:</b> ${marks}/${total} <br>
                    <b>Percentage:</b> ${percentage.toFixed(1)}% <br>
                    <b>Grade:</b> <span style="color:green;font-weight:bold">${grade}</span>
                    <br><br>
                    <button onclick="deleteResult('${r.id}')">Delete</button>
                </div>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("fetchResults error:", err);
    }
}

async function addResult() {
    const student_id = document.getElementById('result-student').value;
    const exam_id = document.getElementById('result-exam').value;
    const subject_id = document.getElementById('result-subject').value;
    const marks = document.getElementById('result-marks').value;
    const total_marks = document.getElementById('result-total').value;

    if (!student_id || !exam_id || !subject_id || !marks || !total_marks) {
        return alert("Please fill all fields");
    }

    try {
        const res = await fetch(`${API_BASE}/results?school_id=${SCHOOL_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
    student_id,
    exam_id,
    subject_id,
    marks: Number(marks),
    total_marks: Number(total_marks),
    school_id: SCHOOL_ID
})
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.error || "Failed to save result");
        }

        alert("Result saved successfully");

        fetchResults();
        loadDropdowns();

    } catch (err) {
        console.error("addResult error:", err);
        alert("Network error");
    }
}

async function deleteResult(id) {
    await fetch(`${API_BASE}/results/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchResults();
}


// ===============================
// PROFESSIONAL FEES SYSTEM
// ===============================

async function fetchFees() {
    try {
        const res = await fetch(`${API_BASE}/fees?school_id=${SCHOOL_ID}`);
        const fees = await res.json();

        const list = document.getElementById('fees-list');
        list.innerHTML = '';

        fees.forEach(f => {

            const total = f.total_fee || 0;
            const paid = f.paid_amount || 0;
            const balance = total - paid;

            const status =
                balance <= 0 ? "PAID" :
                paid > 0 ? "PARTIAL" : "UNPAID";

            const li = document.createElement('li');
            li.innerHTML = `
                <div style="padding:12px;border-radius:8px;border:1px solid #ddd;margin:8px;background:#f9f9ff;">
                    <b>Student:</b> ${f.students?.full_name || 'N/A'} <br>
                    <b>Total Fee:</b> KES ${total} <br>
                    <b>Paid:</b> KES ${paid} <br>
                    <b>Balance:</b> KES ${balance} <br>
                    <b>Status:</b> <span style="color:blue;font-weight:bold">${status}</span>
                    <br><br>
                    <button onclick="deleteFee('${f.id}')">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Fees fetch error:", err);
    }
}

async function addFee() {
    const student_id = document.getElementById('fee-student').value;
    const total_fee = document.getElementById('fee-total').value;
    const paid_amount = document.getElementById('fee-amount').value;

    if (!student_id || !total_fee || !paid_amount) {
        return alert("All fields required");
    }

    await fetch(`${API_BASE}/fees?school_id=${SCHOOL_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
    school_id: SCHOOL_ID,
    student_id,
    total_fee: Number(total_fee),
    paid_amount: Number(paid_amount)
})
    });

    alert("Fee saved");
    fetchFees();
}

async function triggerMpesaPayment() {
    const phone = document.getElementById("mpesa-phone").value;
    const amount = document.getElementById("mpesa-amount").value;
    const student_id = document.getElementById("fee-student").value;

    if (!phone || !amount || !student_id) {
        showToast("Fill all fields", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/mpesa/stkpush`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                school_id: SCHOOL_ID,
                phone,
                amount: Number(amount)
            })
        });

        const data = await res.json();

        console.log("STK RESPONSE:", data);

        if (!res.ok) {
            return showToast(data.error || "Payment failed", "error");
        }

        // 🔥 IMPORTANT: store checkout request for tracking
        localStorage.setItem("last_checkout", data.CheckoutRequestID);

        showToast("📲 STK Push sent. Awaiting confirmation...");

        // start polling payment status
        pollPaymentStatus(data.CheckoutRequestID, student_id);

    } catch (err) {
        console.error(err);
        showToast("Network error", "error");
    }
}

async function pollPaymentStatus(checkout_id, student_id) {
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;

        const res = await fetch(`${API_BASE}/mpesa/status/${checkout_id}`);
        const data = await res.json();

        console.log("PAYMENT STATUS:", data);

        if (data.status === "SUCCESS") {
            clearInterval(interval);

            showToast("💰 Payment successful!");

            // refresh finance dashboard
            fetchFees();
            fetchResults();

        } else if (data.status === "FAILED") {
            clearInterval(interval);
            showToast("❌ Payment failed", "error");
        }

        // stop after 20 attempts (~2 min)
        if (attempts > 20) {
            clearInterval(interval);
            showToast("⌛ Payment pending timeout", "error");
        }

    }, 6000);
}

async function deleteFee(id) {
    await fetch(`${API_BASE}/fees/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchFees();
}

// ===============================
// FINANCE LEVEL 3 DASHBOARD
// ===============================

async function fetchMpesaPayments() {
    try {
        const res = await fetch(`${API_BASE}/mpesa/payments?school_id=${SCHOOL_ID}`);
        const payments = await res.json();

        const list = document.getElementById("mpesa-payments-list");
        list.innerHTML = "";

        payments.forEach(p => {

            const statusColor =
                p.status === "SUCCESS" ? "green" :
                p.status === "FAILED" ? "red" :
                "orange";

            const li = document.createElement("li");

            li.innerHTML = `
                <div style="padding:12px;border:1px solid #ddd;margin:8px;border-radius:10px;">
                    
                    <b>Phone:</b> ${p.phone || "N/A"} <br>
                    <b>Amount:</b> KES ${p.amount} <br>
                    <b>Status:</b> <span style="color:${statusColor};font-weight:bold">${p.status}</span> <br>
                    <b>Receipt:</b> ${p.receipt || "Pending"} <br>

                    <br>

                    <button onclick="retryMpesa('${p.phone}', '${p.amount}')">
                        Retry Payment
                    </button>
                </div>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("MPESA fetch error:", err);
    }
}

async function loadClasses() {
    try {
        const res = await fetch(`${API_BASE}/classes?school_id=${SCHOOL_ID}`);
        const classes = await res.json();

        const safeClasses = Array.isArray(classes) ? classes : [];

        const studentClass = document.getElementById("student-class");
        const examClass = document.getElementById("exam-class");

        if (studentClass) {
            studentClass.innerHTML = `<option value="">Select Class</option>`;
            safeClasses.forEach(c => {
                studentClass.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }

        if (examClass) {
            examClass.innerHTML = `<option value="">Select Class</option>`;
            safeClasses.forEach(c => {
                examClass.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
        }

    } catch (err) {
        console.error("loadClasses error:", err);
    }
}


// ===============================
// NOTIFICATIONS
// ===============================
async function fetchNotifications() {
    try {
        const res = await fetch(`${API_BASE}/notifications?school_id=${SCHOOL_ID}`)
        const notifications = await res.json();

        const list = document.getElementById('notifications-list');
        list.innerHTML = '';

        notifications.forEach(n => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${n.title}: ${n.message} (${n.category})
                <button onclick="deleteNotification('${n.id}')">Delete</button>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
}

async function addNotification() {
    const user_id = document.getElementById('notification-user').value;
    const title = document.getElementById('notification-title').value;
    const message = document.getElementById('notification-message').value;
    const category = document.getElementById('notification-category').value;

    try {
        await fetch(`${API_BASE}/notifications?school_id=${SCHOOL_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
    school_id: SCHOOL_ID,
    user_id,
    title,
    message,
    category
})
        });

        document.getElementById('notification-user').value = '';
        document.getElementById('notification-title').value = '';
        document.getElementById('notification-message').value = '';

        fetchNotifications();

    } catch (err) {
        console.error(err);
    }
}

async function deleteNotification(id) {
    await fetch(`${API_BASE}/notifications/${id}?school_id=${SCHOOL_ID}`, { method: 'DELETE' });
    fetchNotifications();
}


// ===============================
// AI ANALYTICS
// ===============================
async function fetchClassAnalytics() {
    const classId = prompt('Enter class ID:');
    if (!classId) return alert("Class ID required");

    try {
        const res = await fetch(`${API_BASE}/aiAnalytics/class/${classId}?school_id=${SCHOOL_ID}`)

        if (!res.ok) {
            throw new Error("Server error");
        }

        const data = await res.json();

        document.getElementById('analytics-results').innerText =
            JSON.stringify(data, null, 2);

    } catch (err) {
        console.error(err);
        alert("Failed to load analytics");
    }
}

async function fetchSubjectAnalytics() {
    const subjectId = prompt('Enter subject ID:');
    if (!subjectId) return alert("Subject ID required");

    try {
        const res = await fetch(`${API_BASE}/aiAnalytics/subject/${subjectId}?school_id=${SCHOOL_ID}`)

        if (!res.ok) {
            throw new Error("Server error");
        }

        const data = await res.json();

        document.getElementById('analytics-results').innerText =
            JSON.stringify(data, null, 2);

    } catch (err) {
        console.error(err);
        alert("Failed to load analytics");
    }
}

async function askAI() {
    const questionInput = document.getElementById("ai-question");
    const box = document.getElementById("chat-box");
    const studentId = document.getElementById("ai-student")?.value;

    // SAFETY CHECK
    if (!questionInput) {
        alert("AI input box missing");
        return;
    }

    const question = questionInput.value.trim();

    if (!question) {
        box.innerHTML = "Write a question first";
        return;
    }

    if (!studentId || studentId === "") {
    console.error("Invalid student ID:", studentId);
    alert("⚠️ Select a valid student first from Results section");
    return;
}

    box.innerHTML += `
        <div style="text-align:right;margin:5px;">
            <span style="background:#25D366;color:white;padding:8px 12px;border-radius:10px;display:inline-block;">
                ${question}
            </span>
        </div>
    `;

    box.innerHTML += `<div>Thinking... 🤖</div>`;

    try {
        const res = await fetch(`${API_BASE}/aiTutor/ask?school_id=${SCHOOL_ID}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: studentId,
                question: question
            })
        });

        const data = await res.json();
        console.log("AI RESPONSE:", data);

        // remove "Thinking..."
        const thinking = box.querySelector("div:last-child");
        if (thinking) thinking.remove();

        if (!res.ok) {
            box.innerHTML += `<div style="color:red;">${data.error || "Server error"}</div>`;
            return;
        }

        box.innerHTML += `
            <div style="text-align:left;margin:5px;">
                <span style="background:#eee;padding:8px 12px;border-radius:10px;display:inline-block;">
                    ${data.answer}
                </span>
            </div>
        `;

        box.scrollTop = box.scrollHeight;

    } catch (err) {
        console.error("AI ERROR:", err);
        box.innerHTML += "Network error";
    }
}

async function loadWeakAI() {
    const student_id = document.getElementById("result-student")?.value;

    const res = await fetch(`${API_BASE}/aiAnalytics/student/${student_id}/weak-ai?school_id=${SCHOOL_ID}`)
    const data = await res.json();

    const box = document.getElementById("weak-ai-results");

    box.innerHTML = `
        <h3>Weak Subjects</h3>
        <ul>
            ${data.weakSubjects.map(s => `
                <li>${s.subject} - ${s.average.toFixed(1)}%</li>
            `).join('')}
        </ul>
        <p><b>Advice:</b></p>
        <ul>
            ${data.advice.map(a => `<li>${a}</li>`).join('')}
        </ul>
    `;
}

async function getRevisionPlan(studentId) {
    const res = await fetch(`${API_BASE}/aiAnalytics/student/${studentId}/performance-ai?school_id=${SCHOOL_ID}`);
    const data = await res.json();

    const weak = data.analysis.filter(s => s.status === "Weak");

    const box = document.getElementById("weak-ai-results");

    box.innerHTML = `
        <h3>📚 Revision Plan</h3>
        <p>Focus on these subjects:</p>
        <ul>
            ${weak.map(s => `<li>${s.subject} (${s.average.toFixed(1)}%)</li>`).join('')}
        </ul>
    `;
}

async function loadDropdowns() {
    try {
        // ================= STUDENTS =================
        const studentsRes = await fetch(`${API_BASE}/students?school_id=${SCHOOL_ID}`);
        const students = await studentsRes.json();

        const studentSelect = document.getElementById('result-student');
        const feeStudentSelect = document.getElementById('fee-student');
        const aiStudentSelect = document.getElementById('ai-student');

        const safeStudents = Array.isArray(students) ? students : [];

        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Select Student</option>';
            safeStudents.forEach(s => {
                studentSelect.innerHTML += `<option value="${s.id}">${s.full_name}</option>`;
            });
        }

        if (feeStudentSelect) {
            feeStudentSelect.innerHTML = '<option value="">Select Student</option>';
            safeStudents.forEach(s => {
                feeStudentSelect.innerHTML += `<option value="${s.id}">${s.full_name}</option>`;
            });
        }

        if (aiStudentSelect) {
            aiStudentSelect.innerHTML = '<option value="">Select Student</option>';
            safeStudents.forEach(s => {
                aiStudentSelect.innerHTML += `<option value="${s.id}">${s.full_name}</option>`;
            });
        }


        // ================= EXAMS =================
        const examsRes = await fetch(`${API_BASE}/exams?school_id=${SCHOOL_ID}`);
        const exams = await examsRes.json();

        const examSelect = document.getElementById('result-exam');
        const safeExams = Array.isArray(exams) ? exams : [];

        if (examSelect) {
            examSelect.innerHTML = '<option value="">Select Exam</option>';
            safeExams.forEach(e => {
                examSelect.innerHTML += `<option value="${e.id}">${e.name}</option>`;
            });
        }


        // ================= SUBJECTS =================
        const subjectSelect = document.getElementById('result-subject');

        try {
            const subjectsRes = await fetch(`${API_BASE}/subjects?school_id=${SCHOOL_ID}`);
            const subjects = await subjectsRes.json();

            const safeSubjects = Array.isArray(subjects) ? subjects : [];

            if (subjectSelect) {
                subjectSelect.innerHTML = '<option value="">Select Subject</option>';
                safeSubjects.forEach(s => {
                    subjectSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
                });
            }

        } catch (err) {
            console.warn("Subjects endpoint missing or broken");
        }

    } catch (err) {
        console.error("Dropdown loading failed:", err);
    }
}

// ===============================
// INITIAL LOAD
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
    try {
        fetchStudents();
        fetchTeachers();
        fetchExams();
        fetchNotifications();
        fetchResults();
        fetchFees();

        await loadDropdowns();
        await loadClasses();

    } catch (err) {
        console.error("Page init error:", err);
    }
});