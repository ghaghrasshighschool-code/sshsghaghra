import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: 'agrubbem', 
    dataset: 'production',
    useCdn: true, // `false` if you want fresh data on every fetch
    apiVersion: '2024-03-11', // Specifying a date prevents "missing apiVersion" errors
    // token: process.env.VITE_SANITY_TOKEN, // Only needed for authenticated/write requests
});