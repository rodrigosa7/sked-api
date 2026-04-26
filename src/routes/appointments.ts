import { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../models/prisma';
import { AppointmentStatus } from '@prisma/client';

interface AppointmentBody {
  clientId: string;
  serviceId: string;
  dateTime: string;
  notes?: string;
  status?: AppointmentStatus;
}

interface AppointmentParams {
  id: string;
}

interface AppointmentQuery {
  date?: string;
}

export const appointmentsRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authenticate);

  // List appointments (optionally filter by date)
  app.get<{ Querystring: AppointmentQuery }>('/appointments', async (request) => {
    const where: any = { tenantId: request.tenantId };
    if (request.query.date) {
      const startOfDay = new Date(request.query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(request.query.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.dateTime = { gte: startOfDay, lte: endOfDay };
    }
    return prisma.appointment.findMany({
      where,
      include: { client: true, service: true },
      orderBy: { dateTime: 'asc' },
    });
  });

  // Create appointment
  app.post<{ Body: AppointmentBody }>(
    '/appointments',
    async (request) => {
      return prisma.appointment.create({
        data: {
          tenantId: request.tenantId!,
          clientId: request.body.clientId,
          serviceId: request.body.serviceId,
          dateTime: new Date(request.body.dateTime),
          notes: request.body.notes,
        },
        include: { client: true, service: true },
      });
    }
  );

  // Get single appointment
  app.get<{ Params: AppointmentParams }>('/appointments/:id', async (request, reply) => {
    const appointment = await prisma.appointment.findFirst({
      where: { id: request.params.id, tenantId: request.tenantId },
      include: { client: true, service: true },
    });
    if (!appointment) {
      reply.code(404);
      return { error: 'Appointment not found' };
    }
    return appointment;
  });

  // Update appointment
  app.put<{ Params: AppointmentParams; Body: Partial<AppointmentBody> }>(
    '/appointments/:id',
    async (request, reply) => {
      try {
        const updateData: any = { ...request.body };
        if (request.body.dateTime) {
          updateData.dateTime = new Date(request.body.dateTime);
        }
        return await prisma.appointment.update({
          where: { id: request.params.id },
          data: updateData,
          include: { client: true, service: true },
        });
      } catch {
        reply.code(404);
        return { error: 'Appointment not found' };
      }
    }
  );

  // Delete appointment
  app.delete<{ Params: AppointmentParams }>('/appointments/:id', async (request, reply) => {
    try {
      await prisma.appointment.delete({ where: { id: request.params.id } });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: 'Appointment not found' };
    }
  });
};