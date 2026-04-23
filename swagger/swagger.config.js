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

function collectOperationTags(paths) {
  const tags = [];
  const seen = new Set();

  for (const pathItem of Object.values(paths)) {
    for (const operation of Object.values(pathItem || {})) {
      if (!operation || !Array.isArray(operation.tags)) {
        continue;
      }

      for (const tag of operation.tags) {
        if (!seen.has(tag)) {
          seen.add(tag);
          tags.push(tag);
        }
      }
    }
  }

  return tags;
}

function insertTagInRelatedSection(tags, tagName) {
  const tagPrefix = tagName.split(' ')[0];
  const tagEntry = { name: tagName };
  const lastRelatedIndex = tags
    .map((tag) => tag.name)
    .findLastIndex((name) => name === tagPrefix || name.startsWith(`${tagPrefix} `));

  if (lastRelatedIndex === -1) {
    tags.push(tagEntry);
    return;
  }

  tags.splice(lastRelatedIndex + 1, 0, tagEntry);
}

function declareOperationTags(spec) {
  spec.tags = [...(spec.tags || [])];
  const declared = new Set(spec.tags.map((tag) => tag.name));

  for (const tagName of collectOperationTags(spec.paths)) {
    if (declared.has(tagName)) {
      continue;
    }

    insertTagInRelatedSection(spec.tags, tagName);
    declared.add(tagName);
  }
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

  declareOperationTags(spec);

  return spec;
}

export const swaggerSpec = buildSpec();

// ---------------------------------------------------------------------------
// Express setup
// ---------------------------------------------------------------------------

export function configureSwagger(app) {
  // Serve the Swagger UI shell and let it fetch the live JSON spec.
  app.use('/api/docs', swaggerUi.serve);
  app.get(
    '/api/docs',
    swaggerUi.setup(null, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Tawasoul API Docs',
      swaggerOptions: {
        url: '/api/docs.json',
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
    res.send(buildSpec());
  });
}
