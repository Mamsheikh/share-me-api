import { UserInputError } from 'apollo-server-core';
import { extendType, nonNull, stringArg } from 'nexus';
import { getRefreshCookie, createTokens } from '../../utils/auth';
import { AuthPayload } from '../payloads';

export const UserQueries = extendType({
  type: 'Query',
  definition(t) {
    //users
    // t.nullable.list.nonNull.field('users', {
    //   type: 'User',
    //   async resolve(_, args, ctx) {
    //     return ctx.prisma.post.findMany({
    //       include: { favorite: true },
    //     });
    //   },
    // });

    //User by Id

    t.nullable.field('getUser', {
      type: 'User',
      args: {
        userId: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        try {
          if (!args.userId) {
            throw new Error('please provide userId');
          }
          const user = await ctx.prisma.user.findUnique({
            where: { id: args.userId },
            rejectOnNotFound: true,
          });
          return user;
        } catch (error) {
          throw new Error(`failed to query user: ${error}`);
        }
      },
    });
    t.field('me', {
      type: 'User',
      resolve: async (_root, _args, ctx) => {
        const refreshCookie = getRefreshCookie(ctx);
        if (!refreshCookie) throw new Error('invalid cookie');
        // console.log(refreshCookie);
        const user = await ctx.prisma.user.findFirst({
          where: { id: refreshCookie.userId },
        });
        // console.log(user);
        if (!user) throw new UserInputError('not authenticated');

        // const { accessToken } = await createTokens({ userId: user.id }, ctx);

        return user;
      },
    });

    t.list.field('search', {
      type: 'Post',
      args: {
        searchTerm: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        try {
          const query = await ctx.prisma.post.findMany({
            where: {
              OR: [
                { title: { contains: args.searchTerm, mode: 'insensitive' } },
                { about: { contains: args.searchTerm, mode: 'insensitive' } },
                {
                  category: {
                    name: { contains: args.searchTerm, mode: 'insensitive' },
                  },
                },
              ],
            },
          });
          return query;
        } catch (error) {
          throw new Error(`failed to search pins: ${error}`);
        }
      },
    });

    //Feed
    t.list.field('feed', {
      type: 'Post',
      async resolve(_, _args, ctx) {
        try {
          return ctx.prisma.post.findMany({
            orderBy: { createdAt: 'asc' },
          });
        } catch (error) {
          throw new Error(`failed to search pins: ${error}`);
        }
      },
    });

    //Get signle PinDetail
    t.field('getPin', {
      type: 'Post',
      args: {
        postId: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        try {
          const post = await ctx.prisma.post.findUnique({
            where: { id: args.postId },
            rejectOnNotFound: true,
          });
          return post;
        } catch (error) {
          throw new Error(`failed to getSinglePost: ${error}`);
        }
      },
    });

    t.list.field('more', {
      type: 'Post',
      args: {
        category: nonNull(stringArg()),
        postId: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        return ctx.prisma.post.findMany({
          take: 10,
          where: {
            category: { is: { name: args.category } },
            NOT: { id: args.postId },
          },
        });
      },
    });
  },
});
