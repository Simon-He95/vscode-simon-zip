import path from 'node:path'
import { createExtension, message, registerCommand } from '@vscode-use/utils'
import { jsShell } from 'lazy-js-utils'

export = createExtension(() => {
  return [
    registerCommand('zip.zip', async (e) => {
      const url = e.fsPath
      // mac
      const basename = path.basename(url)
      const dirname = path.dirname(url)
      const targetName = `${basename.split('.')[0]}.zip`
      const { result, status } = await jsShell(`cd ${dirname} && zip -r ${targetName} ${basename}`)
      if (status === 0) {
        message.info(`已生成 ${dirname}/${targetName} 🎉`)
        return
      }
      message.error(result)
    }),
  ]
}, () => {

})
