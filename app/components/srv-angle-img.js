import { dsnImage, cmsServer } from "@/lib/globals";
import cmsGraphQLFetch from "@/app/actions/.cms-graphql";
import Image from "next/image";
import cmsLoader from "./cms-img-loader";
import stdLoader from "./std-img-loader";

export default async function AngleImg({ src, width, height }) {
	if ((/^\/\//.test(src))) src = `https:${src}`;
	if (/^\/[^\/]/.test(src)) src = `${cmsServer}${src}`;
	const args = {
		...arguments[0]
	};
	const stdImg = <img loading="lazy" decoding="async" {...args} loader={null} />;

	const passedURL = (() => {
		try {
			return new URL(src);
		} catch (e) {
			//console.error(e, src);
			return null;
		}
	})();
	if (!passedURL) return stdImg;
	const id = passedURL.pathname.split('/').pop().split('.').shift().toLowerCase();
	const dsnResults = dsnImage(src);
	let className = arguments[0]?.className;
	if (!className) className = '';
	className += ' angle-img';
	Object.assign(args, {
		src: dsnResults[0],
		className,
		loader: dsnResults[1] ? cmsLoader : stdLoader
	});
	if (args.fill) {
		delete args.width;
		delete args.height;
	}
	let useStdImg = false;

	if (dsnResults[1]) {
		if (!(width && height) && !args.fill) {
			await cmsGraphQLFetch({
				query: `query ImageSizeQuery($id: ID!) {
					mediaItem(idType: SLUG, id: $id) {
						mediaDetails {
							height,
							width
						}
					}
				}`,
				variables: { id }
			}).then(resp => {
				if (resp.data.mediaItem) {
					const width = resp.data.mediaItem.mediaDetails.width;
					const height = resp.data.mediaItem.mediaDetails.height;
					Object.assign(args, {
						width,
						height
					});
				} else {
					console.log('No mediaItem found for', id);
					useStdImg = true;
				}
			});
		}
	}

	if (useStdImg) return stdImg;
	return (dsnResults[1] && ((args.width && args.height) || args.fill)) ?
		<Image {...args} /> :
		stdImg;
};