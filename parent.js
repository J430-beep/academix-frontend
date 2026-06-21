// ===============================
// CONFIG (PRODUCTION SAFE)
// ===============================
const API_BASE = "https://academix-backend-pe8o.onrender.com/api";

const TOKEN = localStorage.getItem("token");
const SCHOOL_ID = localStorage.getItem("school_id");
const ROLE = localStorage.getItem("role");


// ===============================
// AUTH CHECK
// ===============================
if (!TOKEN || ROLE !== "parent") {
    alert("Please login as parent");
    window.location.href = "login.html";
}


// ===============================
// SECURE FETCH
// ===============================
async function secureFetch(url, options = {}) {

    try {

        const res = await fetch(url, {

            ...options,

            headers: {

                "Content-Type":"application/json",

                "Authorization":"Bearer " + TOKEN,

                ...(options.headers || {})

            }

        });


        const data = await res.json();


        if(!res.ok){

            throw new Error(
                data.error || "Request failed"
            );

        }


        return data;


    } catch(err){

        console.error(
            "API ERROR:",
            err
        );

        showMessage(err.message);

        return null;

    }

}



// ===============================
// MESSAGE
// ===============================
function showMessage(msg){

    console.log(msg);

}



// ===============================
// CHILD
// ===============================
let CURRENT_STUDENT_ID = null;



async function loadChildren(){


    const select =
    document.getElementById("child-selector");


    if(!select) return;



    const data =
    await secureFetch(
        `${API_BASE}/parents/my-children`
    );



    select.innerHTML =
    `<option value="">Select Child</option>`;


    if(!Array.isArray(data)){

        console.error(
            "Invalid children response",
            data
        );

        return;

    }



    data.forEach(child=>{


        select.innerHTML += `

        <option value="${child.id}">

        ${child.full_name}

        </option>

        `;


    });




    select.onchange = ()=>{


        CURRENT_STUDENT_ID =
        select.value;


        loadChildData();

    };

}




// ===============================
// LOAD CHILD DATA
// ===============================
async function loadChildData(){


    if(!CURRENT_STUDENT_ID)
        return;



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
async function loadResults(){


const list =
document.getElementById("results-list");


if(!list) return;



const data =
await secureFetch(

`${API_BASE}/results/student/${CURRENT_STUDENT_ID}`

);



list.innerHTML="";



(data || []).forEach(r=>{


list.innerHTML += `

<li>

📘 ${r.subjects?.name || "Subject"}

<br>

Marks:
${r.marks}/${r.total_marks}

<br>

Grade:
${r.grade || "-"}

</li>

`;

});


}




// ===============================
// FEES
// ===============================
async function loadFees(){


const list =
document.getElementById("fees-list");


if(!list) return;



const data =
await secureFetch(

`${API_BASE}/fees/student/${CURRENT_STUDENT_ID}`

);



if(!data)
return;



const fee =
Array.isArray(data)
? data[0]
: data;



const total =
Number(fee?.total_fee || 0);



const paid =
Number(fee?.paid_amount || 0);



list.innerHTML = `

<li>

💰 Total:
${total}

<br>

Paid:
${paid}

<br>

Balance:
${total-paid}

</li>

`;

}




// ===============================
// EXAMS
// ===============================
async function loadExams(){


const list =
document.getElementById("exams-list");


if(!list)return;



const data =
await secureFetch(

`${API_BASE}/exams`

);



list.innerHTML="";



(data || []).forEach(e=>{


list.innerHTML += `

<li>

📘 ${e.name}

</li>

`;

});


}





// ===============================
// NOTIFICATIONS
// ===============================
async function loadNotifications(){


const list =
document.getElementById("notifications-list");


if(!list)return;



const data =
await secureFetch(

`${API_BASE}/notifications`

);



list.innerHTML="";



(data || []).forEach(n=>{


list.innerHTML += `

<li>

🔔 ${n.title}

<br>

${n.message}

</li>

`;

});


}




// ===============================
// AI TUTOR
// ===============================
document
.getElementById("ai-form")
?.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



if(!CURRENT_STUDENT_ID){

alert("Select child first");

return;

}



const input =
document.getElementById("question");


const list =
document.getElementById("ai-responses");



const question =
input.value.trim();



if(!question)return;



list.innerHTML += `

<li>

🧑 ${question}

</li>

`;



const data =
await secureFetch(

`${API_BASE}/aiTutor/ask`,

{

method:"POST",

body:JSON.stringify({

student_id:
CURRENT_STUDENT_ID,

question

})

}

);




list.innerHTML += `

<li>

🤖

${data?.answer || "No answer"}

</li>

`;



input.value="";


});





// ===============================
// START
// ===============================
window.addEventListener(
"DOMContentLoaded",
()=>{

loadChildren();

});