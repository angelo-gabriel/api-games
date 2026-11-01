const fp = require("fastify-plugin");
const fastifyMongo = require("@fastify/mongodb");

async function dbConnector(fastify, options) {
  await fastify.register(fastifyMongo, {
    forceClose: true,
    url: "mongodb://admin:secret@127.0.0.1:27017/api_games?authSource=admin",
  });

  const db = fastify.mongo.db;
  if (db) {
    await db.collection("games").createIndex({ slug: 1 }, { unique: true });
  }
}

module.exports = fp(dbConnector);
