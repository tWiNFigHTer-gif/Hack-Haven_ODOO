import { app } from './app';
import { env } from './config/env';

export { prisma } from './db/prisma';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
