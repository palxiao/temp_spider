/*
 * @Author: ShawnPhang
 * @Date: 2021-08-24 11:53:43
 * @Description:
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-12 17:14:17
 * @site: book.palxp.com / blog.palxp.com
 */
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const QiNiu = {
  AK: '',
  SK: '',
  DefaultSpace: 'my-ablum',
}

const Blog = {
  prefix: isDev ? 'static/' : path.resolve(__dirname, 'static/'),
}

exports.QiNiu = QiNiu

exports.Blog = Blog
