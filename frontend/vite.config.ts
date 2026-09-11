import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * Dev-only Anthropic proxy.
 *
 * The API key is read from the SERVER environment (ANTHROPIC_API_KEY) and never
 * reaches the browser bundle. If no key is present the endpoint replies 503 and
 * the app falls back to its offline sentence engine — the product is designed to
 * work fully without AI, so this is a normal state, not an error.
 *
 * For production, replace this with an equivalent server route / edge function.
 */
function anthropicProxy(): Plugin {
  return {
    name: 'sawaal-anthropic-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        const key = process.env.ANTHROPIC_API_KEY
        res.setHeader('Content-Type', 'application/json')
        if (!key) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'offline' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const upstream = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
          })
          res.statusCode = upstream.status
          res.end(await upstream.text())
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'upstream' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), anthropicProxy()],
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  server: { port: 5173 },
  build: {
    target: 'es2020',
    cssTarget: 'safari15',
    rollupOptions: {
      output: {
        // React changes far less often than the app does; keeping it in its own
        // chunk means a redeploy does not invalidate it in anyone's cache.
        manualChunks: {
          react: ['react', 'react-dom'],
          qr: ['qrcode.react'],
        },
      },
    },
  },
})
