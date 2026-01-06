/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow video files to be served
  async headers() {
    return [
      {
        source: '/scolo-demo.mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Increase body size limit for video files
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./public/**/*'],
    },
  },
};

module.exports = nextConfig;