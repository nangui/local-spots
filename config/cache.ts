import env from '#start/env'
import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: env.get('CACHE_STORE', 'default'),

  stores: {
    /**
     * Cache en mémoire uniquement (pour les tests et développement rapide)
     */
    memoryOnly: store().useL1Layer(drivers.memory()),

    /**
     * Cache hybride : mémoire + base de données
     * L1 (mémoire) : très rapide, pour les accès fréquents
     * L2 (base de données) : persistant, pour la persistance entre redémarrages
     */
    default: store()
      .useL1Layer(drivers.memory({ 
        maxSize: '50mb'  // Limite la mémoire utilisée
      }))
      .useL2Layer(drivers.database({
        connectionName: 'default',  // Utilise la connexion par défaut
        autoCreateTable: false,     // Table créée par migration
        tableName: 'cache'
      }))
  }
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}