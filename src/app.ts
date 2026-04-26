import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(jwt, { secret: process.env.JWT_SECRET || 'sked-secret' });

  return app;
};