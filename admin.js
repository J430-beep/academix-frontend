// ===============================
// CONFIG
// ===============================
const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ===============================
// SECURE FETCH
// ===============================
async function safeFetch(url, options = {}) {

    options.headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        ...(options.headers || {})
    };

    try {

        const res = await fetch(url, options);
        const data = await res.json();

        if(!res.ok){
            throw new Error(data.error || "Request failed");
        }

        return data;

    } catch(err){

        console.log(err);
        showToast(err.message,"error");
        return [];

    }
}


// ===============================
// TOAST
// ===============================
function showToast(msg,type="success"){

const toast=document.getElementById("toast");

if(!toast)return;

toast.innerText=msg;

toast.style.display="block";

toast.style.background =
type==="error" ? "red":"green";


setTimeout(()=>{
toast.style.display="none";
},2500);

}




function setText(id,value){

const el=document.getElementById(id);

if(el) el.innerText=value;

}




// ===============================
// DASHBOARD
// ===============================
async function loadDashboard(){

const [
students,
teachers,
fees,
exams,
results
]=await Promise.all([

safeFetch(`${API_BASE}/students`),
safeFetch(`${API_BASE}/teachers`),
safeFetch(`${API_BASE}/fees`),
safeFetch(`${API_BASE}/exams`),
safeFetch(`${API_BASE}/results`)

]);


setText("kpi-students",students.length);
setText("kpi-teachers",teachers.length);
setText("kpi-exams",exams.length);


let money = fees.reduce(
(a,b)=>a+Number(b.paid_amount || 0),0
);


setText(
"kpi-fees",
"KES "+money
);


let pass =
results.filter(r=>Number(r.marks)>=50).length;


let rate =
results.length ?
((pass/results.length)*100).toFixed(1)
:0;


setText(
"kpi-passrate",
rate+"%"
);

}





// ===============================
// STUDENTS
// ===============================
async function addStudent(){

let full_name =
document.getElementById("student-name").value;

let class_id =
document.getElementById("student-class").value;


if(!full_name || !class_id)
return showToast("Fill all fields","error");


await safeFetch(
`${API_BASE}/students`,
{
method:"POST",
body:JSON.stringify({
full_name,
class_id
})
});


showToast("Student added");

loadDashboard();

}





async function viewStudents(){

let class_id =
document.getElementById("view-student-class").value;


let list =
document.getElementById("students-list");


list.innerHTML="Loading...";


let students =
await safeFetch(`${API_BASE}/students`);


let data =
students.filter(
s=>s.class_id==class_id
);



list.innerHTML =
data.length ?

data.map(s=>
`
<div class="item">
${s.full_name}
</div>
`
).join("")

:

"No students";

}







// ===============================
// TEACHERS
// ===============================
async function addTeacher(){

let full_name =
document.getElementById("teacher-name").value;

let subject_id =
document.getElementById("teacher-subject").value;

let phone =
document.getElementById("teacher-phone").value;



await safeFetch(
`${API_BASE}/teachers`,
{
method:"POST",
body:JSON.stringify({
full_name,
subject_id,
phone
})
});


showToast("Teacher added");

loadDashboard();

}





async function viewTeachers(){

let list =
document.getElementById("teachers-list");


list.innerHTML="Loading...";


let teachers =
await safeFetch(`${API_BASE}/teachers`);


list.innerHTML =
teachers.length ?

teachers.map(t=>
`
<div class="item">
${t.full_name}
<br>
${t.phone || ""}
</div>
`
).join("")

:

"No teachers";

}







// ===============================
// FEES
// ===============================
async function addFee(){

let student_id =
document.getElementById("fee-student").value;


let amount =
document.getElementById("fee-amount").value;



await safeFetch(
`${API_BASE}/fees`,
{
method:"POST",
body:JSON.stringify({

student_id,

total_fee:Number(amount),

paid_amount:Number(amount)

})
});


showToast("Fee saved");

loadDashboard();

}






async function viewFees(){

let list =
document.getElementById("fees-list");


list.innerHTML="Loading...";


let fees =
await safeFetch(`${API_BASE}/fees`);



list.innerHTML =
fees.length ?

fees.map(f=>
`
<div class="item">
${f.students?.full_name || "Student"}
<br>
KES ${f.paid_amount}
</div>
`
).join("")

:

"No fees";

}







// ===============================
// EXAMS
// ===============================
async function addExam(){

let name =
document.getElementById("exam-title").value;


let class_id =
document.getElementById("exam-class").value;

let subject_id =
document.getElementById("exam-subject").value;

let exam_date =
document.getElementById("exam-date").value;



await safeFetch(
`${API_BASE}/exams`,
{
method:"POST",
body:JSON.stringify({

name,
class_id,
subject_id,
exam_date

})
});


showToast("Exam added");

loadDashboard();

}





async function viewExams(){

let list =
document.getElementById("exams-list");


list.innerHTML="Loading...";


let exams =
await safeFetch(`${API_BASE}/exams`);


list.innerHTML =
exams.length ?

exams.map(e=>
`
<div class="item">
${e.name}
<br>
${e.exam_date || ""}
</div>
`
).join("")

:

"No exams";

}








// ===============================
// RESULTS
// ===============================
async function addResult(){


let student_id =
document.getElementById("result-student").value;


let exam_id =
document.getElementById("result-exam").value;


let subject_id =
document.getElementById("result-subject").value;


let marks =
document.getElementById("result-marks").value;



await safeFetch(
`${API_BASE}/results`,
{
method:"POST",
body:JSON.stringify({

student_id,
exam_id,
subject_id,
marks,
total_marks:100

})
});


showToast("Result saved");

loadDashboard();

}





async function viewResults(){

let list =
document.getElementById("results-list");


list.innerHTML="Loading...";


let results =
await safeFetch(`${API_BASE}/results`);



list.innerHTML =
results.length ?

results.map(r=>
`
<div class="item">

${r.students?.full_name || "Student"}

<br>

${r.subjects?.name || ""}

<br>

${r.marks}/${r.total_marks}

Grade: ${r.grade}

</div>
`
).join("")

:

"No results";

}







// ===============================
// AI ANALYTICS
// ===============================
async function fetchClassAnalytics(){

let id =
document.getElementById("ai-class").value;


let box =
document.getElementById("analytics-results");


box.innerHTML="Loading...";


let data =
await safeFetch(
`${API_BASE}/analytics/class/${id}`
);


box.innerHTML =
JSON.stringify(data,null,2);

}




async function fetchSubjectAnalytics(){

let id =
document.getElementById("ai-subject").value;


let box =
document.getElementById("analytics-results");


box.innerHTML="Loading...";


let data =
await safeFetch(
`${API_BASE}/analytics/subject/${id}`
);


box.innerHTML =
JSON.stringify(data,null,2);

}





// ===============================
// START
// ===============================
window.addEventListener(
"DOMContentLoaded",
()=>{

loadDashboard();

}
);