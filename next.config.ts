
import type {NextConfig} from 'next';

const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel 서버리스 함수 타임아웃 연장 (하이픈 API 간편인증 대기 시간 확보)
  // Vercel Pro: 최대 300초, Hobby: 최대 60초
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/ko', destination: '/?lang=ko', permanent: false },
      { source: '/ko/estimate', destination: '/estimate?lang=ko', permanent: false },
      { source: '/vi', destination: '/?lang=vi', permanent: false },
      { source: '/vi/estimate', destination: '/estimate?lang=vi', permanent: false },
      { source: '/zh', destination: '/?lang=zh', permanent: false },
      { source: '/zh/estimate', destination: '/estimate?lang=zh', permanent: false },
      { source: '/km', destination: '/?lang=km', permanent: false },
      { source: '/km/estimate', destination: '/estimate?lang=km', permanent: false },
      { source: '/ne', destination: '/?lang=ne', permanent: false },
      { source: '/ne/estimate', destination: '/estimate?lang=ne', permanent: false },
      { source: '/uz', destination: '/?lang=uz', permanent: false },
      { source: '/uz/estimate', destination: '/estimate?lang=uz', permanent: false },
      { source: '/my', destination: '/?lang=my', permanent: false },
      { source: '/my/estimate', destination: '/estimate?lang=my', permanent: false },
      { source: '/id', destination: '/?lang=id', permanent: false },
      { source: '/id/estimate', destination: '/estimate?lang=id', permanent: false },
      { source: '/th', destination: '/?lang=th', permanent: false },
      { source: '/th/estimate', destination: '/estimate?lang=th', permanent: false },
      { source: '/en', destination: '/?lang=en', permanent: false },
      { source: '/en/estimate', destination: '/estimate?lang=en', permanent: false },
      { source: '/si', destination: '/?lang=si', permanent: false },
      { source: '/si/estimate', destination: '/estimate?lang=si', permanent: false },
      { source: '/mn', destination: '/?lang=mn', permanent: false },
      { source: '/mn/estimate', destination: '/estimate?lang=mn', permanent: false },
      { source: '/bn', destination: '/?lang=bn', permanent: false },
      { source: '/bn/estimate', destination: '/estimate?lang=bn', permanent: false },
      { source: '/kk', destination: '/?lang=kk', permanent: false },
      { source: '/kk/estimate', destination: '/estimate?lang=kk', permanent: false },
      { source: '/ur', destination: '/?lang=ur', permanent: false },
      { source: '/ur/estimate', destination: '/estimate?lang=ur', permanent: false },
    ];
  },
};

export default nextConfig;
