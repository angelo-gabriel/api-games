// plugins/swagger.js
const fp = require("fastify-plugin");
const fastifySwagger = require("@fastify/swagger");
const fastifySwaggerUi = require("@fastify/swagger-ui");

async function swaggerConnector(fastify, options) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Games API",
        description: "Documentação da API de gerenciamento de jogos",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3333",
          description: "Ambiente local",
        },
      ],
      tags: [{ name: "Games", description: "Endpoints relacionados a jogos" }],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

module.exports = fp(swaggerConnector);
