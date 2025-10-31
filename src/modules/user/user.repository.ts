import { db } from '@/database';
import { Injectable } from '@nestjs/common';
import { UserRole } from 'types/enums/user';
import { users, storeUsers } from '@/database';
import { auth } from '../auth/auth.service';
import { TUser } from 'types/user';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  async findByRole(role: UserRole) {
    return db.query.users.findMany({
      where: (u, { eq }: any) => eq(u.role, role),
      columns: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: (u, { asc }) => [asc(u.name)],
    });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: (u, { eq }: any) => eq(u.email, email),
    });
  }

  async findById(userId: string) {
    return db.query.users.findFirst({
      where: (u, { eq }: any) => eq(u.id, userId),
    });
  }

  async signUpUser(data: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    role: UserRole;
  }) {
    const { email, password, name, phoneNumber, role } = data;

    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        phoneNumber: phoneNumber ?? '',
        birthday: '',
      },
    });

    // Persist extra fields elsewhere later if needed.
  }

  async linkUserToStore(userId: string, storeId: string) {
    await db.insert(storeUsers).values({
      userId,
      storeId,
    });
  }

  async verifyUser(userId: string, storeId: string) {
    const link = await db.query.storeUsers.findFirst({
      where: (su, { and, eq }: any) =>
        and(eq(su.userId, userId), eq(su.storeId, storeId)),
    });
    return !!link;
  }

  async findUserIdsByRole(role: UserRole) {
    const result = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.role, role))
      .execute();

    return result;
  }

  async updateStatus(userId: string, status: boolean) {
    await db
      .update(users)
      .set({ status })
      .where(((u, { eq }: any) => eq(u.id, userId)) as any);
  }
}
