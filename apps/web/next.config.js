/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            new URL("https://kg0jqt5xfj0zxs72.public.blob.vercel-storage.com/**"),
            new URL("https://cdn.discordapp.com/avatars/**?size=4096")
        ]
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    }
};

export default config;
