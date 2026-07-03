import { defineCliConfig } from 'sanity/cli'

const projectId = 'agrubbem'
const dataset = 'production'

export default defineCliConfig({
  api: { projectId, dataset }
})