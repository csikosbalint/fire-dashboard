import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Architectural boundaries enforcement
  {
    plugins: {
      boundaries
    },
    settings: {
      'boundaries/elements': [
        { type: 'ui-components', pattern: 'components/**' },
        { type: 'ui-controllers', pattern: 'controllers/**' },
        { type: 'domain', pattern: 'domain/**' },
        { type: 'middleware', pattern: 'lib/middleware/**' },
        { type: 'adapters', pattern: 'adapters/**' },
        { type: 'services', pattern: 'services/**' },
        { type: 'utils', pattern: 'lib/utils/**' },
        { type: 'pages', pattern: 'app/**/page.tsx' },
        { type: 'api-routes', pattern: 'app/api/**' }
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts']
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Layer 1: UI Components
            {
              from: 'ui-components',
              allow: ['ui-components', 'utils']
            },
            // Layer 2: UI Controllers
            {
              from: 'ui-controllers',
              allow: ['domain', 'utils']
            },
            // Layer 3: Domain (strictest - only utils)
            {
              from: 'domain',
              allow: ['utils']
            },
            // Layer 4A: Middleware
            {
              from: 'middleware',
              allow: ['domain', 'services', 'utils']
            },
            // Layer 4B: Adapters
            {
              from: 'adapters',
              allow: ['services', 'utils']
            },
            // Layer 5: Services
            {
              from: 'services',
              allow: ['domain', 'utils']
            },
            // Layer 6: Utils (imports nothing)
            {
              from: 'utils',
              allow: []
            },
            // Pages
            {
              from: 'pages',
              allow: ['ui-components', 'ui-controllers', 'utils']
            },
            // API Routes
            {
              from: 'api-routes',
              allow: ['middleware', 'adapters', 'services', 'domain', 'utils']
            }
          ]
        }
      ]
    }
  },

  // Prevent React in domain/services/utils layers
  {
    files: ['domain/**/*.ts', 'services/**/*.ts', 'lib/utils/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react/*'],
              message: '❌ React not allowed in domain/services/utils layers (must be framework-agnostic)'
            },
            {
              group: ['next', 'next/*'],
              message: '❌ Next.js not allowed in domain/services/utils layers'
            }
          ]
        }
      ]
    }
  },

  // Prevent Next.js cache/server features in services layer
  {
    files: ['services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next/cache', 'next/headers', 'next/navigation'],
              message: '❌ Next.js server features not allowed in services layer (use adapters)'
            }
          ]
        }
      ]
    }
  },

  // Prevent services/adapters imports in UI layers
  {
    files: ['controllers/**/*.ts', 'components/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/*', '@/services/**', 'services/*', 'services/**'],
              message: '❌ Cannot import services directly in UI layers (use controllers/API calls)'
            },
            {
              group: ['@/adapters/*', '@/adapters/**', 'adapters/*', 'adapters/**'],
              message: '❌ Cannot import adapters in UI layers'
            }
          ]
        }
      ]
    }
  }
]);

export default eslintConfig;
