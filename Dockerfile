# Image de base
FROM node:20-bullseye-slim

# Dossier de travail
WORKDIR /app

# Installer les dependances
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential python3 git \
  && rm -rf /var/lib/apt/lists/*

# Copier les deux dossiers dans le conteneur
COPY mobile-app-backend/ ./mobile-app-backend/
COPY vapostore-db/ ./vapostore-db/

# Installer dépendances vapostore-db
RUN npm install --force --prefix ./vapostore-db

# Installer dépendances backend
RUN npm install --force --prefix ./mobile-app-backend

# Exposer le port
EXPOSE 3000

# Lancer
CMD ["sh", "-c", "cd mobile-app-backend/ && npm run db:generate && npm run db:push && npm run dev --host 0.0.0.0"]
