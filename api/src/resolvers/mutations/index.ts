const { OAuth2Client } = require('google-auth-library');
import { UserInputError } from 'apollo-server-core';
import { arg, extendType, mutationField, nonNull, stringArg } from 'nexus';
import {
  createTokens,
  getRefreshCookie,
  removeRefreshCookie,
} from '../../utils/auth';
import { authorize } from '../../utils/authorize';
import { CreatePinInput } from '../inputs';
import { User } from '../models';
import { AuthPayload, SavePayload } from '../payloads';

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_ID,
  // redirectUri: <your_redirect_uri>
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    //Create User
    t.field('googleLogin', {
      type: AuthPayload,
      args: {
        tokenId: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        try {
          const clientId = process.env.GOOGLE_ID;
          const { payload } = await oAuth2Client.verifyIdToken({
            idToken: args.tokenId,
            audience: clientId,
          });
          // console.log(payload);
          if (payload.email_verified) {
            const user = await ctx.prisma.user.findUnique({
              where: { email: payload.email },
              // rejectOnNotFound: true,
            });

            if (!user) {
              const newUser = await ctx.prisma.user.create({
                data: {
                  name: payload.name,
                  email: payload.email,
                  image: payload.picture,
                },
              });
              const { accessToken } = await createTokens(
                { userId: newUser.id },
                ctx
              );
              return {
                user: newUser,
                accessToken,
              };
            }

            const { accessToken } = await createTokens(
              { userId: user.id },
              ctx
            );
            return {
              user,
              accessToken,
            };
          }
        } catch (error) {
          throw new Error(`failed to login with google: ${error}`);
        }
      },
    });

    //Add to saved
    t.field('savePost', {
      type: SavePayload,
      args: { postId: nonNull(stringArg()), userId: nonNull(stringArg()) },
      async resolve(_, args, ctx) {
        try {
          const isExist = await ctx.prisma.save.findFirst({
            where: { AND: [{ userId: ctx.user?.id }, { postId: args.postId }] },
          });
          // console.log('isExist', isExist);
          // console.log(ctx.user?.id);
          if (isExist) {
            await ctx.prisma.save.deleteMany({
              where: {
                AND: [{ userId: ctx.user?.id }, { postId: args.postId }],
              },
            });
            return {
              success: true,
              message: 'Pin unsaved',
            };
          } else {
            await ctx.prisma.save.create({
              data: {
                user: {
                  connect: { id: args.userId },
                },
                post: { connect: { id: args.postId } },
              },
            });
            return {
              success: true,
              message: 'Pin Saved',
            };
          }
        } catch (error) {
          console.log(error);
          throw new Error(`failed to toggleSave: ${error}`);
        }
      },
    });

    //Create Pin

    t.field('createPin', {
      type: 'Post',
      args: {
        input: nonNull(CreatePinInput),
      },
      async resolve(_, args, ctx) {
        const user = await authorize(ctx);

        return await ctx.prisma.post.create({
          data: {
            title: args.input.title,
            about: args.input.about,
            destination: args.input.destination,
            image: args.input.image,
            user: { connect: { id: user?.id } },
            category: { connect: { name: args.input.category } },
          },
        });
      },
    });

    //Delete Pin

    t.field('deletePin', {
      type: 'Post',
      args: {
        postId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        try {
          const viewer = await authorize(ctx);
          const post = await ctx.prisma.post.findUnique({
            where: { id: args.postId },
            rejectOnNotFound: true,
          });
          if (post.userId !== viewer?.id) {
            throw 'not your post';
          }
          return await ctx.prisma.post.delete({
            where: { id: args.postId },
          });
        } catch (error) {
          throw new Error(`failed to delete pin: ${error}`);
        }
      },
    });

    //Add Comment

    t.field('addComment', {
      type: 'Comment',
      args: {
        postId: nonNull(stringArg()),
        content: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        const user = await authorize(ctx);
        try {
          const comment = await ctx.prisma.comment.create({
            data: {
              content: args.content,
              post: { connect: { id: args.postId } },
              user: { connect: { id: user?.id } },
            },
          });
          return comment;
        } catch (error) {
          throw new Error(`failed to create comment: ${error}`);
        }
      },
    });
  },
});

export const refreshAuth = mutationField('refreshAuth', {
  type: nonNull(AuthPayload),
  resolve: async (_root, _args, ctx) => {
    const refreshCookie = getRefreshCookie(ctx);
    if (!refreshCookie) throw new Error('invalid cookie');

    const user = await ctx.prisma.user.findFirst({
      where: { id: refreshCookie.userId },
    });
    if (!user) throw new UserInputError('invalid user');

    const { accessToken } = await createTokens({ userId: user.id }, ctx);

    return { user: user, accessToken };
  },
});

export const logout = mutationField('logout', {
  type: nonNull(User),
  resolve: async (_root, _args, ctx) => {
    const refreshCookie = getRefreshCookie(ctx);
    if (!refreshCookie) {
      throw new Error('invalid cookie');
    }

    removeRefreshCookie(ctx);

    return await ctx.prisma.user.findFirst({
      where: { id: refreshCookie.userId },
      rejectOnNotFound: true,
    });
  },
});
