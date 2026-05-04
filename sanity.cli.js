import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'agrubbem', // TODO: Replace with your actual project ID
    dataset: 'production'
  }
})