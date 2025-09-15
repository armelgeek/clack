# ClickNVape Backend

A production-ready backend application built with **NestJS** and **Drizzle ORM** following a **simple, clean architecture** to provide a maintainable and testable foundation for the ClickNVape platform with authentication-enabled APIs.

## 🏗️ Architecture

This application follows a **simple NestJS architecture** with clear separation of concerns:

```
src/
├── main.ts                   # Application entry point
├── app.module.ts            # Root application module
├── auth/                    # Authentication module
│   ├── auth.module.ts      # Auth module configuration
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.controller.ts  # Auth HTTP endpoints
│   └── dto/                # Auth data transfer objects
├── user/                    # User management module
│   ├── user.module.ts      # User module configuration
│   ├── user.service.ts     # User business logic
│   ├── user.controller.ts  # User HTTP endpoints
│   ├── user.entity.ts      # User entity interface
│   └── dto/                # User data transfer objects
├── database/               # Database configuration
│   ├── schema.ts          # Drizzle database schema
│   └── connection.ts      # Database connection setup
└── common/                # Shared utilities
    ├── types/             # Type definitions
    └── utils/             # Common utilities
```

## ✨ Features

- **🔐 Authentication System**: Complete auth flow with session-based authentication and Drizzle ORM
- **🏛️ Simple Architecture**: Clean, straightforward NestJS structure without over-engineering
- **🗄️ Drizzle ORM**: Type-safe database operations with SQL databases
- **🛡️ Protected Routes**: Session-based authentication with database persistence
- **📝 API Documentation**: Auto-generated Swagger/OpenAPI docs
- **🧪 Type Safety**: Full TypeScript support with strict typing
- **🔧 Production Ready**: Error handling, logging, and validation
- **📦 Modular Design**: Easy to extend and maintain

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ClickNVape-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

4. **Access the application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api


## 🏗️ Architecture Principles

### Service Layer
- **Business logic** encapsulated in NestJS services
- **Direct database access** through Drizzle ORM
- **Type-safe operations** with TypeScript interfaces

### Controller Layer
- **HTTP request handling** with NestJS controllers
- **Request validation** using DTOs and class-validator
- **Response formatting** for consistent API responses

### Database Layer
- **Drizzle ORM** for type-safe database operations
- **Schema definitions** with proper relations and constraints
- **Session management** with database persistence

## 🔌 Drizzle ORM Integration

This boilerplate includes a fully functional [Drizzle ORM](https://orm.drizzle.team) integration that provides:

- **Type-Safe Database Operations**: Full TypeScript support with Drizzle ORM
- **SQLite Database**: Simple setup with SQLite for development and production
- **Schema Management**: Versioned database migrations
- **Session Management**: Secure session handling with database persistence
- **Password Security**: bcrypt hashing for secure password storage

### Database Features

The implementation includes:

- **User Management**: Complete user CRUD operations with proper relations
- **Session Handling**: Database-backed session management with expiration
- **Schema Migrations**: Drizzle Kit for managing database schema changes
- **Type Safety**: Full TypeScript integration with database operations

### Database Commands

```bash
# Generate database migrations
npm run db:generate

# Apply migrations to create/update database
npm run db:migrate
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start server in debug mode
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Drizzle database migrations
- `npm run db:migrate` - Apply database migrations

## 🔒 Security Features

- **Password hashing** with bcrypt
- **Session management** with database persistence and expiration
- **Request validation** with class-validator
- **Type-safe APIs** with TypeScript
- **CORS protection** enabled
- **Error handling** without sensitive data exposure

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file with:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]
```

### Build for Production

```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
