import {defineConfig} from 'vite';
//@ts-ignore
import path from "path";

export default defineConfig({
    root: path.resolve(__dirname, "../src/"),
    publicDir: path.resolve(__dirname, '../public'),
    base: '/systems/splittermond/',
    server: {
        port: 30001,
        open: true,
        proxy: {
            '^(?!/systems/splittermond)': 'http://localhost:30000/',
            '/socket.io': {
                target: 'ws://localhost:30000',
                ws: true,
            },
        }
    },
    css: {
        preprocessorOptions: {
            less: {
                math: "always",
                relativeUrls: true,
                javascriptEnabled: true,
            }
        }
    },
    build: {
        outDir: path.resolve(__dirname, '../dist'),
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            name: 'splittermond',
            entry: 'splittermond.js',
            formats: ['es'],
            fileName: 'splittermond'
        },
        rollupOptions: {
            output: {
                assetFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'style.css')
                        return 'splittermond.css'
                }
            }
        }
    },
})
