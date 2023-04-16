import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma";

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const users = await prisma.user.findMany();
    return { users };
  });

  fastify.get("/:id", async function (request, reply) {
    const { id } = request.params as any;
    if (typeof id !== "string") {
      throw new Error("uh oh");
    }
    console.log({ id });
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return user;
  });
};

export default users;
