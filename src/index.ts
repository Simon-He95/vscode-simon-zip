import path from 'node:path'
import { createExtension, createSelect, message, registerCommand } from '@vscode-use/utils'
import { existsSync } from 'node:fs'

export = createExtension(() => {
  const AdmZip = require('adm-zip')
  const compressing = require('compressing')
  return [
    registerCommand('zip.zip', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.zip`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output))
        compressing.zip.compressDir(url, output)
          .then(() => {
            message.info(`已生成 ${output} 🎉`)
          })
          .catch((err: Error) => {
            message.error(err.message)
          })
    }),
    registerCommand('zip.tar', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.tar`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output))
        compressing.tar.compressDir(url, output)
          .then(() => {
            message.info(`已生成 ${output} 🎉`)
          })
          .catch((err: Error) => {
            message.error(err.message)
          })
    }),
    registerCommand('zip.gzip', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.gz`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output))
        compressing.tgz.compressDir(url, output)
          .then(() => {
            message.info(`已生成 ${output} 🎉`)
          })
          .catch((err: Error) => {
            message.error(err.message)
          })
    }),
    registerCommand('zip.rar', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.rar`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output)) {
        const zip = new AdmZip()
        zip.addLocalFolder(url)
        zip.writeZip(output)
      }
    }),
  ]
})


async function isExist(output: string) {
  if (existsSync(output)) {
    if (await createSelect(['覆盖', '取消'], {
      placeholder: '文件已存在，是否覆盖？',
      title: '提示',
    }) === '覆盖')
      return true

    message.info('已取消')
    return false
  }
  return true
}
