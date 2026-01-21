const WEBHOOK = "https://discord.com/api/webhooks/1463612209883119728/ijqKy8nQHoeJ5Wu18LZj7RWuaDjChkWrsrwWU95VrfMWsxqVcPqLAZJxxol7ZyORggdL";
const ROLE_ID = "1451995468585242841";
const ADMIN_CODE = "GTlifetontop1234";
const WHITELIST_IP = "91.174.237.40";

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

    const data = {
        irl: irl.value,
        discord: discord.value,
        prenom: prenom.value,
        age: age.value,
        dispos: dispos.value,
        categorie: categorie.value,
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
            description: `Une nouvelle candidature vient d'être envoyée pour **${data.categorie}**.`,
            fields: [
                { name:"👤 Pseudo Discord", value:data.discord },
                { name:"📌 Catégorie demandée", value:data.categorie },

                { 
                    name:"📄 Présentation IRL", 
                    value:`**Prénom :** ${data.prenom}\n**Âge :** ${data.age}\n**Présentation complète :**\n${data.irl}` 
                },

                { name:"🕒 Disponibilités", value:data.dispos },

                { 
                    name:"🔥 Motivations", 
                    value:data.motivations || "Non renseigné"
                },

                { 
                    name:"❓ Pourquoi lui ?", 
                    value:data.why || "Non renseigné"
                },

                { 
                    name:"⭐ Qualités", 
                    value:data.qualites || "Non renseigné"
                },

                { 
                    name:"🛡 Définition du rôle", 
                    value:data.definition || "Non renseigné"
                },

                { 
                    name:"📚 Expérience", 
                    value:data.experience || "Aucune"
                },

                { 
                    name:"➕ Informations supplémentaires", 
                    value:data.extra || "Aucune"
                }
            ],
            footer: { text: "💼 Système de candidature - Glast" },
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




