import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.routes';
import userProfileRoutes from './routes/user-profile.routes';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/user-profile', userProfileRoutes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

export { app };
export default app;