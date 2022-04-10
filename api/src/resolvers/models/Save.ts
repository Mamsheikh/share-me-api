import { objectType } from 'nexus';

export const Save = objectType({
  name: 'Save',
  definition(t) {
    t.nonNull.string('id'),
      t.nonNull.string('userId'),
      t.nonNull.string('postId'),
      t.field('post', {
        type: 'Post',
        resolve(root, __, ctx) {
          return ctx.prisma.save
            .findUnique({
              where: { id: root.id },
              rejectOnNotFound: true,
            })
            .post();
        },
      }),
      t.nonNull.field('user', {
        type: 'User',
        resolve(root, __, ctx) {
          return ctx.prisma.save
            .findUnique({
              where: { id: root.id },
              rejectOnNotFound: true,
            })
            .user();
        },
      });
  },
});
