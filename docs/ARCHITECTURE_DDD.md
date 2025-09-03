# 🏗️ Architecture Domain Driven Design - LocalSpots

## 📋 Vue d'Ensemble

LocalSpots suit une architecture **Domain Driven Design (DDD)** avec une séparation claire des couches et une logique métier centralisée dans la couche Domain.

## 🎯 Principes DDD Appliqués

### 1. **Ubiquitous Language**
- **Spot** : Un lieu local intéressant (restaurant, café, parc, etc.)
- **Location** : Coordonnées géographiques avec validation
- **Category** : Classification du type de lieu
- **Status** : État du spot (draft, published, archived, moderated)

### 2. **Bounded Contexts**
- **Spot Management** : Gestion des lieux et de leur cycle de vie
- **User Management** : Gestion des utilisateurs et authentification
- **Review System** : Système d'évaluation et commentaires

### 3. **Value Objects**
- **SpotId** : Identifiant unique avec validation UUID
- **SpotName** : Nom avec validation de longueur
- **Location** : Coordonnées GPS avec calculs de distance
- **Category** : Catégorie avec icônes et validation
- **SpotStatus** : Statut avec règles de transition

## 🏛️ Structure des Couches

```
app/
├── domain/                    # 🎯 Couche Domain (Cœur métier)
│   ├── entities/             # Entités du domaine
│   │   └── spot.ts          # Entité principale Spot
│   ├── value-objects/        # Objets de valeur
│   │   ├── spot-id.ts       # Identifiant du spot
│   │   ├── spot-name.ts     # Nom du spot
│   │   ├── location.ts      # Localisation géographique
│   │   ├── category.ts      # Catégorie du spot
│   │   ├── spot-status.ts   # Statut du spot
│   │   ├── user-id.ts       # Identifiant utilisateur
│   │   └── spot-photo.ts    # Photo du spot
│   ├── repositories/         # Interfaces des repositories
│   │   ├── spot-repository.interface.ts
│   │   └── user-repository.interface.ts
│   ├── services/             # Services du domaine
│   └── events/               # Événements du domaine
│       ├── domain-event.ts   # Classe de base des événements
│       ├── spot-created.event.ts
│       └── event-dispatcher.interface.ts
├── application/               # 🚀 Couche Application (Cas d'usage)
│   ├── use-cases/            # Cas d'usage métier
│   │   └── create-spot.use-case.ts
│   ├── dto/                  # Data Transfer Objects
│   │   └── create-spot.dto.ts
│   └── validators/           # Validation des données
├── infrastructure/            # 🔧 Couche Infrastructure
│   ├── database/             # Implémentation des repositories
│   ├── external-services/    # Services externes (Google Maps)
│   └── file-storage/         # Gestion des fichiers
├── presentation/              # 🌐 Couche Présentation
│   ├── controllers/          # Contrôleurs HTTP
│   ├── middlewares/          # Middlewares
│   └── resources/            # Ressources API
└── shared/                   # 🔄 Code partagé
    ├── types/                # Types TypeScript
    ├── utils/                # Utilitaires
    └── exceptions/           # Exceptions métier
```

## 🎯 Entités du Domaine

### **Spot Entity**
```typescript
export class Spot {
  // Propriétés privées avec getters publics
  private readonly _id: SpotId
  private _name: SpotName
  private _description: string
  private _location: Location
  private _category: Category
  private readonly _createdBy: UserId
  private readonly _createdAt: DateTime
  private _updatedAt: DateTime
  private _status: SpotStatusValue

  // Méthodes métier
  public publish(): void
  public archive(): void
  public updateName(name: SpotName): void
  public addPhoto(photo: SpotPhoto): void
  
  // Factory methods
  static create(...): Spot
  static reconstruct(...): Spot
}
```

**Caractéristiques :**
- ✅ **Encapsulation** : Propriétés privées avec getters publics
- ✅ **Invariants** : Validation des règles métier
- ✅ **Factory Methods** : Création et reconstruction d'instances
- ✅ **Business Logic** : Méthodes métier centralisées

### **Value Objects**
```typescript
export class Location {
  constructor(
    private readonly _latitude: number,
    private readonly _longitude: number,
    private readonly _address?: string
  ) {
    this.validateCoordinates()
  }

  // Méthodes métier
  public calculateDistanceTo(other: Location): number
  public isWithinRadius(other: Location, radiusKm: number): boolean
  
  // Validation
  private validateCoordinates(): void
}
```

**Caractéristiques :**
- ✅ **Immutabilité** : Propriétés readonly
- ✅ **Validation** : Règles métier intégrées
- ✅ **Méthodes utilitaires** : Calculs de distance, etc.
- ✅ **Factory methods** : Création depuis différents formats

## 🚀 Use Cases (Couche Application)

