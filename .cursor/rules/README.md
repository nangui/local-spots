# 🎯 Règles Cursor pour LocalSpots

## 📋 Vue d'Ensemble

Ce dossier contient toutes les règles Cursor pour le projet LocalSpots. Ces règles aident à maintenir la cohérence du code et à suivre les bonnes pratiques définies dans la documentation.

## 🗂️ Règles Disponibles

### 1. **API Documentation** (`api-documentation.mdc`)
- **Description** : Standards pour la documentation et l'implémentation de l'API
- **Fichiers ciblés** : Contrôleurs, routes, endpoints
- **Application** : Automatique sur les fichiers d'API

### 2. **DDD Architecture** (`ddd-architecture.mdc`)
- **Description** : Règles d'architecture Domain Driven Design
- **Fichiers ciblés** : Entités, value objects, repositories, use cases
- **Application** : Automatique sur la couche Domain et Application

### 3. **Database Schema** (`database-schema.mdc`)
- **Description** : Standards pour la conception de base de données
- **Fichiers ciblés** : Migrations, modèles, seeders
- **Application** : Automatique sur les fichiers de base de données

### 4. **Deployment Guide** (`deployment-guide.mdc`)
- **Description** : Règles de déploiement et configuration production
- **Fichiers ciblés** : Docker, workflows CI/CD, configuration
- **Application** : Automatique sur les fichiers d'infrastructure

### 5. **Contributing Guidelines** (`contributing-guidelines.mdc`)
- **Description** : Standards de code et processus de contribution
- **Fichiers ciblés** : Tout le code source, tests, scripts
- **Application** : Automatique sur tous les fichiers

### 6. **Security Guidelines** (`security-guidelines.mdc`)
- **Description** : Règles de sécurité et bonnes pratiques OWASP
- **Fichiers ciblés** : Code source, configuration, middleware
- **Application** : Automatique sur tous les fichiers

### 7. **Testing Standards** (`testing-standards.mdc`)
- **Description** : Standards pour les tests unitaires et d'intégration
- **Fichiers ciblés** : Tests, code source, configuration
- **Application** : Automatique sur tous les fichiers

### 8. **User Stories** (`user-stories.mdc`)
- **Description** : Exigences produit et critères d'acceptation
- **Fichiers ciblés** : Documentation, README, code source
- **Application** : Automatique sur la documentation

## 🚀 Utilisation

### Activation des Règles
1. Ouvrir Cursor
2. Aller dans `Cursor > Settings > Rules`
3. Vérifier que toutes les règles sont détectées
4. Les règles s'appliquent automatiquement selon leur configuration

### Configuration des Règles
Chaque règle contient un frontmatter YAML avec :
- `description` : Description de la règle
- `globs` : Patterns de fichiers ciblés
- `alwaysApply` : Si la règle s'applique automatiquement

### Personnalisation
Vous pouvez modifier les règles selon vos besoins :
- Ajuster les patterns de fichiers (`globs`)
- Modifier le comportement d'application (`alwaysApply`)
- Ajouter de nouvelles règles spécifiques

## 📊 Métriques de Qualité

### Couverture des Règles
- **API** : 100% des endpoints documentés
- **Architecture** : 90%+ de logique métier dans la couche Domain
- **Tests** : 80%+ de coverage
- **Sécurité** : 100% des vulnérabilités OWASP couvertes
- **Documentation** : 100% des fonctionnalités documentées

### Validation Automatique
Les règles Cursor s'appliquent automatiquement pour :
- Maintenir la cohérence du code
- Détecter les anti-patterns
- Suggérer des améliorations
- Valider la conformité aux standards

## 🔧 Maintenance

### Mise à Jour des Règles
1. Modifier le fichier `.mdc` correspondant
2. Tester la règle sur un fichier cible
3. Valider que le comportement est correct
4. Commiter les changements

### Ajout de Nouvelles Règles
1. Créer un nouveau fichier `.mdc`
2. Définir le frontmatter YAML
3. Écrire le contenu de la règle
4. Tester et valider
5. Ajouter à ce README

## 📚 Ressources

- [Documentation Cursor Rules](https://docs.cursor.com/fr/context/rules)
- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [Domain Driven Design](https://www.domainlanguage.com/ddd/)
- [OWASP Security Guidelines](https://owasp.org/)

## 🤝 Contribution

Pour améliorer ces règles :
1. Identifier un besoin ou une amélioration
2. Créer une issue ou une PR
3. Implémenter la règle
4. Tester et valider
5. Documenter les changements

---

**Note** : Ces règles sont un document vivant et évoluent avec le projet. Vérifiez régulièrement les mises à jour et les nouvelles règles ajoutées.
