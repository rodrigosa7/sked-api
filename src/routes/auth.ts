import { FastifyInstance } from 'fastify';

interface RegisterBody {
  name?: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const authRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: RegisterBody }>(
    '/auth/register',
    async (request, reply) => {
      const { name, email, password } = request.body;
      if (!name || !email || !password) {
        reply.code(400);
        return { error: 'Name, email and password are required' };
      }
      try {
        const tenant = await app.authService.register({ name, email, password });
        const token = app.jwt.sign({ tenantId: tenant.id });
        return { token, tenant: { id: tenant.id, name: tenant.name, email: tenant.email } };
      } catch (err: any) {
        if (err.code === 'P2002') {
          reply.code(409);
          return { error: 'Email already registered' };
        }
        throw err;
      }
    }
  );

  app.post<{ Body: LoginBody }>(
    '/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      if (!email || !password) {
        reply.code(400);
        return { error: 'Email and password are required' };
      }
      try {
        const tenant = await app.authService.login({ email, password });
        const token = app.jwt.sign({ tenantId: tenant.id });
        return { token, tenant: { id: tenant.id, name: tenant.name, email: tenant.email } };
      } catch (err) {
        reply.code(401);
        return { error: 'Invalid credentials' };
      }
    }
  );
};