### **CreateSpotUseCase**
```typescript
export class CreateSpotUseCase {
  async execute(command: CreateSpotDto): Promise<Result<CreateSpotResult, Error>> {
    // 1. Validation des données
    // 2. Vérification des règles métier
    // 3. Création de l'entité
    // 4. Persistance
    // 5. Dispatch d'événements
  }
}
```

**Caractéristiques :**
- ✅ **Single Responsibility** : Un seul cas d'usage par classe
- ✅ **Dependency Injection** : Repositories et services injectés
- ✅ **Error Handling** : Gestion d'erreurs avec Result pattern
- ✅ **Event Dispatching** : Événements de domaine

## 🔧 Interfaces des Repositories

### **ISpotRepository**
```typescript
export interface ISpotRepository {
  findById(id: SpotId): Promise<Spot | null>
  findByLocation(location: Location, radiusKm: number): Promise<Spot[]>
  findByCategory(category: Category, limit?: number): Promise<Spot[]>
  save(spot: Spot): Promise<Spot>
  delete(id: SpotId): Promise<void>
  // ... autres méthodes
}
```

**Caractéristiques :**
- ✅ **Interface Segregation** : Méthodes spécifiques au domaine
- ✅ **Domain Objects** : Utilise les entités et value objects
- ✅ **Async Operations** : Toutes les opérations sont asynchrones

## 📊 Gestion des Erreurs

### **Hierarchie des Exceptions**
```typescript
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  )
}

export class SpotNotFoundException extends DomainException
export class SpotAlreadyPublishedException extends DomainException
export class InvalidSpotLocationException extends DomainException
```

**Caractéristiques :**
- ✅ **Hierarchie claire** : Exception de base avec codes d'erreur
- ✅ **HTTP Status Codes** : Mapping automatique vers HTTP
- ✅ **Codes d'erreur** : Identifiants uniques pour le frontend

## 🧪 Tests

### **Tests du Domaine**
```typescript
test.group('Domain - Spot Entity', () => {
  test('should create a new spot', ({ assert }) => {
    const spot = Spot.create(name, description, location, category, userId)
    assert.instanceOf(spot, Spot)
    assert.isTrue(spot.isDraft())
  })
})
```

**Caractéristiques :**
- ✅ **Tests unitaires** : Focus sur la logique métier
- ✅ **Assertions claires** : Vérification des comportements
- ✅ **Coverage complet** : Tous les cas d'usage testés

## 🔄 Événements de Domaine

### **SpotCreatedEvent**
```typescript
export class SpotCreatedEvent extends DomainEvent {
  constructor(public readonly spot: Spot) {
    super()
  }

  get eventName(): string {
    return 'spot.created'
  }
}
```

**Caractéristiques :**
- ✅ **Immutabilité** : Données en lecture seule
- ✅ **Identification** : Nom unique de l'événement
- ✅ **Timestamp** : Horodatage automatique

## 📈 Avantages de cette Architecture

### **1. Maintenabilité**
- Séparation claire des responsabilités
- Code métier centralisé et testable
- Règles métier explicites et documentées

### **2. Testabilité**
- Chaque couche peut être testée indépendamment
- Mocks faciles à créer pour les dépendances
- Tests unitaires rapides et fiables

### **3. Scalabilité**
- Ajout de nouvelles fonctionnalités sans impact
- Équipes peuvent travailler en parallèle
- Architecture évolutive avec le temps

### **4. Performance**
- Optimisations possibles par couche
- Caching au niveau approprié
- Gestion efficace de la mémoire

## 🚧 Prochaines Étapes

### **Phase 2: Core Business Logic**
- [ ] Implémentation des autres use cases
- [ ] Services de domaine
- [ ] Règles métier avancées

### **Phase 3: Infrastructure**
- [ ] Repository implementations avec PostgreSQL
- [ ] Intégration Google Maps
- [ ] Service de stockage de fichiers

### **Phase 4: API & Presentation**
- [ ] Contrôleurs HTTP
- [ ] Middleware d'authentification
- [ ] Validation des requêtes

### **Phase 5: Testing & Documentation**
- [ ] Tests d'intégration
- [ ] Tests de performance
- [ ] Documentation API interactive

## 🔍 Bonnes Pratiques Appliquées

1. **SOLID Principles** : Chaque classe a une seule responsabilité
2. **Dependency Inversion** : Dépendances vers l'intérieur
3. **Encapsulation** : Données privées, comportement public
4. **Immutability** : Value objects immutables
5. **Factory Pattern** : Création d'objets centralisée
6. **Event Sourcing** : Événements pour la traçabilité
7. **Result Pattern** : Gestion d'erreurs explicite

## 📚 Ressources

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Cette architecture DDD fournit une base solide pour construire une application scalable et maintenable, en respectant les principes du Domain Driven Design tout en s'adaptant aux spécificités d'AdonisJS et de Node.js.
