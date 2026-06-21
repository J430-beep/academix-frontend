// ===============================
// CONFIG
// ===============================
const API_BASE =
"https://academix-backend-pe8o.onrender.com/api";

const TOKEN =
localStorage.getItem("token");


// ===============================
// AUTH CHECK
// ===============================
function requireAuth(){

if(!TOKEN){

window.location.href="login.html";

return false;

}

return true;

}



// ===============================
// SAFE FETCH
// ===============================
async function safeFetch(url, options={}){


try{


options.headers={

"Content-Type":"application/json",

"Authorization":
"Bearer "+TOKEN,

...(options.headers || {})

};



const res =
await fetch(url,options);



if(res.status===401){

localStorage.clear();

window.location.href="login.html";

return [];

}



const data =
await res.json();



if(!res.ok){

throw new Error(
data.error || "Request failed"
);

}



return data;



}catch(err){


console.error(
"API ERROR:",
err
);


return [];

}


}





// ===============================
// DASHBOARD
// ===============================

async function fetchTotalStudents(){

const data =
await safeFetch(
`${API_BASE}/students`
);


setText(
"total-students",
"Total Students: "+data.length
);


}





async function fetchTotalTeachers(){

const data =
await safeFetch(
`${API_BASE}/teachers`
);


setText(
"total-teachers",
"Total Teachers: "+data.length
);


}





async function fetchTotalExams(){

const data =
await safeFetch(
`${API_BASE}/exams`
);


setText(
"total-exams",
"Total Exams: "+data.length
);


}





async function fetchTotalClasses(){

const data =
await safeFetch(
`${API_BASE}/classes`
);


setText(
"total-classes",
"Total Classes: "+data.length
);


}





function setText(id,value){

const el =
document.getElementById(id);


if(el)
el.innerText=value;

}





// ===============================
// NOTIFICATIONS
// ===============================

async function fetchRecentNotifications(){


const list =
document.getElementById(
"notifications-list"
);


if(!list)return;



const data =
await safeFetch(
`${API_BASE}/notifications`
);



list.innerHTML="";



(data||[])
.slice(0,5)
.forEach(n=>{


list.innerHTML += `

<li>
🔔 ${n.title}: ${n.message}
</li>

`;

});


}





// ===============================
// AI TUTOR
// ===============================

async function askAI(e){

e.preventDefault();



const input =
document.getElementById(
"question"
);


const list =
document.getElementById(
"ai-responses"
);



const question =
input.value.trim();



if(!question)return;



list.innerHTML +=
`<li>
🧑 ${question}
</li>`;




const data =
await safeFetch(
`${API_BASE}/aiTutor/ask`,
{

method:"POST",

body:JSON.stringify({

question

})

}

);




list.innerHTML +=
`

<li>
🤖 ${data.answer || "No response"}
</li>

`;



input.value="";


}





// ===============================
// START
// ===============================

async function initDashboard(){


if(!requireAuth())
return;



await Promise.all([

fetchTotalStudents(),

fetchTotalTeachers(),

fetchTotalExams(),

fetchTotalClasses(),

fetchRecentNotifications()

]);


}





window.addEventListener(
"DOMContentLoaded",
initDashboard
);



document
.getElementById("ai-form")
?.addEventListener(
"submit",
askAI
);