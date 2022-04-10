import { enumType, objectType } from 'nexus';

//User Model
export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id'),
      t.string('name'),
      t.string('email'),
      t.string('image'),
      t.nonNull.list.nonNull.field('posts', {
        type: 'Post',
        async resolve(root, _args, ctx) {
          return await ctx.prisma.user
            .findUnique({
              where: {
                id: root.id,
              },
              rejectOnNotFound: true,
            })
            .posts();
        },
      });
    t.nullable.list.field('save', {
      type: 'Save',
      async resolve(root, _args, ctx) {
        return await ctx.prisma.user
          .findUnique({
            where: {
              id: root.id,
            },
            rejectOnNotFound: true,
          })
          .save();
      },
    });
    t.list.field('comments', {
      type: 'Comment',
      resolve(root, _, ctx) {
        return ctx.prisma.user
          .findUnique({
            where: { id: root.id },
            rejectOnNotFound: true,
          })
          .comments();
      },
    });
  },
});
