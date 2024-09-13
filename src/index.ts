import { existsSync } from 'node:fs'
import path from 'node:path'
import { createExtension, createFakeProgress, createSelect, message, registerCommand } from '@vscode-use/utils'
import { isWin, jsShell } from 'lazy-js-utils'

export = createExtension(() => {
  const AdmZip = require('adm-zip')
  const compressing = require('compressing')
  let resolver: (value?: string) => void
  let rejecter: (reason: string) => void
  return [
    registerCommand('zip.zip', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.zip`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output)) {
        createFakeProgress({
          title: '压缩中',
          message: v => `已压缩 ${v}%，请稍等...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.zip.compressDir(url, output)
          .then(() => {
            resolver()
            message.info({
              message: `已生成 ${output} 🎉`,
              buttons: ['复制'],
            }).then(() => {
              const filePath = new URL(`file://${output}`).href
              if (isWin()) {
                // not test
                jsShell(`powershell -command "Set-Clipboard -Path '${filePath}'"`)
              }
              else {
                jsShell(`osascript -e 'tell application "Finder" to set the clipboard to (POSIX file "${filePath}")'`)
              }
            })
          })
          .catch((err: Error) => {
            rejecter(err.message)
          })
      }
    }),
    registerCommand('zip.tar', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.tar`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output)) {
        createFakeProgress({
          title: '压缩中',
          message: v => `已压缩 ${v}%，请稍等...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.tar.compressDir(url, output)
          .then(() => {
            resolver()
            message.info({
              message: `已生成 ${output} 🎉`,
              buttons: ['复制'],
            }).then(() => {
              const filePath = new URL(`file://${output}`).href
              if (isWin()) {
                // not test
                jsShell(`powershell -command "Set-Clipboard -Path '${filePath}'"`)
              }
              else {
                jsShell(`osascript -e 'tell application "Finder" to set the clipboard to (POSIX file "${filePath}")'`)
              }
            })
          })
          .catch((err: Error) => {
            rejecter(err.message)
          })
      }
    }),
    registerCommand('zip.gzip', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.gz`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output)) {
        createFakeProgress({
          title: '压缩中',
          message: v => `已压缩 ${v}%，请稍等...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.tgz.compressDir(url, output)
          .then(() => {
            resolver()
            message.info({
              message: `已生成 ${output} 🎉`,
              buttons: ['复制'],
            }).then(() => {
              const filePath = new URL(`file://${output}`).href
              if (isWin()) {
                // not test
                jsShell(`powershell -command "Set-Clipboard -Path '${filePath}'"`)
              }
              else {
                jsShell(`osascript -e 'tell application "Finder" to set the clipboard to (POSIX file "${filePath}")'`)
              }
            })
          })
          .catch((err: Error) => {
            rejecter(err.message)
          })
      }
    }),
    registerCommand('zip.rar', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.rar`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output)) {
        createFakeProgress({
          title: '压缩中',
          message: v => `已压缩 ${v}%，请稍等...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        const zip = new AdmZip()
        zip.addLocalFolder(url)
        try {
          await zip.writeZipPromise(output)
          resolver()
        }
        catch (error) {
          rejecter(String(error))
          return
        }
        message.info({
          message: `已生成 ${output} 🎉`,
          buttons: ['复制'],
        }).then(() => {
          const filePath = new URL(`file://${output}`).href
          if (isWin()) {
            // not test
            jsShell(`powershell -command "Set-Clipboard -Path '${filePath}'"`)
          }
          else {
            jsShell(`osascript -e 'tell application "Finder" to set the clipboard to (POSIX file "${filePath}")'`)
          }
        })
      }
    }),
  ]
})

async function isExist(output: string) {
  if (existsSync(output)) {
    if (await createSelect(['覆盖', '取消'], {
      placeholder: '文件已存在，是否覆盖？',
      title: '提示',
    }) === '覆盖') {
      return true
    }

    message.info('已取消')
    return false
  }
  return true
}
