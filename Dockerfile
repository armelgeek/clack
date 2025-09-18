# Dockerfile.dev - pour l'environnement de développement sous Kubernetes
FROM node:20-bullseye-slim

# Variables d'env par défaut
ENV NODE_ENV=development \
    PORT=3000

# Dossier de travail
WORKDIR /app

# Installer outils nécessaires pour modules natifs (bcrypt, éventuellement jison)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    git \
  && rm -rf /var/lib/apt/lists/*

# Copier uniquement les fichiers de dépendances en premier (pour profiter du cache Docker)
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour hot reload, migrations, tests…)
RUN npm install --force

# Copier le reste du code
COPY . .

# (optionnel) Si tu veux persister sqlite en dev
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 3000

# Commande par défaut → lance le mode dev (hot reload avec Nest CLI)
CMD ["npm", "run", "dev"]
