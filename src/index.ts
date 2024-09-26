import { existsSync } from 'node:fs'
import path from 'node:path'
import { createExtension, createFakeProgress, createLog, createSelect, getActiveTextEditorLanguageId, message, registerCommand } from '@vscode-use/utils'
import { isWin, jsShell } from 'lazy-js-utils'

const logger = createLog('simon-zip')
export = createExtension(() => {
  const AdmZip = require('adm-zip')
  const compressing = require('compressing')
  // 根据当前语言
  const isZh = getActiveTextEditorLanguageId()!.includes('zh')
  let resolver: (value?: string) => void
  let rejecter: (reason: string) => void
  const title = isZh ? '压缩中' : 'Compressing'
  return [
    registerCommand('zip.copy', async (e) => {
      copy(e.fsPath, isZh)
    }),
    registerCommand('zip.zip', async (e) => {
      const url = e.fsPath
      const basename = path.basename(url)
      const targetName = `${basename.split('.')[0]}.zip`
      const output = path.resolve(url, '..', targetName)
      if (await isExist(output, isZh)) {
        createFakeProgress({
          title,
          message: v => isZh ? `已压缩 ${v}%，请稍等...` : `Compressed ${v}%, please wait...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.zip.compressDir(url, output)
          .then(() => {
            resolver()
            copyWithMessage(output, isZh)
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
      if (await isExist(output, isZh)) {
        createFakeProgress({
          title,
          message: v => isZh ? `已压缩 ${v}%，请稍等...` : `Compressed ${v}%, please wait...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.tar.compressDir(url, output)
          .then(() => {
            resolver()
            copyWithMessage(output, isZh)
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
      if (await isExist(output, isZh)) {
        createFakeProgress({
          title,
          message: v => isZh ? `已压缩 ${v}%，请稍等...` : `Compressed ${v}%, please wait...`,
          callback(resolve, reject) {
            resolver = resolve
            rejecter = reject
          },
        })
        compressing.tgz.compressDir(url, output)
          .then(() => {
            resolver()
            copyWithMessage(output, isZh)
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
      if (await isExist(output, isZh)) {
        createFakeProgress({
          title,
          message: v => isZh ? `已压缩 ${v}%，请稍等...` : `Compressed ${v}%, please wait...`,
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
        copyWithMessage(output, isZh)
      }
    }),
  ]
})

async function isExist(output: string, isZh: boolean) {
  if (existsSync(output)) {
    if (await createSelect([isZh ? '覆盖' : 'Overwrite', isZh ? '取消' : 'Cancel'], {
      placeholder: isZh ? '文件已存在，是否覆盖？' : 'File already exists, overwrite?',
      title: isZh ? '提示' : 'Prompt',
    }) === (isZh ? '覆盖' : 'Overwrite')) {
      return true
    }

    message.info(isZh ? '已取消' : 'Cancelled')
    return false
  }
  return true
}

function copyWithMessage(output: string, isZh: boolean) {
  message.info({
    message: isZh ? `已生成 ${output} 🎉` : `Generated ${output} 🎉`,
    buttons: [isZh ? '复制' : 'Copy'],
  }).then(() => copy(output, isZh))
}

async function copy(output: string, isZh: boolean) {
  const filePath = new URL(`file://${output}`).href
  if (isWin()) {
    // not test
    const { result, status } = await jsShell(`powershell -command "Set-Clipboard -Path '${filePath}'"`)
    if (status === 0) {
      message.info(isZh ? '已复制' : 'Copied')
    }
    else {
      message.error(isZh ? '复制失败' : 'Copy failed')
      logger.error(result)
    }
  }
  else {
    const { result, status } = await jsShell(`osascript -e 'tell application "Finder" to set the clipboard to (POSIX file "${filePath}")'`)
    if (status === 0) {
      message.info(isZh ? '已复制' : 'Copied')
    }
    else {
      message.error(isZh ? '复制失败' : 'Copy failed')
      logger.error(result)
    }
  }
}
