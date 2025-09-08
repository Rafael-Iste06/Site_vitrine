const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const basicAuth = require('express-basic-auth');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const PORT = process.env.PORT || 3000;

// ----------------- CONFIG ADMIN -----------------
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'password';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- FONCTIONS UTILES -----------------
function readArticles() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        if (!data) return [];
        return JSON.parse(data);
    } catch (err) {
        console.error("Erreur lecture articles :", err);
        return [];
    }
}

function writeArticles(articles) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
    } catch (err) {
        console.error("Erreur écriture articles :", err);
    }
}

// ----------------- ROUTES PUBLIQUES -----------------
// Récupérer tous les articles
app.get('/api/articles', (req, res) => {
    const articles = readArticles();
    res.json(articles);
});

// ----------------- AUTHENTIFICATION ADMIN -----------------
app.use('/api/admin', basicAuth({
    users: { [ADMIN_USER]: ADMIN_PASSWORD },
    challenge: true
}));

// Ajouter un article (admin)
app.post('/api/admin/articles', (req, res) => {
    const { title, content, image } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Titre et contenu requis' });

    const articles = readArticles();
    const date = new Date().toLocaleDateString();
    articles.push({ title, content, image: image || 'https://via.placeholder.com/300x200?text=Image' });
    writeArticles(articles);

    res.json({ success: true });
});

// Supprimer un article (admin)
app.delete('/api/admin/articles/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const articles = readArticles();
    if (isNaN(index) || index < 0 || index >= articles.length) {
        return res.status(400).json({ error: 'Index invalide' });
    }
    articles.splice(index, 1);
    writeArticles(articles);
    res.json({ success: true });
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

