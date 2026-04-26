import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authService } from './services/auth.service';
import { authRoutes } from './routes/auth';
import { servicesRoutes } from './routes/services';
import { clientsRoutes } from './routes/clients';
import { appointmentsRoutes } from './routes/appointments';

declare module 'fastify' {
  interface FastifyInstance {
    authService: typeof authService;
  }
}

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(jwt, { secret: process.env.JWT_SECRET || 'sked-secret' });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Sked API',
        description: 'Multi-tenant appointment scheduling API',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  app.register(swaggerUi, { routePrefix: '/docs' });

  // Make auth service available to routes
  app.decorate('authService', authService);

  // Register routes under /api/v1 prefix
  app.register(async (app) => {
    app.register(authRoutes);
    app.register(servicesRoutes);
    app.register(clientsRoutes);
    app.register(appointmentsRoutes);
  }, { prefix: '/api/v1' });

  return app;
};