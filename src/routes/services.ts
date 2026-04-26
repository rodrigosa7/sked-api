import { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../models/prisma';

interface ServiceBody {
  name: string;
  duration: number;
  price: number;
  description?: string;
}

interface ServiceParams {
  id: string;
}

export const servicesRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate);

  // List all services for tenant
  app.get('/services', async (request: FastifyRequest) => {
    return prisma.service.findMany({
      where: { tenantId: request.tenantId },
    });
  });

  // Create service
  app.post<{ Body: ServiceBody }>(
    '/services',
    async (request) => {
      const { name, duration, price, description } = request.body;
      const service = await prisma.service.create({
        data: {
          tenantId: request.tenantId!,
          name,
          duration,
          price,
          description,
        },
      });
      return service;
    }
  );

  // Get single service
  app.get<{ Params: ServiceParams }>('/services/:id', async (request, reply) => {
    const service = await prisma.service.findFirst({
      where: { id: request.params.id, tenantId: request.tenantId },
    });
    if (!service) {
      reply.code(404);
      return { error: 'Service not found' };
    }
    return service;
  });

  // Update service
  app.put<{ Params: ServiceParams; Body: Partial<ServiceBody> }>(
    '/services/:id',
    async (request, reply) => {
      try {
        const service = await prisma.service.update({
          where: { id: request.params.id },
          data: request.body,
        });
        return service;
      } catch {
        reply.code(404);
        return { error: 'Service not found' };
      }
    }
  );

  // Delete service
  app.delete<{ Params: ServiceParams }>('/services/:id', async (request, reply) => {
    try {
      await prisma.service.delete({
        where: { id: request.params.id },
      });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: 'Service not found' };
    }
  });
};