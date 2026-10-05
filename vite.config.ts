import { defineConfig } from 'vite';

// Vercel sets VERCEL_GIT_COMMIT_SHA during builds; the footer shows which commit is live.
const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7) || 'local';

export default defineConfig({
  define: {
    __COMMIT__: JSON.stringify(commit),
  },
});
