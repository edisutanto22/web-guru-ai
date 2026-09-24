const $ = (id) => document.getElementById(id);

const defaultStudents = [
  {nis:"12001", nama:"Ahmad Fajar", kelas:"XII-A"},
  {nis:"12002", nama:"Budi Santoso", kelas:"XII-A"},
  {nis:"12003", nama:"Citra Lestari", kelas:"XII-B"},
  {nis:"12004", nama:"Dimas Pratama", kelas:"XII-B"}
];

let students = JSON.parse(localStorage.getItem("wga_students")) || defaultStudents;
let attendance = JSON.parse(localStorage.getItem("wga_attendance")) || {};
let scores = JSON.parse(localStorage.getItem("wga_scores")) || [];

function saveAll(){
  localStorage.setItem("wga_students", JSON.stringify(students));
  localStorage.setItem("wga_attendance", JSON.stringify(attendance));
  localStorage.setItem("wga_scores", JSON.stringify(scores));
}

function todayKey(){ return new Date().toISOString().slice(0,10); }

function renderStudents(filter=""){
  const q=filter.toLowerCase();
  const list=students.filter(s=>(s.nis+" "+s.nama+" "+s.kelas).toLowerCase().includes(q));
  $("studentTable").innerHTML=list.map((s,i)=>`<tr><td>${i+1}</td><td>${s.nis}</td><td>${s.nama}</td><td>${s.kelas}</td><td><button class="delete" onclick="deleteStudent('${s.nis}')">Hapus</button></td></tr>`).join("") || `<tr><td colspan="5">Belum ada data siswa.</td></tr>`;
  $("scoreStudent").innerHTML='<option value="">Pilih siswa</option>'+students.map(s=>`<option value="${s.nis}">${s.nama} — ${s.kelas}</option>`).join("");
}

function deleteStudent(nis){
  if(!confirm("Hapus data siswa ini?")) return;
  students=students.filter(s=>s.nis!==nis);
  delete attendance[nis];
  scores=scores.filter(x=>x.nis!==nis);
  saveAll(); renderAll();
}

function renderAttendance(){
  const key=todayKey();
  let counts={Hadir:0,Izin:0,Sakit:0,Alpa:0};
  $("attendanceTable").innerHTML=students.map((s,i)=>{
    const status=attendance[key]?.[s.nis] || "Hadir";
    counts[status]++;
    return `<tr><td>${i+1}</td><td>${s.nis}</td><td>${s.nama}</td><td>${s.kelas}</td><td><select class="status-select" onchange="setAttendance('${s.nis}',this.value)"><option ${status==="Hadir"?"selected":""}>Hadir</option><option ${status==="Izin"?"selected":""}>Izin</option><option ${status==="Sakit"?"selected":""}>Sakit</option><option ${status==="Alpa"?"selected":""}>Alpa</option></select></td></tr>`;
  }).join("") || `<tr><td colspan="5">Tambahkan siswa terlebih dahulu.</td></tr>`;
  $("countHadir").textContent=counts.Hadir;$("countIzin").textContent=counts.Izin;$("countSakit").textContent=counts.Sakit;$("countAlpa").textContent=counts.Alpa;
  $("statHadir").textContent=counts.Hadir;
}

function setAttendance(nis,status){
  const key=todayKey();
  attendance[key]=attendance[key]||{};
  attendance[key][nis]=status;
  saveAll(); renderAttendance();
}

function renderScores(){
  $("scoreTable").innerHTML=scores.map((x,i)=>{
    const s=students.find(v=>v.nis===x.nis);
    return `<tr><td>${i+1}</td><td>${s?s.nama:"Siswa dihapus"}</td><td>${x.assessment}</td><td><strong>${x.score}</strong></td><td><button class="delete" onclick="deleteScore(${i})">Hapus</button></td></tr>`;
  }).join("") || `<tr><td colspan="5">Belum ada nilai.</td></tr>`;
  $("statNilai").textContent=scores.length;
}

function deleteScore(i){ scores.splice(i,1); saveAll(); renderScores(); }

function renderStats(){ $("statSiswa").textContent=students.length; }

function renderAll(){ renderStudents($("studentSearch").value); renderAttendance(); renderScores(); renderStats(); }

function openPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
  $(page).classList.add("active");
  const button=document.querySelector(`.nav-item[data-page="${page}"]`);
  if(button) button.classList.add("active");
  const titles={dashboard:["Dashboard","Pusat administrasi guru digital"],siswa:["Data Siswa","Kelola data peserta didik"],absensi:["Absensi","Catat kehadiran siswa"],nilai:["Penilaian","Input dan rekap nilai"],ai:["AI Guru","Alat bantu pembelajaran"]};
  $("pageTitle").textContent=titles[page][0]; $("pageSubtitle").textContent=titles[page][1];
  $("sidebar").classList.remove("open");
}

document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>openPage(el.dataset.page)));
$("menuBtn").addEventListener("click",()=> $("sidebar").classList.toggle("open"));
$("studentSearch").addEventListener("input",e=>renderStudents(e.target.value));

$("studentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const nis=$("nis").value.trim(), nama=$("nama").value.trim(), kelas=$("kelas").value.trim();
  if(students.some(s=>s.nis===nis)){alert("NIS sudah terdaftar.");return;}
  students.push({nis,nama,kelas}); saveAll(); e.target.reset(); renderAll(); alert("Data siswa berhasil ditambahkan.");
});

$("scoreForm").addEventListener("submit",e=>{
  e.preventDefault();
  scores.push({nis:$("scoreStudent").value,score:Number($("score").value),assessment:$("assessment").value.trim()});
  saveAll(); e.target.reset(); renderScores(); alert("Nilai berhasil disimpan.");
});

$("generateBtn").addEventListener("click",()=>{
  const t=$("topicInput").value.trim()||"Informatika";
  $("aiOutput").innerHTML=`<strong>Contoh ide soal: ${t}</strong><ol><li>Jelaskan pengertian dan konsep utama ${t}.</li><li>Berikan contoh penerapan ${t} dalam kehidupan sehari-hari.</li><li>Analisis manfaat dan tantangan penerapan ${t}.</li></ol>`;
});

$("summaryBtn").addEventListener("click",()=>{
  const t=$("summaryInput").value.trim()||"materi pembelajaran";
  $("summaryOutput").innerHTML=`<strong>Kerangka rangkuman: ${t}</strong><br>1. Pengertian<br>2. Konsep/ciri utama<br>3. Contoh penerapan<br>4. Manfaat<br>5. Tantangan<br>6. Kesimpulan`;
});

$("today").textContent=new Intl.DateTimeFormat("id-ID",{dateStyle:"full"}).format(new Date());
renderAll();
