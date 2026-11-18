import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDev ? '.next-dev' : '.next',
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    experimental: {
      webpackMemoryOptimizations: true,
      optimizePackageImports: [
        'lucide-react',
        'motion',
        'motion/react',
        'date-fns',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@base-ui/react',
        'react-markdown',
        'remark-gfm',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        '@aws-sdk/client-s3',
      ],
    },
    // Allow access to remote image placeholder and Google user avatars.
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // This allows any path under the hostname
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    ...(isDev ? {} : { output: 'standalone' as const }),
    webpack: (config, {dev}) => {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
}
