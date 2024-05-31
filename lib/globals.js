export const cmsServer = "https://anglepoint.wpenginepowered.com";

/**
 * If the image URL is from our WordPress CMS server, it will return the URL to the image from our API.
 * @param {String} passedURL - The URL to the image.
 * @returns {[String, Boolean]} - The URL to the image and whether it was changed to use the DSN.
 */
export function dsnImage(passedURL) {
	if (passedURL.includes(cmsServer)) {
		const url = new URL(passedURL);
		// Assuming standard WordPress URL structure for images. Gets rid of the `/wp-content/uploads/` part of the URL.
		const path = url.pathname.split('/');
		const id = path.slice(3).join('/');
		return [`/${id}`, true];
	}
	return [passedURL, false];
}

/**
 * 
 * @param {Object} config - Configuration for sending a graphql request.
 * @param {Number} [config.attempt=0] - The current attempt number.
 * @param {Number} [config.delay=300] - The delay between attempts in milliseconds.
 * @param {Number} [config.maxAttempts=5] - The maximum number of attempts.
 * @param {Boolean} [config.jitter=true] - Whether to add jitter to the delay.
 * @param {String} config.query - The GraphQL query to send.
 * @param {Object} [config.variables={}] - The GraphQL variables to send.
 * @param {Number} [config.revalidate=300] - The number of seconds to wait before revalidating.
 * @param {String} [config.method=POST] - The HTTP method to use.
 * @param {Object} [config.headers=null] - The HTTP headers to send.
 * @returns {Promise<Object>} - The response from the server.
 */
export function cmsGraphQLFetch(config) {
	const { attempt, delay, maxAttempts, jitter, query, variables, revalidate, method, headers } = { attempt: 0, delay: 300, maxAttempts: 5, jitter: true, query: '', variables: {}, revalidate: parseInt(process.env.DEFAULT_NEXT_REVALIDATION), method: 'POST', headers: null, ...config };
	const isPost = method.toUpperCase() === 'POST';
	const isGet = method.toUpperCase() === 'GET';

	if (!query) {
		console.trace();
		throw new Error('query is required');
		return;
	}

	const body = (() => {
		if (isPost) {
			return JSON.stringify({
				query,
				variables
			});
		}
		const regexp = /[\n\t]/g;
		let body = '?query=';
		// Remove newlines and tabs, separate items with commas
		body += encodeURIComponent(query.replace(regexp, ''));
		if (variables) body += `&variables=${encodeURIComponent(JSON.stringify(variables))}`;
		return body;
	})();
	const defaultDelay = delay;
	const options = {
		method,
		mode: 'cors',
		next: {
			revalidate
		}
	};
	if (headers) options.headers = headers;
	if (isPost) {
		const appJson = { 'Content-Type': 'application/json' };
		if (headers) options.headers = { ...headers, ...appJson };
		else options.headers = appJson;
		options.body = body;
	}
	if (process.env.VERCEL_ENV !== 'production') {
		options.headers = {
			...options.headers,
			'X-WP-SHOW-DRAFTS': 'true'
		};
	}
	function tryAgain(err) {
		const tries = attempt + 1;
		const jitterAmount = jitter ? Math.random() * 2 : 0;
		if (tries > maxAttempts) throw new Error(err);
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(cmsGraphQLFetch({ attempt: tries, delay, maxAttempts, jitter, query, variables, revalidate, method, headers }));
			}, defaultDelay * jitterAmount * tries);
		});
	}
	return fetch(`${cmsServer}/graphql${isGet ? body : ''}`, options).then(res => {
		return res.json().then(json => json, err => tryAgain(err));
	}, err => tryAgain(err));
}