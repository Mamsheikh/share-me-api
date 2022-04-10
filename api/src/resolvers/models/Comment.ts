import { objectType } from 'nexus';

export const Comment = objectType({
  name: 'Comment',
  definition(t) {
    t.nonNull.string('id'), t.nonNull.string('content');
    t.string('userId'),
      t.nullable.field('post', {
        type: 'Post',
        async resolve(root, __, ctx) {
          return await ctx.prisma.comment
            .findUnique({
              where: { id: root.id },
              rejectOnNotFound: true,
            })
            .post();
        },
      }),
      t.field('user', {
        type: 'User',
        async resolve(root, __, ctx) {
          return await ctx.prisma.comment
            .findUnique({
              where: { id: root.id },
              rejectOnNotFound: true,
            })
            .user();
        },
      });
  },
});
