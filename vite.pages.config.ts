import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
 root:'github-pages',base:'./',publicDir:'../public',
 plugins:[react()],resolve:{alias:{'@':path.resolve('.')}},
 define:{__RECORD_API_BASE__:JSON.stringify(process.env.RECORD_API_BASE||'https://eunyu-daily-movement.rhymage.chatgpt.site')},
 build:{outDir:'../docs',emptyOutDir:true},
});

