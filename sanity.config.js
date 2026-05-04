import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/components/index.js'


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