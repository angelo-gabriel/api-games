const fastify = require("fastify");
const mongoPlugin = require("./plugins/mongo");
const swaggerPlugin = require("./plugins/swagger");
const gameRoutes = require("./routes/games");

const app = fastify({
  logger: true,
});

async function main() {
  try {
    await app.register(swaggerPlugin);

    await app.register(mongoPlugin);

    await app.register(gameRoutes, { prefix: "/api/v1" });

    await app.ready();

    const port = Number(process.env.PORT || 3333);
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Documentação disponível em http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Recebido ${signal}, encerrando servidor...`);
    await app.close();
    process.exit(0);
  });
});

main();
