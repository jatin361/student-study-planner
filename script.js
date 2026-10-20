const KEY="studyspace-data-v1";
const colors={purple:["#7765e8","#f0edff"],green:["#32a77f","#e4f8f1"],orange:["#d49a2d","#fff4dc"],blue:["#439ce0","#e5f3ff"],pink:["#d86c96","#ffedf3"]};
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const days=n=>{const d=new Date();d.setDate(d.getDate()+n);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const id=p=>p+"-"+Date.now()+"-"+Math.random().toString(16).slice(2,7);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let state={tasks:[],subjects:[]},view="dashboard",toastTimer;
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&Array.isArray(saved.tasks)&&Array.isArray(saved.subjects))state=saved}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notify("Browser could not save your changes.")}}
function notify(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2400)}
function dateLabel(v){return new Date(v+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function subject(id){return state.subjects.find(s=>s.id===id)}
function render(){
 const t=today(),total=state.tasks.length,complete=state.tasks.filter(x=>x.done).length,due=state.tasks.filter(x=>!x.done&&x.due===t).length,rate=total?Math.round(complete/total*100):0;
 $("total").textContent=total;$("completed").textContent=complete;$("due").textContent=due;$("rate").textContent=rate+"%";$("bar").style.width=rate+"%";$("pendingCount").textContent=state.tasks.filter(x=>!x.done).length;
 $("today").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
 const texts={dashboard:["Good to see you!","Here's what's happening with your studies today.","Today's focus","Your upcoming study tasks"],tasks:["My Tasks","Every small task brings you closer to your goals.","All study tasks","Manage your tasks and deadlines"],subjects:["Your Subjects","Organize the topics you're learning.","Tasks by subject","Your study areas at a glance"]}[view];
 $("welcomeTitle").innerHTML=texts[0]+' <span>✦</span>';$("subtitle").textContent=texts[1];$("listTitle").textContent=texts[2];$("listSub").textContent=texts[3];$("viewAll").style.display=view==="tasks"?"none":"inline";
 const sel=$("subject");const prev=sel.value;sel.innerHTML='<option value="">No subject</option>'+state.subjects.map(s=>`<option value="${s.id}">${safe(s.name)}</option>`).join("");if(state.subjects.some(s=>s.id===prev))sel.value=prev;
 let list=[...state.tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due)||({High:0,Medium:1,Low:2}[a.priority]-{High:0,Medium:1,Low:2}[b.priority]));
 if(view==="dashboard")list=list.filter(x=>!x.done).slice(0,5);if(view==="subjects")list=list.filter(x=>x.subject);
 $("tasks").innerHTML=list.map(x=>{const s=subject(x.subject),overdue=!x.done&&x.due<t;return `<div class="task ${x.done?"done":""}"><input class="check" type="checkbox" data-toggle="${x.id}" ${x.done?"checked":""} aria-label="Complete task"><div class="taskbody"><div class="tasktitle">${safe(x.title)}</div><div class="meta">${s?`<span class="chip">${safe(s.name)}</span>`:""}<span class="priority ${x.priority}">${x.priority} priority</span><span>${overdue?"Overdue · ":"Due "}${dateLabel(x.due)}</span></div>${x.notes?`<div class="meta">${safe(x.notes)}</div>`:""}</div><button class="delete" data-delete="${x.id}" aria-label="Delete task">×</button></div>`}).join("");
 $("empty").style.display=list.length?"none":"block";$("empty").querySelector("h3").textContent=view==="subjects"?"No subject tasks yet":"Your planner is a blank page";$("empty").querySelector("p").textContent=view==="subjects"?"Add a task and assign it to a subject.":"Add a task or load the sample plan to get started.";
 $("subjects").innerHTML=state.subjects.length?state.subjects.map(s=>{const c=colors[s.color]||colors.purple,n=state.tasks.filter(x=>x.subject===s.id),done=n.filter(x=>x.done).length;return `<div class="subjectrow"><div class="subjectmark" style="--scolor:${c[0]};--sbg:${c[1]}">${safe(s.name[0].toUpperCase())}</div><div><div class="subjectname">${safe(s.name)}</div><div class="subjectsub">${done} of ${n.length} tasks completed</div></div><span class="subjectnum">${n.length} tasks</span></div>`}).join(""):'<p class="subjectsub">No subjects yet. Use + to add one.</p>';
}
function setView(v){view=v;document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===v));render()}
function samplePlan(){state.subjects=[{id:"sub-web",name:"Web Development",color:"purple"},{id:"sub-net",name:"Computer Networks",color:"blue"},{id:"sub-db",name:"DBMS",color:"green"}];state.tasks=[{id:id("task"),title:"Revise HTML semantic elements",subject:"sub-web",due:days(0),priority:"High",notes:"Review main, section, article and nav.",done:false},{id:id("task"),title:"Practice subnetting questions",subject:"sub-net",due:days(1),priority:"Medium",notes:"",done:false},{id:id("task"),title:"Read normalization notes",subject:"sub-db",due:days(2),priority:"Low",notes:"Focus on 1NF, 2NF and 3NF.",done:false},{id:id("task"),title:"Build a responsive navigation bar",subject:"sub-web",due:days(3),priority:"Medium",notes:"",done:true}];save();render();notify("Sample study plan loaded.")}
$("addTaskBtn").onclick=()=>{$("taskForm").reset();$("dueDate").value=today();$("taskDialog").showModal()};
$("addSubjectBtn").onclick=()=>{$("subjectForm").reset();$("subjectDialog").showModal()};
$("sample").onclick=samplePlan;$("viewAll").onclick=()=>setView("tasks");
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$("taskForm").onsubmit=e=>{e.preventDefault();const title=$("title").value.trim();if(!title)return;state.tasks.push({id:id("task"),title,subject:$("subject").value,due:$("dueDate").value||today(),priority:$("priority").value,notes:$("notes").value.trim(),done:false});save();$("taskDialog").close();render();notify("Study task added!")};
$("subjectForm").onsubmit=e=>{e.preventDefault();const name=$("subjectName").value.trim();if(!name)return;if(state.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){notify("That subject already exists.");return}state.subjects.push({id:id("subject"),name,color:$("subjectColor").value});save();$("subjectDialog").close();render();notify("Subject added!")};
$("tasks").addEventListener("change",e=>{const task=state.tasks.find(x=>x.id===e.target.dataset.toggle);if(!task)return;task.done=e.target.checked;save();render();notify(task.done?"Task completed. Nice work!":"Task marked incomplete.")});
$("tasks").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;state.tasks=state.tasks.filter(x=>x.id!==b.dataset.delete);save();render();notify("Task deleted.")});
render();