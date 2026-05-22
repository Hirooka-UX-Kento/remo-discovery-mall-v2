import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project under /remo-discovery-mall-v2/.
// Keep dev at "/" so localhost works unchanged.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/remo-discovery-mall-v2/' : '/',
  plugins: [react()],
}))
