import { configure } from '@japa/runner'
import { assert } from '@japa/assert'

configure({
  files: ['tests/functional/**/*.spec.ts'],
  plugins: [
    assert(),
  ],
  reporters: {
    activated: ['spec']
  },
  importer: (filePath: URL) => import(filePath.toString()),
})
