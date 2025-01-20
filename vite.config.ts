import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@supabase/supabase-js',
            'jspdf',
            'recharts'
          ],
          ui: [
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-tabs',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            'class-variance-authority',
            'lucide-react'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react', 'react-dom', 'lucide-react'],
    exclude: [
      'class-variance-authority',
      'react-hook-form',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      'recharts',
      '@radix-ui/react-label',
      'react-router-dom',
      'jspdf',
      '@radix-ui/react-tabs',
      '@supabase/auth-ui-shared',
      '@radix-ui/react-alert-dialog',
      '@hookform/resolvers/zod',
      '@radix-ui/react-dialog'
    ],
    esbuildOptions: {
      jsx: 'automatic'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));