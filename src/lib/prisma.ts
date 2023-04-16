import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

function randomDelay() {
  const randomMs = (Math.floor(Math.random() * 10) + 1) * 100;
  return new Promise((resolve) => setTimeout(() => resolve(true), randomMs));
}

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  await randomDelay();
  const after = Date.now();

  console.log(
    `Query ${params.model}.${params.action} took ${
      after - before
    }ms. args: ${JSON.stringify(params.args)}.`
  );

  return result;
});
