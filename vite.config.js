import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Use the automatic JSX runtime
            jsxRuntime: 'automatic',
            // Process both .js and .jsx files
            include: /\.(jsx?|tsx?)$/
        })
    ],

    // Dev server configuration
    server: {
        port: 3000,
        open: true,
        host: true,
        hmr: {
            overlay: false  // Disable error overlay
        }
    },

    // Build configuration  
    build: {
        outDir: 'build',
        sourcemap: true,
        chunkSizeWarningLimit: 1500,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    },

    // Resolve aliases
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/component'),
            '@resources': path.resolve(__dirname, './src/resources')
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },

    // Environment variable prefix
    envPrefix: 'VITE_',

    // Base path
    base: '/',

    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'react-redux',
            'redux',
            'axios',
            'bootstrap',
            'react-bootstrap'
        ],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
                '.jsx': 'jsx'
            },
            jsx: 'automatic'
        }
    },

    // Esbuild config for .js files
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.[jt]sx?$/,
        exclude: [],
        jsx: 'automatic'
    },

    // CSS configuration
    css: {
        devSourcemap: true
    }
});
