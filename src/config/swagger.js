import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routesDir = join(__dirname, '../routes');

const routeConfigs = [
  {
    fileName: 'public.routes.js',
    prefix: '/api/public',
    tag: 'Public',
    description: 'Public content and onboarding endpoints'
  },
  {
    fileName: 'user.routes.js',
    prefix: '/api/user',
    tag: 'User',
    subRoutes: {
      'user/address.routes.js': { tag: 'User Addresses', description: 'User address management' }
    },
    description: 'User-facing mobile and web endpoints'
  },
  {
    fileName: 'doctor.routes.js',
    prefix: '/api/doctor',
    tag: 'Doctor',
    subRoutes: {
      'doctor/address.routes.js': { tag: 'Doctor Addresses', description: 'Doctor address management' }
    },
    description: 'Doctor portal endpoints'
  },
  {
    fileName: 'admin.routes.js',
    prefix: '/api/admin',
    tag: 'Admin',
    description: 'Admin dashboard and management endpoints'
  }
];

const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

const toTitleCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizePath = (prefix, routePath) => `${prefix}${routePath}`.replace(/:([A-Za-z0-9_]+)/g, '{$1}');

const getPathParameters = (routePath) => {
  const matches = [...routePath.matchAll(/:([A-Za-z0-9_]+)/g)];

  return matches.map(([, name]) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: `${toTitleCase(name)} identifier`
  }));
};

const buildSummary = (handlerName, method, fullPath) => {
  if (handlerName) {
    return toTitleCase(handlerName);
  }

  return `${method.toUpperCase()} ${fullPath}`;
};

const buildRequestBody = (method, middlewareList) => {
  if (!['post', 'put', 'patch'].includes(method)) {
    return undefined;
  }

  const isMultipart = middlewareList.some((item) => item.includes('upload'));

  return {
    required: false,
    content: {
      [isMultipart ? 'multipart/form-data' : 'application/json']: {
        schema: {
          type: 'object',
          additionalProperties: true
        }
      }
    }
  };
};

const parseRouteLine = (line) => {
  const match = line.match(/router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]\s*,\s*(.+)\);/);

  if (!match) {
    return null;
  }

  const [, method, routePath, middlewareAndHandler] = match;
  const parts = middlewareAndHandler.split(',').map((part) => part.trim()).filter(Boolean);
  const handler = parts[parts.length - 1];
  const handlerMatch = handler.match(/(?:[A-Za-z0-9_]+\.)?([A-Za-z0-9_]+)$/);
  const handlerName = handlerMatch?.[1];

  return {
    method,
    routePath,
    middlewareList: parts.slice(0, -1),
    handlerName
  };
};

const loadPathDefinitions = () => {
  const paths = {};

  for (const config of routeConfigs) {
    const filePath = join(routesDir, config.fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const parsed = parseRouteLine(line.trim());

      if (!parsed || !httpMethods.includes(parsed.method)) {
        continue;
      }

      const fullPath = normalizePath(config.prefix, parsed.routePath);

      let tag = config.tag;
      if (config.subRoutes) {
        for (const [subRouteFile, subConfig] of Object.entries(config.subRoutes)) {
          if (line.includes(subRouteFile)) {
            tag = subConfig.tag;
            break;
          }
        }
      }

      const operation = {
        tags: [tag],
        summary: buildSummary(parsed.handlerName, parsed.method, fullPath),
        operationId: `${tag.toLowerCase()}_${parsed.handlerName || `${parsed.method}_${parsed.routePath}`}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        parameters: getPathParameters(parsed.routePath),
        responses: {
          200: {
            description: 'Successful response'
          },
          400: {
            description: 'Bad request'
          },
          401: {
            description: 'Unauthorized'
          },
          403: {
            description: 'Forbidden'
          },
          404: {
            description: 'Not found'
          },
          500: {
            description: 'Internal server error'
          }
        }
      };

      const requestBody = buildRequestBody(parsed.method, parsed.middlewareList);
      if (requestBody) {
        operation.requestBody = requestBody;
      }

      if (parsed.middlewareList.some((item) => item.includes('authenticate'))) {
        operation.security = [{ bearerAuth: [] }];
      }

      if (!paths[fullPath]) {
        paths[fullPath] = {};
      }

      paths[fullPath][parsed.method] = operation;
    }
  }

  return paths;
};

const baseOpenApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Tawasoul Backend API',
    version: '1.0.0',
    description:
      'Generated Swagger documentation for the Tawasoul backend. Operations are derived from the active Express route files.'
  },
  tags: routeConfigs.flatMap(({ tag, description, subRoutes }) => {
    const tags = [{ name: tag, description }];
    if (subRoutes) {
      for (const subConfig of Object.values(subRoutes)) {
        tags.push({ name: subConfig.tag, description: subConfig.description });
      }
    }
    return tags;
  }),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: loadPathDefinitions()
};

export const getOpenApiSpec = (req) => ({
  ...baseOpenApiSpec,
  servers: [
    {
      url: 'https://jadwa.developteam.site/api',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Local development server'
    },
    {
      url: `${req.protocol}://${req.get('host')}/api`,
      description: 'Current server'
    }
  ]
});
