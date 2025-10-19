# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript client application for a virtual try-on platform, built with Vite for fast development and optimized production builds. The application features user authentication (email/password + Google OAuth) and is designed to work with a NestJS backend API.

## Common Commands

### Development

```bash
pnpm dev              # Start dev server at http://localhost:5173
pnpm build            # Production build (output to dist/)
pnpm build:check      # Type check with TypeScript, then build
pnpm preview          # Preview production build locally
```

**Note**: This project uses pnpm as the package manager. The .npmrc configuration uses `shamefully-hoist=true` to flatten node_modules for better compatibility.

### Environment Setup

Create a `.env` file based on `.env.example`:
```bash
VITE_API_URL=http://localhost:3000
```

The dev server proxies `/api` requests to the backend at `http://localhost:3000` (configured in vite.config.ts).

## Code Architecture

### High-Level Structure

The application follows a layered architecture with clear separation of concerns:

```
src/
├── api/              # API integration layer
├── contexts/         # React Context for global state
├── components/       # Reusable React components
├── pages/            # Page-level components (routes)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Authentication Flow

**Central Pattern**: Context API-based authentication with automatic token management

1. **AuthContext** (`src/contexts/AuthContext.tsx`) provides global auth state:
   - `user: User | null` - Current user data
   - `loading: boolean` - Initialization state
   - `isAuthenticated: boolean` - Computed from user state
   - `login()`, `register()`, `logout()` - Auth actions

2. **Token Management** (`src/utils/token.ts`):
   - Tokens stored in localStorage
   - `tokenManager` object provides: `setTokens()`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`

3. **API Client** (`src/api/client.ts`):
   - Axios instance with automatic Bearer token injection (request interceptor)
   - Automatic token refresh on 401 errors (response interceptor)
   - Pattern: Catches 401 → calls `/auth/refresh` → retries original request with new token
   - Falls back to clearing tokens and redirecting to login on refresh failure

4. **Protected Routes** (`src/components/ProtectedRoute.tsx`):
   - HOC wrapper that checks `isAuthenticated` from context
   - Shows loading spinner during auth state initialization
   - Redirects to `/login` if unauthenticated

### Routing Architecture

Routes are defined in `App.tsx` using React Router v7:

- `/login` - Public login page
- `/register` - Public registration page
- `/auth/callback` - OAuth callback handler (extracts tokens from URL params)
- `/` - Protected home page (wrapped with `<ProtectedRoute>`)

**Pattern**: All protected routes must be wrapped with `<ProtectedRoute>` component.

### API Integration Pattern

API calls follow a consistent pattern:

1. All endpoints defined in `src/api/auth.ts` as named functions
2. Use centralized `apiClient` from `src/api/client.ts`
3. Backend returns `{ data: T }` wrapper, which is unwrapped by the API layer
4. Full TypeScript typing for requests and responses

Example:
```typescript
// In api/auth.ts
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  },
};

// In component
const { login } = useAuth();
await login({ email, password });  // Tokens automatically stored
```

### State Management Philosophy

**No Redux/Zustand**: Uses React Context API for authentication state only. This is intentional - auth state is global by nature, but other state should be co-located with components.

**When to add state**:
- Global auth state: Use existing `AuthContext`
- Component-local state: Use `useState` hook
- Shared non-auth state: Create new Context (follow `AuthContext` pattern)

### TypeScript Conventions

- **Strict mode enabled**: All TypeScript strict checks active (`noUnusedLocals`, `noUnusedParameters`, etc.)
- **Type definitions**: Centralized in `src/types/` directory
- **Component typing**: All components use `React.FC` with typed props
- **API types**: Request/response types defined alongside API functions

### Styling Approach

**CSS Variables + Utility Classes** (no CSS-in-JS, no Tailwind):

1. **Global styles** in `src/index.css`:
   - CSS custom properties for colors, spacing, shadows
   - Primary color: `#4f46e5` (Indigo)
   - Typography: System font stack

2. **Co-located component styles**: Each page/component has its own CSS file (e.g., `Login.tsx` + `Auth.css`)

3. **Utility classes**: Reusable button styles (`.btn`, `.btn-primary`, `.btn-google`, etc.)

4. **Layout patterns**: Flexbox-based layouts with centered containers

### Development Workflow

**Adding a new authenticated page**:

1. Create component in `src/pages/PageName.tsx`
2. Add co-located CSS file `src/pages/PageName.css`
3. Add route in `App.tsx`:
   ```typescript
   <Route path="/new-page" element={<ProtectedRoute><PageName /></ProtectedRoute>} />
   ```
4. Access auth state via `useAuth()` hook

**Adding a new API endpoint**:

1. Add TypeScript types to `src/types/` (if needed)
2. Add endpoint function to `src/api/auth.ts` (or create new API module)
3. Use `apiClient` - tokens are automatically injected

**Key Files Reference**:

- `App.tsx` - Route definitions and app structure
- `contexts/AuthContext.tsx` - Auth state and actions
- `api/client.ts` - Axios instance with interceptors
- `api/auth.ts` - Authentication API endpoints
- `components/ProtectedRoute.tsx` - Route protection HOC
- `types/auth.ts` - Authentication type definitions
- `vite.config.ts` - Build configuration and API proxy

### Build Configuration

**Vite config highlights** (`vite.config.ts`):

- Dev server port: 5173
- API proxy: `/api/*` → `http://localhost:3000/*` (removes `/api` prefix)
- Manual chunk splitting for optimized bundle sizes:
  - `react-vendor`: React and React DOM
  - `axios-vendor`: Axios HTTP client
- Source maps enabled for production debugging

### Browser Compatibility

Target: Modern browsers supporting ES2022 (configured in tsconfig.json and Vite). No IE11 support.

## Important Patterns

### OAuth Callback Flow

The `/auth/callback` route handles OAuth redirects from the backend:

1. Backend redirects to `/auth/callback?token=ACCESS&refresh=REFRESH`
2. `Callback.tsx` extracts tokens from URL params
3. Tokens stored via `tokenManager`
4. User redirected to home page
5. `AuthContext` initialization picks up stored tokens

### Error Handling

- **API errors**: Interceptor catches 401s for token refresh
- **Form validation**: Client-side validation in Login/Register components
- **Error states**: Components show error messages via local state

### Token Refresh Logic

Located in `api/client.ts` response interceptor:

```typescript
// Simplified logic:
1. Request fails with 401
2. Extract refresh token from tokenManager
3. Call POST /auth/refresh with refresh token
4. Store new access token
5. Retry original request with new token
6. If refresh fails, clear tokens and redirect to login
```

**Important**: The `_retry` flag prevents infinite refresh loops.

## Notes for Future Development

1. **Adding features**: This is a foundational auth scaffold. Most new features will be new pages/components that consume the existing auth context.

2. **Backend integration**: The backend is a NestJS application at `/server`. API routes are prefixed with `/api` (e.g., `/api/auth/login`).

3. **Protected routes pattern**: Always wrap protected routes with `<ProtectedRoute>` component. Never check `isAuthenticated` directly in page components.

4. **No form libraries**: Currently uses native React controlled components. If adding complex forms, consider React Hook Form.

5. **No UI component library**: Custom CSS components. If scaling, consider adding a component library (shadcn/ui, Radix UI, etc.).
