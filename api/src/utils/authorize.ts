import { User } from '@prisma/client';
import { Context } from '../context';
import { getRefreshCookie } from './auth';

export const authorize = async (ctx: Context): Promise<User | null> => {
  const refreshCookie = getRefreshCookie(ctx);

  const user = await ctx.prisma.user.findFirst({
    where: { id: refreshCookie?.userId },
  });

  return user;
};
