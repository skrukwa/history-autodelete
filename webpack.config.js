import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    mode: 'production',
    entry: {
        popup: './src/popup.tsx',
        background: './src/background.ts',
    },
    output: {
        path: resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }],
    },
    plugins: [new CopyWebpackPlugin({
        patterns: [
            { from: 'src/manifest.json' },
            { from: 'src/popup.html' },

            {
                from: 'public',
                to: 'public',
                globOptions: { ignore: ['**.psd'] },
            }
        ],
    })],
};