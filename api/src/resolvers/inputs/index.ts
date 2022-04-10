import { inputObjectType } from 'nexus';

export const CreatePinInput = inputObjectType({
  name: 'CreatePinInput',
  definition(t) {
    t.nonNull.string('title');
    t.nonNull.string('about');
    t.nonNull.string('destination');
    t.nonNull.string('image');
    t.nonNull.string('category');
  },
});
