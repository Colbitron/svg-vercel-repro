"use server";

import { cmsGraphQLFetch } from '@/lib/globals';

export default async function serverCMSGraphQL() {
	return cmsGraphQLFetch(arguments[0]);
}