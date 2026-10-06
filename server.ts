import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());
app.use('/api', apiRouter);

// Static frontend serving for production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
// Only start standalone if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JITENDRA PROMPTS production server running on port ${PORT}`);
  });
}
