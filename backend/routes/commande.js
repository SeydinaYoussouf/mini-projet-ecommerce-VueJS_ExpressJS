const express = require('express');
const router = express.Router();
const db = require('../db');

// POST - Valider une commande
router.post('/api/commande', async (req, res) => {
    const panier = req.body;

    // Verifier si le panier est vide
    if (!panier || panier.length === 0) {
        return res.status(400).json({
            message: 'Panier vide'
        });
    }

    try {
        // Etape 1: Verifier les stocks pour chaque article
        for (const article of panier) {
            // Verifier que l'article a un id et une quantite
            if (!article.id || !article.quantite || article.quantite <= 0) {
                return res.status(400).json({
                    message: 'Article invalide dans le panier'
                });
            }

            const [rows] = await db.query(
                'SELECT stock, nom FROM produit WHERE id = ?',
                [article.id]
            );

            // Verifier si le produit existe
            if (rows.length === 0) {
                return res.status(400).json({
                    message: `Produit avec ID ${article.id} introuvable`
                });
            }

            const stockDisponible = rows[0].stock;
            const nomProduit = rows[0].nom;

            // Verifier si le stock est suffisant
            if (stockDisponible < article.quantite) {
                return res.status(400).json({
                    message: `Stock insuffisant pour "${nomProduit}" - Disponible: ${stockDisponible}, Demande: ${article.quantite}`
                });
            }
        }

        // Etape 2: Mettre a jour les stocks (transaction)
        await db.query('START TRANSACTION');

        try {
            for (const article of panier) {
                await db.query(
                    'UPDATE produit SET stock = stock - ? WHERE id = ?',
                    [article.quantite, article.id]
                );
            }

            // Valider la transaction
            await db.query('COMMIT');

            // Etape 3: Generer un numero de commande aleatoire
            const numeroCommande = Math.floor(Math.random() * 900000) + 100000;

            // Calculer le total du panier
            const total = panier.reduce((sum, article) => {
                return sum + (article.prix * article.quantite);
            }, 0);

            // Etape 4: Reponse de succes
            res.status(201).json({
                message: 'Commande validee avec succes',
                numeroCommande: numeroCommande,
                articles: panier.length,
                total: total
            });

        } catch (error) {
            // En cas d'erreur, annuler la transaction
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Erreur POST /api/commande:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la validation de la commande'
        });
    }
});

module.exports = router;