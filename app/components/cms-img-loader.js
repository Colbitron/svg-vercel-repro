"use client";

import { getBaseUrl } from "@/next.config.mjs";

export default function loader({ src, width, quality }) {
	const url = new URL(src, getBaseUrl());
	return `/api/v1/dsn/images${url.pathname}?w=${width}&q=${quality || 75}&cb=1`;
}