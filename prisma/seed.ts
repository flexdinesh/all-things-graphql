import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  for await (const _ of [
    ...Array(faker.datatype.number({ min: 5, max: 10 })).keys(),
  ]) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    await prisma.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        posts: {
          create: [
            ...Array(faker.datatype.number({ min: 0, max: 4 })).keys(),
          ].map(() => {
            return {
              content: faker.lorem.words(10),
              viewCount: faker.datatype.number({ min: 5, max: 30 }),
              comments: {
                create: [
                  ...Array(faker.datatype.number({ min: 0, max: 3 })).keys(),
                ].map(() => {
                  return {
                    content: faker.lorem.words(6),
                  };
                }),
              },
            };
          }),
        },
      },
    });
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
