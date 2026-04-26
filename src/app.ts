import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authService } from './services/auth.service';
import { authRoutes } from './routes/auth';

declare module 'fastify' {
  interface FastifyInstance {
    authService: typeof authService;
  }
}

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(jwt, { secret: process.env.JWT_SECRET || 'sked-secret' });

  // Make auth service available to routes
  app.decorate('authService', authService);

  // Register routes
  app.register(authRoutes);

  return app;
};