import { objectType } from 'nexus';

//Post Model
export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.string('id'),
      t.string('title'),
      t.string('about'),
      t.string('destination');
    t.string('image');
    t.string('userId'),
      t.nullable.list.field('save', {
        type: 'Save',
        async resolve(root, _args, ctx) {
          return await ctx.prisma.post
            .findUnique({
              where: { id: root.id },
            })
            .save();
        },
      }),
      t.nullable.field('user', {
        type: 'User',
        async resolve(root, _, ctx) {
          return await ctx.prisma.post
            .findUnique({
              where: { id: root.id },
              rejectOnNotFound: true,
            })
            .user();
        },
      }),
      t.list.field('comments', {
        type: 'Comment',
        async resolve(root, _args, ctx) {
          return await ctx.prisma.post
            .findUnique({
              where: {
                id: root.id,
              },
              rejectOnNotFound: true,
            })
            .comments();
        },
      });
    t.field('category', {
      type: 'Category',
      resolve(root, _, ctx) {
        return ctx.prisma.post
          .findUnique({
            where: { id: root.id },
            // rejectOnNotFound: true,
          })
          .category();
      },
    });
  },
});
