# CLAUDE.md

**语言要求**: 用英文思考，用中文输出

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS template repository for building scalable server-side applications with TypeScript.

## Common Commands

### Development

```bash
npm run start:dev    # Start development server with hot-reload
npm run start        # Start production server
npm run start:debug  # Start with debug mode
```

### Building

```bash
npm run build        # Compile TypeScript to JavaScript
npm run format       # Format code with Prettier
npm run lint         # Lint code with ESLint
```

### Testing

```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run end-to-end tests
```

## Architecture

### NestJS Framework Structure

NestJS follows a modular architecture pattern where the application is organized into modules, each containing:

- **Controllers**: Handle incoming requests and return responses to the client
- **Providers/Services**: Contain business logic and can be injected as dependencies
- **Modules**: Group related controllers and providers together
- **Guards**: Handle authentication and authorization
- **Interceptors**: Transform responses or handle cross-cutting concerns
- **Pipes**: Transform and validate input data
- **Filters**: Handle exceptions and errors

### Typical Project Structure

- `src/main.ts` - Application entry point that bootstraps the NestJS application
- `src/app.module.ts` - Root module that imports all feature modules
- `src/modules/` - Feature modules organized by domain
- `src/common/` - Shared utilities, guards, interceptors, pipes, and decorators
- `test/` - End-to-end tests

### Dependency Injection

NestJS uses dependency injection extensively. Services should be decorated with `@Injectable()` and registered in module providers. Controllers receive dependencies through constructor injection.

### Configuration

Use `@nestjs/config` module for environment variables and configuration management. Configuration should be validated at startup.
