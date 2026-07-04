const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Recuperer tous les produits
router.get('/api/produits', async (req, res) => {
    try {
        let [produits] = await db.query("SELECT * FROM produit ORDER BY id ASC");
        res.json(produits);
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
});

// POST - Ajouter un produit
router.post('/api/produits', async (req, res) => {
    const { nom, image, stock, prix } = req.body;
    try {
        const [resultat] = await db.query(
            'INSERT INTO produit (nom, image, stock, prix) VALUES (?, ?, ?, ?)',
            [nom, image, stock, prix]
        );
        res.status(201).json({
            id: resultat.insertId,
            nom,
            prix,
            image,
            stock
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de l ajout du produit'
        });
    }
});

// PUT - Modifier un produit
router.put('/api/produits/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, prix, stock, image } = req.body;
    try {
        // Verifier si le produit existe
        const [existing] = await db.query('SELECT * FROM produit WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Produit non trouve' });
        }

        await db.query(
            'UPDATE produit SET nom=?, prix=?, stock=?, image=? WHERE id=?',
            [nom, prix, stock, image, id]
        );
        res.json({ message: 'Produit mis a jour avec succes' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

// DELETE - Supprimer un produit
router.delete('/api/produits/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Verifier si le produit existe
        const [existing] = await db.query('SELECT * FROM produit WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Produit non trouve' });
        }

        await db.query('DELETE FROM produit WHERE id = ?', [id]);
        res.json({ message: 'Produit supprime avec succes' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;