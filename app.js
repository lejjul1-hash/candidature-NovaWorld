// =========================
// Config
// =========================
const WEBHOOK = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";
const ROLE_ID = "1446471808743243987"; // role mention
const EXEMPT_IP = "91.174.237.40";     // IP exemptée (pas de cooldown)
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// =========================
// Helpers
// =========================
async function getIP(){
  try{
    const r = await fetch("https://api.ipify.org?format=json");
    if(!r.ok) throw new Error("no ip");
    const j = await r.json();
    return j.ip;
  }catch(e){
    console.warn("Impossible de récupérer IP:", e);
    return "unknown";
  }
}

function now(){ return Date.now(); }

function canSubmit(ip){
  if(ip === EXEMPT_IP) return true;
  const key = `last_submit_${ip}`;
  const t = localStorage.getItem(key);
  if(!t) return true;
  return (now() - Number(t)) > COOLDOWN_MS;
}

function setSubmitted(ip){
  const key = `last_submit_${ip}`;
  localStorage.setItem(key, String(now()));
}

// stock local des candidatures (pour admin)
function storeSubmission(payload){
  const key = "submissions_list";
  let arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.unshift(payload);
  localStorage.setItem(key, JSON.stringify(arr));
}

// =========================
// Form logic (multi-step)
// =========================
document.addEventListener("DOMContentLoaded", ()=>{

  const step1 = document.querySelector('.step[data-step="1"]');
  const step2 = document.querySelector('.step[data-step="2"]');
  const step1Next = document.getElementById('step1-next');
  const step2Back = document.getElementById('step2-back');
  const submitBtn = document.getElementById('submitBtn');
  const statusMsg = document.getElementById('statusMsg');

  step1Next.addEventListener('click', ()=> {
    // basic validation example
    const discord = document.getElementById('q_discord').value.trim();
    const intro = document.getElementById('q_intro').value.trim();
    if(!discord || !intro){
      alert("Remplis au minimum la présentation et ton pseudo Discord.");
      return;
    }
    step1.style.display = "none";
    step2.style.display = "block";
    window.scrollTo({top:0,behavior:'smooth'});
  });

  step2Back.addEventListener('click', ()=>{
    step2.style.display = "none";
    step1.style.display = "block";
  });

  // submit
  submitBtn.addEventListener('click', async ()=>{
    statusMsg.style.color = "#ffd";
    statusMsg.innerText = "Vérification en cours...";
    submitBtn.disabled = true;

    const ip = await getIP();
    if(!canSubmit(ip)){
      const key = `last_submit_${ip}`;
      const t = Number(localStorage.getItem(key) || 0);
      const left = COOLDOWN_MS - (now() - t);
      const hours = Math.ceil(left / (1000*60*60));
      statusMsg.style.color = "#ff6b6b";
      statusMsg.innerText = `Tu as déjà envoyé une candidature récemment. Réessaie dans ~${hours}h.`;
      submitBtn.disabled = false;
      return;
    }

    // gather answers
    const data = {
      intro: document.getElementById('q_intro').value.trim(),
      discord: document.getElementById('q_discord').value.trim(),
      prenom: document.getElementById('q_prenom').value.trim(),
      age: document.getElementById('q_age').value.trim(),
      dispo: document.getElementById('q_dispo').value.trim(),

      category: (document.querySelector('input[name="category"]:checked') || {}).value || "Staff",
      motiv: document.getElementById('q_motiv').value.trim(),
      pourquoi: document.getElementById('q_pourquoi').value.trim(),
      qualites: document.getElementById('q_qualites').value.trim(),
      def: document.getElementById('q_def').value.trim(),
      exp: document.getElementById('q_exp').value.trim(),
      plus: document.getElementById('q_plus').value.trim(),

      ip: ip,
      ts: new Date().toISOString()
    };

    // build embed
    const embed = {
      title: `Nouvelle candidature — ${data.category}`,
      description: `**Candidat:** ${data.discord}\n**Prénom:** ${data.prenom || "—"}\n**Âge:** ${data.age || "—"}`,
      color: 16729344, // red-ish
      fields: [
        { name: "Présentation", value: data.intro || "—" },
        { name: "Disponibilités", value: data.dispo || "—" },
        { name: "Motivations", value: data.motiv || "—" },
        { name: "Pourquoi lui ?", value: data.pourquoi || "—" },
        { name: "Qualités", value: data.qualites || "—" },
        { name: "Définition du rôle", value: data.def || "—" },
        { name: "Expérience", value: data.exp || "—" },
        { name: "Info complémentaire", value: data.plus || "—" },
        { name: "IP", value: data.ip || "—" },
        { name: "Date", value: data.ts }
      ],
      footer: { text: "Système de candidature — Glast" }
    };

    // payload for webhook: ping role + embed
    const payload = {
      content: `<@&${ROLE_ID}> Nouvelle candidature pour **${data.category}** — ${data.discord}`,
      embeds: [embed]
    };

    // Try to send to webhook
    try{
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if(!res.ok){
        // response not ok — likely CORS or other issue
        throw new Error(`Webhook error: ${res.status}`);
      }

      // success
      setSubmitted(ip);
      storeSubmission({data, sentAt: new Date().toISOString()});
      statusMsg.style.color = "#8af78a";
      statusMsg.innerText = "Candidature envoyée ✅ Merci — tu peux renvoyer dans 24h (sauf IP exemptée).";
      submitBtn.disabled = true;

    }catch(err){
      console.error(err);
      // still store locally so admin can access later, but warn user
      storeSubmission({data, sentAt: new Date().toISOString(), webhook_error: String(err)});
      setSubmitted(ip);
      statusMsg.style.color = "#ffd080";
      statusMsg.innerText = "La candidature est sauvegardée localement. L'envoi au webhook a échoué (CORS ou réseau). Contacte un admin.";
      submitBtn.disabled = true;
    }
  });

  // initialize admin button
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdmin = document.getElementById('closeAdmin');
  const adminContent = document.getElementById('adminContent');

  adminBtn.addEventListener('click', ()=>{
    const code = prompt("Code admin ?");
    if(code === "Glastontop1234"){
      // show modal and list
      adminModal.setAttribute('aria-hidden','false');
      renderAdmin();
    } else alert("Code incorrect");
  });

  closeAdmin.addEventListener('click', ()=>{
    adminModal.setAttribute('aria-hidden','true');
  });

  function renderAdmin(){
    const arr = JSON.parse(localStorage.getItem("submissions_list") || "[]");
    if(arr.length === 0){
      adminContent.innerHTML = "<p>Aucune candidature enregistrée.</p>";
      return;
    }
    let html = "<div style='display:flex;flex-direction:column;gap:10px'>";
    arr.forEach((s,i)=>{
      const d = s.data || {};
      html += `<div style="padding:10px;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,0.02),transparent);border:1px solid rgba(255,255,255,0.03)">
        <b>${i+1}. ${d.discord || "—"}</b> — ${d.category || "—"}<br>
        <small>${s.sentAt || "—"} • IP: ${d.ip || "—"}</small>
        <p style="margin:8px 0 0"><b>Présentation:</b> ${escapeHtml(d.intro||"—")}</p>
        <p style="margin:4px 0 0"><b>Motivations:</b> ${escapeHtml(d.motiv||"—")}</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-secondary" onclick='copyToClipboard(${i})'>Copier texte</button>
          <button class="btn-secondary" onclick='deleteSubmission(${i})'>Supprimer</button>
        </div>
      </div>`;
    });
    html += "</div>";
    adminContent.innerHTML = html;
    // attach global helpers to window so buttons work
    window.copyToClipboard = (index) => {
      const arr = JSON.parse(localStorage.getItem("submissions_list") || "[]");
      const s = arr[index];
      navigator.clipboard.writeText(JSON.stringify(s, null, 2));
      alert("Candidature copiée");
    };
    window.deleteSubmission = (index) => {
      let arr = JSON.parse(localStorage.getItem("submissions_list") || "[]");
      if(!confirm("Supprimer cette candidature ?")) return;
      arr.splice(index,1);
      localStorage.setItem("submissions_list", JSON.stringify(arr));
      renderAdmin();
    };
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }

});
