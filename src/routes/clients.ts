import { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../models/prisma';

interface ClientBody {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface ClientParams {
  id: string;
}

export const clientsRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate);

  // List all clients
  app.get('/clients', async (request: FastifyRequest) => {
    return prisma.client.findMany({
      where: { tenantId: request.tenantId },
    });
  });

  // Create client
  app.post<{ Body: ClientBody }>(
    '/clients',
    async (request) => {
      return prisma.client.create({
        data: {
          tenantId: request.tenantId!,
          name: request.body.name,
          email: request.body.email,
          phone: request.body.phone,
          notes: request.body.notes,
        },
      });
    }
  );

  // Get single client
  app.get<{ Params: ClientParams }>('/clients/:id', async (request, reply) => {
    const client = await prisma.client.findFirst({
      where: { id: request.params.id, tenantId: request.tenantId },
    });
    if (!client) {
      reply.code(404);
      return { error: 'Client not found' };
    }
    return client;
  });

  // Update client
  app.put<{ Params: ClientParams; Body: Partial<ClientBody> }>(
    '/clients/:id',
    async (request, reply) => {
      try {
        return await prisma.client.update({
          where: { id: request.params.id },
          data: request.body,
        });
      } catch {
        reply.code(404);
        return { error: 'Client not found' };
      }
    }
  );

  // Delete client
  app.delete<{ Params: ClientParams }>('/clients/:id', async (request, reply) => {
    try {
      await prisma.client.delete({ where: { id: request.params.id } });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: 'Client not found' };
    }
  });
};