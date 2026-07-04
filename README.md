# Mini E-Commerce

Application web e-commerce développée avec **Vue.js 3**, **Express.js** et **MySQL**.

## Fonctionnalités

- Consultation du catalogue produits
- Gestion des stocks
- CRUD des produits
- Panier dynamique
- Validation de commande
- Vérification du stock avant achat
- Mise à jour automatique des stocks
- API REST avec Express.js
- Base de données MySQL

## Technologies

- Vue.js 3 (Composition API)
- Express.js
- Node.js
- MySQL
- Axios
- HTML5 / CSS3

## Structure

```
mini-ecommerce-vue-express
├── backend
├── frontend
└── database.sql
```

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le backend écoute sur le port **3000** et communique avec une base de données **MySQL** nommée `ecommerce`.
