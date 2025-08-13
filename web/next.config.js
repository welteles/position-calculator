/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		optimizePackageImports: ["position-calculator"],
	},
};

module.exports = nextConfig;
