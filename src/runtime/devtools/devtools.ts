import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { watch } from '#imports'

const inspectorId = 'nuxt-query-cache'

export const setupDevtools = (app: any, data: Record<string, any>) => {
  setupDevtoolsPlugin({
    id: 'nuxt-query',
    label: 'Nuxt Query',
    packageName: 'nuxt-query',
    app
  }, (api) => {
    api.addInspector({
      id: inspectorId,
      label: 'Nuxt Query Cache',
      icon: 'cached'
    })

    api.on.getInspectorTree((payload, context) => {
      if (payload.inspectorId === inspectorId) {
        const children: {
          id: string
          label: string
        }[] = []

        Object.entries(data).forEach((value) => {
          children.push({
            id: value[0],
            label: value[0]
          })
        })

        payload.rootNodes = [
          {
            id: 'root',
            label: 'Query Cache',
            children
          }
        ]
      }
    })

    api.on.getInspectorState((payload) => {
      if (payload.inspectorId === inspectorId) {
        Object.entries(data).forEach((value) => {
          if (payload.nodeId === value[0]) {
            payload.state = {
              Value: value[1]
            }
          }
        })
      }
    })

    watch(data, () => {
      // Update tree
      api.sendInspectorTree(inspectorId)

      // Update state
      api.sendInspectorState(inspectorId)
    }, {
      deep: true
    })
  })
}
