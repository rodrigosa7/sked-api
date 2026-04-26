import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
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

  // Make auth service available to routes
  app.decorate('authService', authService);

  // Register routes
  app.register(authRoutes);
  app.register(servicesRoutes);
  app.register(clientsRoutes);
  app.register(appointmentsRoutes);

  return app;
};