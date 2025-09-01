import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";

import router from '@adonisjs/core/services/router'

// returns swagger in YAML
router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});

router.get("/docs", async () => {
  return AutoSwagger.default.ui("/swagger", swagger);
});

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
