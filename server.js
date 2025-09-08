const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- FONCTIONS -----------------
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

// ----------------- ROUTES -----------------
// Récupérer tous les articles
app.get('/api/articles', (req, res) => {
    const articles = readArticles();
    res.json(articles);
});

// Ajouter un article
app.post('/api/articles', (req, res) => {
    const { title, content, image } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Titre et contenu requis' });

    const articles = readArticles();
    const date = new Date().toLocaleDateString();
    articles.push({ title, content, image: image || 'https://via.placeholder.com/300x180', date });
    writeArticles(articles);

    res.json({ success: true });
});

// Supprimer un article
app.delete('/api/articles/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const articles = readArticles();
    if (isNaN(index) || index < 0 || index >= articles.length) {
        return res.status(400).json({ error: 'Index invalide' });
    }
    articles.splice(index, 1);
    writeArticles(articles);
    res.json({ success: true });
});

// Démarrer serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
