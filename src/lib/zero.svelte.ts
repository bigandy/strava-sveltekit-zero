// import { PUBLIC_SERVER } from '$env/static/public';
import { Z } from 'zero-svelte';
import { schema, type Schema } from './schema';


export const z = new Z<Schema>({
	server: 'http://localhost:4848',
	schema,
	userID: 'anon',
	kvStore: 'mem'
});