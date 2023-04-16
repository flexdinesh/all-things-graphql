import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import { prisma } from "../../lib/prisma";

const getSchema = (fastify: FastifyInstance) => {
  const schema = makeExecutableSchema<{ reply: FastifyReply }>({
    typeDefs: [
      `
      schema {
        query: Query
      }

      type Query {
        users: [User]!
        posts(userId: ID!): [Post]!
      }

      type User {
        id: ID!
        firstName: String!
        lastName: String!
        posts: [Post]!
      }

      type Post {
        id: ID!
        content: String!
        comments: [Comment]!
      }

      type Comment {
        id: ID!
        content: String!
      }
    `,
    ],
    resolvers: [
      {
        Query: {
          users: async (_parent, _args, context) => {
            return prisma.user.findMany();
          },
          posts: async (_parent, { userId }, context) => {
            return prisma.post.findMany({ where: { userId } });
          },
        },
        User: {
          posts: async ({ id: userId }, _args, context) => {
            return prisma.post.findMany({ where: { userId } });
          },
        },
        Post: {
          comments: async ({ id: postId }, _args, context) => {
            return prisma.comment.findMany({ where: { postId } });
          },
        },
      },
    ],
  });
  return schema;
};

const graphql: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // This will allow Fastify to forward multipart requests to GraphQL Yoga
  fastify.addContentTypeParser(
    "multipart/form-data",
    {},
    (req, payload, done) => done(null)
  );

  const schema = getSchema(fastify);
  const yoga = createYoga<{
    req: FastifyRequest;
    reply: FastifyReply;
  }>({
    schema,
    // context: async ({ req, reply }) => {
    //   return { reply };
    // },
  });
  /**
   * We pass the incoming HTTP request to GraphQL Yoga
   * and handle the response using Fastify's `reply` API
   * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
   **/
  fastify.route({
    url: "/",
    method: ["GET", "POST", "OPTIONS"],
    handler: async (request, reply) => {
      // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
      const response = await yoga.handleNodeRequest(request, {
        req: request,
        reply,
      });
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);

      reply.send(response.body);

      return reply;
    },
  });
};

export default graphql;
