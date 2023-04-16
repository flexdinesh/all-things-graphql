import fastify from "fastify";
import pino from "pino";
import AltairFastify from "altair-fastify-plugin";
import users from "./routes/users";
import graphql from "./routes/graphql";

const startServer = async (): Promise<void> => {
  const server = fastify({
    logger: pino({ level: "info" }),
  });

  server.register(users, { prefix: "/users" });
  server.register(graphql, { prefix: "/graphql" });

  server.get("/", async (request, reply) => {
    reply.status(200).send({
      health: "OK",
    });
  });

  server.register(AltairFastify, {
    path: "/altair",
    baseURL: "/altair/",
    endpointURL: "/graphql",
  });

  await server.listen({ port: 3000 });
};


process.on("unhandledRejection", (e) => {
  console.error(e);
  process.exit(1);
});

startServer().catch((e) => {
  console.error(e);
});

