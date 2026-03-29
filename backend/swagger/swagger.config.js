// ============================================================
// Swagger / OpenAPI Configuration
// ============================================================
// Dependencies (add to package.json if not present):
//   npm install swagger-ui-express js-yaml
//
// Usage in src/server.js:
//   import { setupSwagger } from '../docs/swagger.config.js';
//   setupSwagger(app);  // before error handlers
// ============================================================

import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

/**
 * Recursively collect all files with the given name inside a directory.
 */
function collectFiles(dir, filename, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, filename, results);
    } else if (entry.name === filename) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Build the merged OpenAPI spec
// ---------------------------------------------------------------------------

function buildSpec() {
  const base = loadYaml(path.join(__dirname, 'swagger.info.yaml'));

  const spec = {
    ...base,
    paths: {},
    components: {
      ...(base.components || {}),
      schemas: { ...(base.components?.schemas || {}) },
    },
  };

  // Merge all paths.yaml files
  for (const file of collectFiles(__dirname, 'paths.yaml')) {
    const paths = loadYaml(file);
    if (paths && typeof paths === 'object') {
      Object.assign(spec.paths, paths);
    }
  }

  // Merge all schema.yaml files into components.schemas
  for (const file of collectFiles(__dirname, 'schema.yaml')) {
    const schemas = loadYaml(file);
    if (schemas && typeof schemas === 'object') {
      Object.assign(spec.components.schemas, schemas);
    }
  }

  return spec;
}

export const swaggerSpec = buildSpec();

// ---------------------------------------------------------------------------
// Express setup
// ---------------------------------------------------------------------------

export function configureSwagger(app) {
  // Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Tawasoul API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        deepLinking: true,
        tryItOutEnabled: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
    })
  );

  // Raw JSON spec (useful for Postman import)
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
