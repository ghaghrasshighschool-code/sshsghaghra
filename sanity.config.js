import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import teacher from './schemas/teacher'
import note from './schemas/note'
import notice from './schemas/notice'

const schemaTypes = [teacher, note, notice]
const projectId = 'agrubbem'; // Replace with your actual project ID from sanity.io/manage
const dataset = 'production';

export default defineConfig({
  name: 'default',
  title: 'SSHS Ghaghra Admin',

  projectId: 'agrubbem', // TODO: Replace with your actual project ID from sanity.io/manage
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})

// This part is for the Sanity Studio's client to use the token for write operations.
// It's typically handled internally by `sanity dev` but explicitly defining it
// can help with certain configurations or if you're using a custom client within the studio.
// However, the primary way for the Studio to pick up the token is via the .env file.
// If you were to use `createClient` directly within the Studio's config, it would look like this:
// import { createClient } from '@sanity/client';
// export const studioClient = createClient({
//   projectId,
//   dataset,
//   token: process.env.SANITY_API_TOKEN,
//   useCdn: false, // Studio should always fetch fresh data
// });