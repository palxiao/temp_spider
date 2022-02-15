/*
 * @Author: ShawnPhang
 * @Date: 2021-07-28 18:44:11
 * @Description: 文件操作
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-08-30 14:59:17
 * @site: book.palxp.com / blog.palxp.com
 */

// import moment from 'moment'
const fs = require('fs')
const configState = require('../../service/blog/blog-state.ts')
const blogState = configState.blogState
let { fullPath, ResourcePath } = blogState
fullPath += ResourcePath

function readdirSync(thePath: string = '') {
  const postPath = thePath || fullPath
  let files = []
  try {
    files = fs.readdirSync(postPath)
  } catch (e) {}

  for (let i = 0; i < files.length; i++) {
    const name = files[i]
    const that = fs.statSync(`${postPath}/${name}`)
    const path = `${postPath}/${name}`
    const isdir = that.isDirectory()
    const size = (that.size / 1024).toFixed(2) + 'kb'
    // const time = moment(that.birthtime).format('YYYY-MM-DD')
    files[i] = { name, path, size, isdir }
  }
  //   return files.sort(compare('time'))
  return files
}

function readFileSync(thePath: string) {
  //   const postPath = fullPath + thePath
  let result = ''
  try {
    result = fs.readFileSync(thePath) + ''
  } catch (e) {}
  return result
}

function writeFileSync(thePath: string, title: string, content: string) {
  const path = thePath ? thePath : fullPath + title
  fs.writeFileSync(path, content)
}

function remove(thePath: string) {
  try {
    fs.unlinkSync(thePath)
  } catch (e) {}
}

function rename(thePath: string, title: string) {
  const names = thePath.split('/')
  names.pop()
  const prePath = names.join('/')
  try {
    fs.renameSync(thePath, prePath + '/' + title)
  } catch (e) {}
}

function compare(property: any) {
  return function (a: any, b: any) {
    return new Date(b[property]).getTime() - new Date(a[property]).getTime()
  }
}
module.exports = {
  readdirSync,
  readFileSync,
  remove,
  rename,
  writeFileSync,
}

export {}