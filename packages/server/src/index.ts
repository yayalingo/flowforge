import { buildApp } from './app';

const port = parseInt(process.env.SERVER_PORT || '3001', 10);

async function main() {
  const app = await buildApp();
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`FlowForge server running on port ${port}`);
}

main().catch(console.error);
