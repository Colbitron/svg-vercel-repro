export function getBaseUrl() {
	switch (process.env.VERCEL_ENV) {
		case 'production':
			return 'https://www.anglepoint.com';
		case 'preview':
			if (process.env.VERCEL_URL) {
				return `https://${process.env.VERCEL_URL}`;
			}
		default:
			return 'http://localhost:3000';
	}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		origin: getBaseUrl()
	},
	trailingSlash: true,
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		formats: ['image/avif', 'image/webp',],
		deviceSizes: [
			768,
			960,
			1920,
			2560
		],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.anglepoint.com'
			},
			{
				protocol: 'https',
				hostname: 'anglepoint.wpenginepowered.com'
			},
			{
				protocol: 'https',
				hostname: getBaseUrl().replace('https://', '')
			},
			{
				protocol: 'http',
				hostname: 'localhost'
			}
		]
	},
	trailingSlash: true,
	async headers() {
		return [
			{
				source: '/:slug*', // Match any path
				headers: [
					{ key: 'Cache-Control', value: 'max-age=180, s-maxage=600, stale-while-revalidate=259200' }
				]
			},
			{
				source: '/:slug(wp-content.+)',
				headers: [
					{
						key: 'Access-Control-Allow-Origin',
						value: 'https://anglepoint.wpenginepowered.com'
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET, OPTIONS'
					}
				]
			}
		]
	}
};

export default nextConfig;
