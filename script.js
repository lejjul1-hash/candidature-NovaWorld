// CONFIG
const WEBHOOK_URL = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";
const ROLE_ID = "1446471808743243987";
const ADMIN_CODE = "Glastontop1234";
const WHITELIST_IP = "91.174.237.40";

let userIP = "";

// ======================= GET IP =======================
fetch("https://api.ipify.org?format=json")
.then(r => r.json())
.then(d => userIP = d.ip);

// ======================= ANTI SPAM 24H =======================
function canSend() {
    if (userIP === WHITELIST_IP) return true;

    const last = localStorage.getItem("lastSend");
    if (!last) return true;

    return (Date.now() - last) > 86400000;
}

// ======================= PAGE SWITCH =======================
nextBtn.onclick = () => {
    if (!canSend()) return alert("❗ Attendez 24h avant de renvoyer une candidature.");
    page1.classList.remove("active");
    page2.classList.add("active");
};

backBtn.onclick = () => {
    page2.classList.remove("active");
    page1.classList.add("active");
};

// ======================= ENVOI =======================
sendBtn.onclick = () => {

    if (!canSend()) return alert("⛔ Vous devez attendre 24h.");

    const poste = document.querySelector("input[name='poste']:checked");

    const embed = {
        username: "Candidature Glast",
        content: `<@&${ROLE_ID}>`,
        embeds: [{
            title: "📨 Nouvelle Candidature — Glast",
            color: 0xff0000,
            fields: [
                { name: "👤 Pseudo", value: pseudo.value },
                { name: "📛 Prénom", value: prenom.value },
                { name: "🎂 Âge", value: age.value },
                { name: "⏰ Disponibilités", value: dispo.value },
                { name: "🎯 Poste souhaité", value: poste ? poste.value : "Non choisi" },
                { name: "🔥 Motivations", value: motive.value },
                { name: "⭐ Pourquoi lui ?", value: pourquoi.value },
                { name: "💠 Qualités", value: qualites.value },
                { name: "📘 Définition du rôle", value: definition.value },
                { name: "🛠️ Expérience", value: experience.value },
                { name: "➕ Autre", value: autre.value },
                { name: "🌍 IP", value: userIP }
            ]
        }]
    };

    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embed)
    });

    // Sauvegarde locale
    localStorage.setItem("lastSend", Date.now());
    saveCandidature(embed);

    alert("✅ Candidature envoyée !");
};

// ======================= STOCKAGE ADMIN =======================
function saveCandidature(data) {
    let list = JSON.parse(localStorage.getItem("candidatures") || "[]");
    list.push(data);
    localStorage.setItem("candidatures", JSON.stringify(list));
}

// ======================= ADMIN ACCESS =======================
adminBtn.onclick = () => {
    adminPopup.style.display = "flex";
};

adminClose.onclick = () => {
    adminPopup.style.display = "none";
};

adminLogin.onclick = () => {
    if (adminCode.value === ADMIN_CODE) {
        adminPopup.style.display = "none";
        loadAdminPanel();
        adminPanel.style.display = "block";
    } else {
        alert("❌ Code incorrect.");
    }
};

// ======================= LOAD ADMIN PANEL =======================
function loadAdminPanel() {
    const list = JSON.parse(localStorage.getItem("candidatures") || "[]");

    adminList.innerHTML = list.map(c => `
        <div class="candidature">
            <strong>${c.embeds[0].fields[0].value}</strong><br>
            Poste : ${c.embeds[0].fields[4].value}<br>
            IP : ${c.embeds[0].fields[11].value}<br><br>
            <pre>${JSON.stringify(c, null, 2)}</pre>
        </div>
    `).join("");
}
