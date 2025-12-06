// ID DU RÔLE À PING
const ROLE_ID = "1446471808743243987";

// Webhook
const WEBHOOK = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";

// ==========================
// ⏳ ANTI-SPAM 24H
// ==========================
function canSendApplication() {
    const last = localStorage.getItem("lastSend");
    if (!last) return true; // jamais envoyé → OK

    const diff = Date.now() - Number(last);
    const hours = 24 * 60 * 60 * 1000;

    return diff >= hours; // true = OK, false = trop tôt
}

function getRemainingTime() {
    const last = Number(localStorage.getItem("lastSend"));
    const remaining = (24 * 60 * 60 * 1000) - (Date.now() - last);

    const h = Math.floor(remaining / (1000*60*60));
    const m = Math.floor((remaining % (1000*60*60)) / (1000*60));

    return `${h}h ${m}min`;
}

// ==========================
// PAGE 1 → PAGE 2
// ==========================
document.getElementById("nextBtn").addEventListener("click", () => {

    if (!canSendApplication()) {
        alert("❗ Vous devez attendre encore : " + getRemainingTime());
        return;
    }

    if (
        pseudo.value.trim() === "" ||
        age.value.trim() === ""
    ) {
        alert("Veuillez remplir au minimum PSEUDO + ÂGE.");
        return;
    }

    page1.style.display = "none";
    page2.style.display = "block";
});

// ==========================
// RETOUR
// ==========================
backBtn.addEventListener("click", () => {
    page1.style.display = "block";
    page2.style.display = "none";
});

// ==========================
// 📤 ENVOI AU WEBHOOK
// ==========================
sendBtn.addEventListener("click", () => {

    if (!canSendApplication()) {
        alert("❗ Vous devez attendre encore : " + getRemainingTime());
        return;
    }

    const poste = document.querySelector("input[name='poste']:checked");

    const data = {
        pseudo: pseudo.value,
        prenom: prenom.value,
        age: age.value,
        dispo: dispo.value,
        poste: poste ? poste.value : "Non choisi",
        motive: motive.value,
        pourquoi: pourquoi.value,
        qualites: qualites.value,
        definition: definition.value,
        experience: experience.value,
        autre: autre.value
    };

    const embed = {
        content: `<@&${ROLE_ID}>`, // PING DU RÔLE 🔥
        embeds: [{
            title: "📩 Nouvelle Candidature Staff",
            color: 0xff0000,
            fields: Object.keys(data).map(k => ({
                name: k.charAt(0).toUpperCase() + k.slice(1),
                value: data[k] || "Non rempli"
            }))
        }]
    };

    fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embed)
    });

    // Sauvegarde anti-spam 24h
    localStorage.setItem("lastSend", Date.now().toString());

    alert("🎉 Votre candidature a été envoyée !");
});
