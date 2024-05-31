"use client";

export default function loader({ src, width, quality }) {
	const params = new URLSearchParams();
	params.set('url', src);
	params.set('w', width);
	params.set('q', quality || 75);
	return `/_next/image/?${params.toString()}`;
}