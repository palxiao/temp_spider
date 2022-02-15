/*
 * @Author: ShawnPhang
 * @Date: 2021-07-27 22:02:49
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-07-29 15:34:48
 * @site: book.palxp.com / blog.palxp.com
 */

const exec = require('child_process').exec
const configState = require('../../service/blog/blog-state.ts')
const blogState = configState.blogState

function checkPath() {
  const { fullPath } = blogState
  const fs = require('fs')
  return new Promise((resolve) => {
    fs.exists(fullPath, (exists: any) => {
      resolve(exists ? true : false)
    })
  })
}

async function push() {
  const message = 'feat: update by admin console'
  const { fullPath, branch } = blogState
  const sp = `cd ${fullPath} &&`

  return new Promise(async (resolve) => {
    exec(`${sp} git add . && git commit -m '${message}'`, (error: any, stdout: any, stderr: any) => {
      if (error+'' !== 'null') {
        resolve('没有可更新的提交')
      }
      exec(`cd ${fullPath} && git push origin ${branch}`, (error: any, stdout: any, stderr: any) => {
        resolve(stdout)
      })
    })
  })
}

function init() {
  const { prefix, path, email, gitName, branch, git_address, fullPath } = blogState
  return new Promise((resolve) => {
    // 设置用户名
    exec(`git config --global user.email ${email} && git config --global user.name ${gitName}`, () => {
      // 清空目录
      exec(`cd ${prefix} && rm -rf ${path}`, () => {
        // 拉取分支代码
        const shell = `git clone -b ${branch} ${git_address} --depth 1 ${fullPath}`
        exec(shell, (error: any, stdout: any, stderr: any) => {
          resolve(true)
        })
      })
    })
  })
}

module.exports = { checkPath, push, init }

export {}