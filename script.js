const WEBHOOK = "https://discord.com/api/webhooks/1467270026703667443/i2U5bavQbJkEVnYrRmzfAM5uY8xapPd0oLKCeP38pjB1Ht7vsTJYIOLdo7YsZCsDijY7";
const ROLE_ID = "1464357296334442680";
const ADMIN_CODE = "GTlifetontop1234";
const WHITELIST_IP = "";

// PAGE SYSTEM
function nextStep(){ step1.style.display="none"; step2.style.display="block"; }
function prevStep(){ step1.style.display="block"; step2.style.display="none"; }

// GET IP
async function getIP() {
  return await fetch("https://api.ipify.org").then(r=>r.text());
}

// SEND FORM
async function sendForm() {
    const ip = await getIP();

    // 24H CHECK
    if (ip !== WHITELIST_IP) {
        const last = localStorage.getItem("lastSubmit");
        if (last && Date.now() - last < 86400000) {
            status.innerHTML = "⛔ Vous devez attendre 24h avant de refaire une candidature.";
            return;
        }
    }

const posteFinal =
    poste.value === "Autre" && autrePoste.value.trim() !== ""
        ? autrePoste.value
        : poste.value;

const data = {
    irl: irl.value,
    discord: discord.value,
    prenom: prenom.value,
    age: age.value,
    dispos: dispos.value,
    poste: posteFinal,
    motivations: motivations.value,
    why: why.value,
    qualites: qualites.value,
    definition: definition.value,
    experience: experience.value,
    extra: extra.value
};

// EMBED COMPLET
const payload = {
    content: `<@&${ROLE_ID}>`,
    embeds: [{
        title: "📥 Nouvelle Candidature Staff",
        color: 0xff0000,
        description: `Une nouvelle candidature vient d'être envoyée pour le poste **${data.poste}**.`,
        fields: [
            {
                name: "👤 Pseudo Discord",
                value: data.discord || "Non renseigné",
                inline: true
            },
            {
                name: "📌 Poste demandé",
                value: data.poste || "Non renseigné",
                inline: true
            },
            {
                name: "📄 Présentation IRL",
                value:
`**Prénom :** ${data.prenom}
**Âge :** ${data.age}

**Présentation :**
${data.irl || "Non renseignée"}`
            },
            {
                name: "🕒 Disponibilités",
                value: data.dispos || "Non renseigné"
            },
            {
                name: "🔥 Motivations",
                value: data.motivations || "Non renseigné"
            },
            {
                name: "❓ Pourquoi lui ?",
                value: data.why || "Non renseigné"
            },
            {
                name: "⭐ Qualités",
                value: data.qualites || "Non renseigné"
            },
            {
                name: "🛡 Définition du rôle",
                value: data.definition || "Non renseigné"
            },
            {
                name: "📚 Expérience",
                value: data.experience || "Aucune"
            },
            {
                name: "➕ Informations supplémentaires",
                value: data.extra || "Aucune"
            }
        ],
        footer: {
            text: "💼 Système de candidature - NovaWorld"
        },
        timestamp: new Date()
    }]
};


    await fetch(WEBHOOK, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(payload)
    });

    // SAVE 24H COOLDOWN
    if (ip !== WHITELIST_IP) {
        localStorage.setItem("lastSubmit", Date.now());
    }

    // SAVE CANDIDATURE LOCAL
    let list = JSON.parse(localStorage.getItem("candidatures") || "[]");
    list.push({
        discord:data.discord,
        ip,
        categorie:data.categorie,
        motivations:data.motivations
    });
    localStorage.setItem("candidatures", JSON.stringify(list));

    status.innerHTML = "✅ Candidature envoyée !";
    setTimeout(()=>location.reload(),1400);
}

// ADMIN PANEL
function openAdmin() {
    let code = prompt("Code admin :");
    if (code !== ADMIN_CODE) return alert("Code invalide");

    let list = JSON.parse(localStorage.getItem("candidatures") || "[]");

    let html = `<h2>📂 Candidatures enregistrées</h2>
    <button class='admin-btn' onclick='clearAll()'>🗑 Supprimer toutes les candidatures</button><br><br>`;

    list.forEach(c=>{
        html += `
        <div class="admin-entry">
            <b>Pseudo Discord :</b> ${c.discord}<br>
            <b>IP :</b> ${c.ip}<br>
            <b>Catégorie :</b> ${c.categorie}<br>
            <b>Motivations :</b> ${c.motivations}
        </div>`;
    });

    adminPanel.innerHTML = html;
    adminPanel.style.display = "block";
}

function clearAll(){
    localStorage.removeItem("candidatures");
    adminPanel.innerHTML = "<p style='color:#ff4444;font-weight:700'>Toutes les candidatures ont été supprimées.</p>";
}

function toggleAutrePoste() {
    const select = document.getElementById("poste");
    const box = document.getElementById("autrePosteBox");

    if (!select || !box) return;

    box.style.display = select.value === "Autre" ? "block" : "none";
}











