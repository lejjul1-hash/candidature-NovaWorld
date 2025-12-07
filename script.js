// ===============================
// CONFIG
// ===============================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";
const ROLE_ID = "1446471808743243987";
const ADMIN_CODE = "Glastontop1234";
const IP_WHITELIST = "91.174.237.40";

let step = 1;
showStep(step);

// ===============================
// PAGE SUIVANTE / PRECEDENTE
// ===============================
function showStep(n) {
    document.getElementById("step1").style.display = n === 1 ? "block" : "none";
    document.getElementById("step2").style.display = n === 2 ? "block" : "none";
}

function nextStep() { step = 2; showStep(step); }
function prevStep() { step = 1; showStep(step); }

// ===============================
// GET IP
// ===============================
async function getIP() {
    try {
        const r = await fetch("https://api.ipify.org?format=json");
        const j = await r.json();
        return j.ip;
    } catch {
        return "IP-ERR";
    }
}

// ===============================
// COOLDOWN 24H
// ===============================
async function canSend(ip) {
    if (ip === IP_WHITELIST) return true;

    const last = localStorage.getItem("lastSent");
    if (!last) return true;

    return Date.now() - last >= 86400000;
}

function registerCooldown(ip) {
    if (ip !== IP_WHITELIST) localStorage.setItem("lastSent", Date.now());
}

// ===============================
// ENVOYER
// ===============================
async function sendForm() {
    const ip = await getIP();
    const allowed = await canSend(ip);

    if (!allowed) {
        document.getElementById("status").innerHTML = "⛔ Vous devez attendre 24h avant de refaire une candidature.";
        return;
    }

    // Form Step 1
    const irl = document.getElementById("irl").value;
    const discord = document.getElementById("discord").value;
    const prenom = document.getElementById("prenom").value;
    const age = document.getElementById("age").value;
    const dispos = document.getElementById("dispos").value;

    // Form Step 2
    const categorie = document.getElementById("categorie").value;
    const motivations = document.getElementById("motivations").value;
    const why = document.getElementById("why").value;
    const qualites = document.getElementById("qualites").value;
    const definition = document.getElementById("definition").value;
    const experience = document.getElementById("experience").value;
    const extra = document.getElementById("extra").value;

    // EMBED (IP retirée comme demandé)
    const payload = {
        content: `<@&${ROLE_ID}>`,
        embeds: [
            {
                title: "📩 Nouvelle Candidature Staff",
                color: 0xff0000,
                fields: [
                    { name: "👤 Discord", value: discord || "Non renseigné" },
                    {
                        name: "📄 Présentation IRL",
                        value: `• **Prénom :** ${prenom}\n• **Âge :** ${age}\n• **Présentation :** ${irl}`
                    },
                    { name: "🕒 Disponibilités", value: dispos },
                    { name: "📌 Catégorie", value: categorie },
                    { name: "🔥 Motivations", value: motivations },
                    { name: "❓ Pourquoi vous ?", value: why },
                    { name: "⭐ Qualités", value: qualites },
                    { name: "🛡 Définition du rôle", value: definition },
                    { name: "📚 Expérience", value: experience },
                    { name: "➕ Ajouts", value: extra || "Aucun" }
                ],
                footer: { text: "Système de candidature | Glast" }
            }
        ]
    };

    await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // Save cooldown & local
    registerCooldown(ip);

    saveCandidateLocal({
        discord,
        ip,
        categorie,
        motivations
    });

    document.getElementById("status").innerHTML = "✅ Candidature envoyée avec succès !";

    setTimeout(() => location.reload(), 1500);
}

// ===============================
// SAVE CANDIDATE
// ===============================
function saveCandidateLocal(c) {
    const list = JSON.parse(localStorage.getItem("candidatures") || "[]");
    list.push(c);
    localStorage.setItem("candidatures", JSON.stringify(list));
}

// ===============================
// ADMIN SYSTEM (en bas comme tu veux)
// ===============================
function openAdmin() {
    const code = prompt("Code Admin :");
    if (code !== ADMIN_CODE) return alert("Code invalide");

    const panel = document.getElementById("adminPanel");
    panel.style.display = "block";

    const list = JSON.parse(localStorage.getItem("candidatures") || "[]");

    let html = `
        <h2>📂 Candidatures enregistrées</h2>
        <button onclick="clearAll()" class="btn-send" style="width:100%;margin-top:15px;">
            🗑️ Clear Candidatures
        </button>
        <br><br>
    `;

    if (list.length === 0) {
        html += "<p>Aucune candidature trouvée.</p>";
    }

    list.forEach(c => {
        html += `
            <div class="admin-entry">
                <b>${c.discord}</b><br>
                IP : ${c.ip}<br>
                Categorie : ${c.categorie}<br>
                Motivations : ${c.motivations}<br>
            </div>
        `;
    });

    panel.innerHTML = html;
}

// CLEAR BTN
function clearAll() {
    if (!confirm("Voulez-vous vraiment tout supprimer ?")) return;
    localStorage.removeItem("candidatures");
    document.getElementById("adminPanel").innerHTML +=
        "<p style='margin-top:10px;color:#ff4444;font-weight:700'>Toutes les candidatures ont été supprimées.</p>";
}
