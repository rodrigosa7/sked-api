import bcrypt from 'bcryptjs';
import { prisma } from '../models/prisma';

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
    return tenant;
  },

  async login(data: { email: string; password: string }) {
    const tenant = await prisma.tenant.findUnique({
      where: { email: data.email },
    });
    if (!tenant) {
      throw new Error('Invalid credentials');
    }
    const valid = await bcrypt.compare(data.password, tenant.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    return tenant;
  },
};