# Contournement Facebook Login sans vérification commerciale

## ⚠️ Avertissement
Cette méthode fonctionne mais avec des **limitations importantes** :
- Accès très limité aux données utilisateur
- Pas d'accès à l'email ou au profil complet
- Permet uniquement l'authentification de base

## 🚫 Contexte du problème
- Facebook a renforcé ses restrictions pour les développeurs
- La vérification commerciale (business verification) est devenue obligatoire dans la plupart des cas
- Beaucoup pensent que c'est devenu impossible pour les petits projets

## ✅ Solution de contournement

### Étapes détaillées :

1. **Accéder au formulaire de création**
   - Rendez-vous sur : https://developers.facebook.com/apps/creation/
   - ⭐ **Pro-tip** : Lisez attentivement les boîtes de dialogue, elles contiennent des indices

2. **Étape critique** 🔑
   - Au deuxième onglet, **NE PAS** cliquer sur :  
     `"Authenticate and request data from users with Facebook Login"`
   - **CLIQUER** sur : `"Other"` puis `"Use the old method"`

3. **Sélection du type**
   - Vous pouvez maintenant choisir `"Consumer"` au lieu de `"Business"`

## 📋 Résultat attendu
- ✅ Les utilisateurs peuvent se connecter via Facebook
- ❌ Accès très limité aux données (quasi-inexistant)
- ❌ Pas d'email ni informations de profil

## 🎯 Cas d'usage appropriés
Cette méthode convient si vous avez seulement besoin :
- D'une authentification simple
- De vérifier que l'utilisateur a un compte Facebook valide
- D'éviter la création de comptes manuels

## 📝 Notes importantes
- Cette information date de 2023 et peut devenir obsolète
- Facebook continue de restreindre l'accès aux données
- Pour des besoins plus avancés, la vérification commerciale reste nécessaire

---

*Source : Réponse d'un développeur sur un forum, en réaction aux changements de politique Facebook*