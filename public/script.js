// ----------------- CONFIG ADMIN -----------------
const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "password";

// ----------------- DOM ELEMENTS -----------------
const articlesDiv = document.getElementById("articles");
const addArticleBtn = document.getElementById("add-article-btn");
const addArticleSection = document.getElementById("add-article-section");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

// ----------------- FONCTION FETCH ARTICLES -----------------
async function fetchArticles() {
    try {
        const res = await fetch('/api/articles');
        const articles = await res.json();
        renderArticles(articles);
    } catch (err) {
        console.error("Erreur fetch articles:", err);
        if(articlesDiv) articlesDiv.innerHTML = "<p>Impossible de charger les articles.</p>";
    }
}

// ----------------- FONCTION RENDER ARTICLES -----------------
function renderArticles(articles) {
    if(!articlesDiv) return;
    articlesDiv.innerHTML = "";

    if(articles.length === 0) {
        articlesDiv.innerHTML = "<p>Aucun article pour le moment.</p>";
        return;
    }

    articles.forEach((article, index) => {
        const div = document.createElement("div");
        div.className = "article";
        div.innerHTML = `
            <img src="${article.image}" alt="${article.title}">
            <div class="article-content">
                <h3>${article.title}</h3>
                <p>${article.content}</p>
                <small>${article.date}</small>
                ${window.location.pathname.includes('admin.html') ? `<br><button onclick="deleteArticle(${index})">Supprimer</button>` : ""}
            </div>
        `;
        articlesDiv.appendChild(div);
    });
}


// ----------------- AJOUTER ARTICLE (ADMIN) -----------------
if(addArticleBtn) {
    addArticleBtn.addEventListener("click", async () => {
        const title = document.getElementById("article-title").value.trim();
        const content = document.getElementById("article-content").value.trim();
        const image = document.getElementById("article-image").value.trim() || 'https://via.placeholder.com/300x180';

        if(!title || !content) {
            alert("Veuillez remplir le titre et le contenu !");
            return;
        }

        // 🔑 Popup login pour l'action d'ajout
        const id = prompt("Identifiant admin :");
        const password = prompt("Mot de passe admin :");

        if (!id || !password) {
            alert("Ajout annulé (login manquant).");
            return;
        }

        try {
            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(id + ":" + password) // Authentification admin
                },
                body: JSON.stringify({ title, content, image })
            });

            if (!res.ok) {
                alert("⚠️ Identifiants incorrects ou ajout refusé.");
                return;
            }

            fetchArticles();

            // Efface les champs
            document.getElementById("article-title").value = "";
            document.getElementById("article-content").value = "";
            document.getElementById("article-image").value = "";

            // 🔄 Commit automatique sur GitHub
            await fetch('/api/admin/commit-articles', { method: 'POST' });

        } catch(err) {
            console.error("Erreur ajout article:", err);
            alert("Impossible d'ajouter l'article.");
        }
    });
}


// ----------------- SUPPRIMER ARTICLE (ADMIN) -----------------
async function deleteArticle(index) {
    if(!confirm("Voulez-vous vraiment supprimer cet article ?")) return;

    // 🔑 Popup login pour l'action de suppression
    const id = prompt("Identifiant admin :");
    const password = prompt("Mot de passe admin :");

    if (!id || !password) {
        alert("Suppression annulée (login manquant).");
        return;
    }

    try {
        const res = await fetch(`/api/admin/articles/${index}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Basic ' + btoa(id + ":" + password)
            }
        });

        if (!res.ok) {
            alert("⚠️ Identifiants incorrects ou suppression refusée.");
            return;
        }

        fetchArticles();

        // 🔄 Commit automatique sur GitHub après suppression
        await fetch('/api/admin/commit-articles', { method: 'POST' });

    } catch(err) {
        console.error("Erreur suppression article:", err);
        alert("Impossible de supprimer l'article.");
    }
}
window.deleteArticle = deleteArticle;


// ----------------- LOGIN ADMIN -----------------
if(loginBtn) {
    loginBtn.addEventListener("click", () => {
        const id = document.getElementById("admin-id").value.trim();
        const password = document.getElementById("admin-password").value.trim();

        if(id === ADMIN_ID && password === ADMIN_PASSWORD) {
            loginError.textContent = "";
            addArticleSection.classList.remove("hidden");
            alert("Connexion réussie !");
        } else {
            loginError.textContent = "Identifiant ou mot de passe incorrect";
        }
    });
}

// ----------------- CHARGEMENT INIT -----------------
fetchArticles();

// ----------------- RAFRAICHISSEMENT AUTOMATIQUE CLIENT -----------------
if (!window.location.pathname.includes('admin.html')) {
    setInterval(fetchArticles, 5000); // Recharge toutes les 5 secondes sur la page client
}


