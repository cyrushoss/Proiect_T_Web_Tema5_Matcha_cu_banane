import { createApp } from './app.js';
import { initDb } from './models/index.js';
import { config } from './config/env.js';

await initDb();
createApp().listen(config.port, () => {
  console.log(`API pornit pe http://localhost:${config.port} (${config.env})`);
});
