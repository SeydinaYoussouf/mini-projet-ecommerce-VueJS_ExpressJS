// Ce fichier gère la connexion à la BD avec l'aide du module mysql2
// dotenv module à installer si on veut utiliser un fichier .env pour les constantes de la BD
const mysql = require('mysql2/promise');
const dbConnect = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'Arouna999',
    database : 'ecommerce'
});
module.exports = dbConnect;