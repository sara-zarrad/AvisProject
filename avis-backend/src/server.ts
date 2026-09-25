import { app } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Erreur au démarrage:", err);
  process.exit(1);
});