<template>

<div id="app">
  <header>
    <h1> Boutikou YOU bisi Bopou Kogn </h1>
  </header>

  <div v-if="messageSucces" class="alerte-succes">
      {{ messageSucces }} - commande Numero : {{ numCommande }}
  </div>
  <div v-if="messageErreur" class="alerte-erreur">
    {{ messageErreur }} 
  </div>

  <!-- img  -->
  <main class="contenu">
    <!-- Catalogue de produits  -->
     <section class="catalogue">
      <h2>Catalogue</h2>
      <div class="grille-produits">
<!-- img  -->
        <div v-for="produit in produits" :key="produit.id" class="carte-produit">
          <img :src="produit.image" :alt="produit.nom" />
          <h3>{{ produit.nom }}</h3>
          <p class="prix"> {{ formatterPrix(produit.prix) }}</p>
          <p :class="produit.stock === 0 ? 'stock-vide' : 'stock-ok' "> Stock : {{ produit.stock }}</p>

          <!-- btn disabled si stock = 0 -->
           <button @click="ajouterAuPanier(produit)" :disabled="produit.stock === 0"
           >
           {{ produit.stock === 0 ? 'Epuise' : 'Ajouter au panier' }}
           </button>
        </div>
      </div>
     </section>

     <!-- MON PANIER  -->
      <aside class="panier">
        <h2> Panier ({{ totalArticles }})</h2>

        <p v-if="panier.length === 0"> Votre panier est Vide </p>

        <div v-for="article in panier" :key="article.id" class="article-panier">
          <span>{{ article.nom }}</span>
          <span>x {{ article.quantite }}</span>
          <span>{{ formatterPrix(article.prix * article.quantite) }}</span>
          <button @click="supprimerDuPanier(article.id)">X</button>
        </div>

        <div v-if="panier.length > 0" class="total-panier">
          <strong>Total : {{ formatterPrix(prixTotal) }}</strong>
          <button @click="validerCommande">Valider la commande</button>
        </div>
      </aside>
  </main>
</div>

</template>



<script setup> 
import { ref, computed, onMounted } from 'vue';

const produits = ref([]);
const panier = ref([]);
const messageSucces = ref('');
const messageErreur = ref('');
const numCommande = ref(null);
const chargement = ref(false);

const API_URL = 'http://localhost:3000';

// fnctin pour charger les produits depuis l'api
async function chargerProds(){
  try{
    const response = await fetch(`${API_URL}/api/produits`);
    produits.value = await response.json();
  }catch(error){
    messageErreur.value = 'Impossible de charger les produits!!!';
  }
}

// on appelle la fnct qd le compo est monte a la pge 
onMounted(() =>{
  chargerProds();
});


const totalArticles = computed(() =>{
  return panier.value.reduce((total, article) => (total + article.quantite), 0);
});

const prixTotal = computed(() =>{
  return panier.value.reduce(
    (total, article) => total + (article.quantite * article.prix), 0
  );
});

// on formatte le prix en CFA 
function formatterPrix(prix) {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}



function ajouterAuPanier(produit){
  const articleExistant = panier.value.find(a => a.id === produit.id);

  if (articleExistant){
    if(articleExistant.quantite < produit.stock){
      articleExistant.quantite++;
    }else{
      alert(`stock insuffisant  il y en a que ${produit.stock}`);
    }
  }else{
    // ajouter au panier avec quantite= 1
    panier.value.push({
      id : produit.id,
      nom: produit.nom,
      prix : produit.prix,
      stock : produit.stock,
      quantite : 1
    });
  }
}

// catalogue

function supprimerDuPanier(produitId){
  panier.value =  panier.value.filter(a => a.id !== produitId)
}



async function validerCommande(){
  // reset les msgs 
  messageSucces.value = '';
  messageErreur.value = '';

  if (panier.value.length === 0){
    messageErreur.value = 'Le panier est Vide! ';
    return;
  }
  chargement.value = true;
  try{
     const response = await fetch(`${API_URL}/api/commande`, {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify(panier.value)  // Envoyer le panier en JSON
        });

        const data = await response.json();

        if (response.ok){
          // succes 
          numCommande.value = data.numeroCommande;
          messageSucces.value = data.message;

          // vide le pan 
          panier.value = [];

          // recharger le catalogue pour afficher le stock maj
          await chargerProds();
        }else{
          // autre erreurs comme stock insuff, ... 
          messageErreur.value = data.message;
        }
  }catch(error){
    messageErreur.value = 'Erreur réseau. Vérifiez que le serveur est démarré.';

  }finally{
    chargement.value = false;
  }
}

</script>



<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

body { font-family: Arial, sans-serif; background: #f0f2f5; }

#app { max-width: 1200px; margin: 0 auto; padding: 20px; }

/* ── Header ─────────────────────────────────────────────────────────── */
header {
  background: white;
  border: 1px solid #e8e8e8;
  padding: 18px 28px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

header h1 {
  display: inline-block;
  cursor: default;
  transition: letter-spacing 0.4s ease, color 0.3s ease;
  border: 2px solid #2563eb;
  padding: 8px 20px;
  border-radius: 8px;
}

header h1:hover {
  letter-spacing: 4px;
  color: #2563eb;
}
/* ── Alertes ─────────────────────────────────────────────────────────── */
.alerte-succes {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.alerte-erreur {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

/* ── Layout ──────────────────────────────────────────────────────────── */
.contenu { display: flex; gap: 20px; align-items: flex-start; }

/* ── Catalogue ───────────────────────────────────────────────────────── */
.catalogue { flex: 1; }

.catalogue h2 {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 16px;
}

.grille-produits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

/* ── Carte produit ───────────────────────────────────────────────────── */
.carte-produit {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s;
}

.carte-produit:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
}

.carte-produit img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.carte-body { padding: 14px; }

.carte-body h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prix {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 10px;
}

.stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stock-ok {
  font-size: 11px;
  font-weight: 500;
  color: #166534;
  background: #dcfce7;
  padding: 3px 10px;
  border-radius: 20px;
}

.stock-vide {
  font-size: 11px;
  font-weight: 500;
  color: #991b1b;
  background: #fee2e2;
  padding: 3px 10px;
  border-radius: 20px;
}

button {
  width: 100%;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #1a1a2e;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

button:hover:not(:disabled) {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

button:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* ── Panier ──────────────────────────────────────────────────────────── */
aside.panier {
  width: 300px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 18px;
  position: sticky;
  top: 20px;
}

aside.panier h2 {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

aside.panier h2 span {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 20px;
}

.panier-vide {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  padding: 24px 0;
}

.article-panier {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.article-panier .nom {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-panier .qte {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 20px;
}

.article-panier .sous-total {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  white-space: nowrap;
}

.btn-suppr {
  width: auto;
  padding: 4px 7px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
}

.btn-suppr:hover {
  background: #fee2e2;
  color: #dc2626;
  border: none;
}

/* ── Total & bouton valider ──────────────────────────────────────────── */
.total-panier { padding-top: 14px; }

.total-ligne {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.total-ligne strong {
  color: #1a1a2e;
  font-weight: 600;
}

.total-ligne .montant {
  font-weight: 600;
  color: #1a1a2e;
}

.btn-valider {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-valider:hover {
  background: #1d4ed8;
}
</style>