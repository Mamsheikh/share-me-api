import { objectType } from 'nexus';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('user', {
      type: 'User',
    });
    t.string('accessToken');
  },
});

export const SavePayload = objectType({
  name: 'SavePayload',
  definition(t) {
    t.boolean('success');
    t.string('message');
  },
});
