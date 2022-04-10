import { objectType } from 'nexus';

export const Category = objectType({
  name: 'Category',
  definition(t) {
    t.string('id'),
      t.string('name'),
      t.list.field('posts', {
        type: 'Post',
        async resolve(root, _args, ctx) {
          return await ctx.prisma.category
            .findUnique({
              where: {
                id: root.id,
              },
              rejectOnNotFound: true,
            })
            .posts();
        },
      });
  },
});
