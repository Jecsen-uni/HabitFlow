import { createApp } from "./app";
import { env } from "./config/env";

async function bootstrap() {
  const app = await createApp();
  await app.listen(env.PORT);
  console.log(`Habit tracker API running on http://localhost:${env.PORT}`);
}

void bootstrap();
