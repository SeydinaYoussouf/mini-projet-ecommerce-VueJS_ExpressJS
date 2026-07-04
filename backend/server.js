const express = require('express');
const cors = require('cors');
const db = require("./db");
const app = express();
const produitRoute = require('./routes/produits');

// MIDDLEWARES - IMPORTANT: Doivent etre avant les routes
app.use(cors());
app.use(express.json());        // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse form data

// ROUTES
app.use('/', produitRoute);

// POST /api/commande
app.post('/api/commande', async (req, res) => {
    const panier = req.body;

    if (!panier || panier.length === 0) {
        return res.status(400).json({ message: 'Panier vide' });
    }

    try {
        for (const article of panier) {
            const [rows] = await db.query(
                'SELECT stock, nom FROM produit WHERE id = ?',
                [article.id]
            );

            if (rows.length === 0) {
                return res.status(400).json({
                    message: `Produit avec ID ${article.id} introuvable`
                });
            }

            const stockDisponible = rows[0].stock;
            const nomProduit = rows[0].nom;

            if (stockDisponible < article.quantite) {
                return res.status(400).json({
                    message: `Stock insuffisant pour "${nomProduit}" - Disponible: ${stockDisponible}, Demande: ${article.quantite}`
                });
            }
        }

        for (const article of panier) {
            await db.query(
                'UPDATE produit SET stock = stock - ? WHERE id = ?',
                [article.quantite, article.id]
            );
        }

        const numeroCommande = Math.floor(Math.random() * 900000) + 100000;

        res.status(201).json({
            message: 'Commande validee avec succes',
            numeroCommande: numeroCommande
        });

    } catch (error) {
        console.error('Erreur POST /api/commande:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la validation de la commande'
        });
    }
});

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API fonctionne' });
});

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur ecommerce lance sur le port 3000');
});