import { FastifyRequest, FastifyReply } from 'fastify';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const decoded = await request.jwtVerify<{ tenantId: string }>();
    request.tenantId = decoded.tenantId;
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
};

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string;
  }
}