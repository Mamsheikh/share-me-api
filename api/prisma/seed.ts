import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const categories = [
  {
    name: 'cars',
  },
  {
    name: 'fitness',
  },
  {
    name: 'wallpaper',
  },
  {
    name: 'websites',
  },
  {
    name: 'photo',
  },
  {
    name: 'food',
  },
  {
    name: 'nature',
  },
  {
    name: 'art',
  },
  {
    name: 'travel',
  },
  {
    name: 'quotes',
  },
  {
    name: 'cats',
  },
  {
    name: 'dogs',
  },
  {
    name: 'others',
  },
];

async function main() {
  //   await prisma.user.create({
  //     data: {
  //       email: `admin@gmail.com`,
  //       name: `Muneer Ali`,
  //       isAdmin: true,
  //     },
  //   });
  await prisma.category.deleteMany({});
  await prisma.category.createMany({
    data: categories,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
