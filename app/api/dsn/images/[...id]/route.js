import { cmsServer } from "@/lib/globals";
import { getBaseUrl } from "@/next.config.mjs";
/** 
 * @param {import('next/server').NextRequest} request
 * @param {Object} params
 * @param {string[]} params.id
 * @returns {Promise<Response>}
 */
export function GET(request, { params }) {
	const id = params.id.join('/');
	const isSVG = id.split('.').pop() === 'svg';
	const url = `${cmsServer}/wp-content/uploads/${id}`;
	request.nextUrl.searchParams.set('url', url);
	const nextImgUrl = new URL(`/_next/image/?${request.nextUrl.searchParams.toString()}`, getBaseUrl());
	const opts = { headers: { 'Accept': request.headers.get('Accept') } };

	if (isSVG) {
		return fetch(nextImgUrl, opts).then(async response => {
			if (response.status === 200) {
				return new Response(await response.text(), {
					headers: {
						...response.headers,
						'Content-Type': 'image/svg+xml'
					}
				});
			} else if (response.ok) {
				//throw new Error("SVG Response not 200 but ok: " + response.status + " " + response.statusText);
				return response;
			}
			return response;
		}, e => {
			throw e;
		})
	}

	return fetch(nextImgUrl, opts).then(response => {
		if (response.status === 200) {
			return response;
		} else if (response.ok) {
			//console.error("Response not 200 but ok", response.status, response.statusText);
			return response;
		}
		throw new Error(response);
	}, e => {
		throw e;
	})
}