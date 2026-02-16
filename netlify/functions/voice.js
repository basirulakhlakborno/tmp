import { handleRequest } from '../src/router.js';

// Netlify entrypoint – delegate to the router in src/
export const handler = async (event, context) => handleRequest(event, context);
