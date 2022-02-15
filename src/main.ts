/*
 * @Author: ShawnPhang
 * @Date: 2022-02-11 18:44:09
 * @Description:  
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2022-02-15 14:41:59
 * @site: book.palxp.com / blog.palxp.com
 */
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
// const path = require('path')
const router = require('./control/router.ts')

const { Blog } = require('../config.js')
const { preDir, dir } = { preDir: Blog.prefix, dir: '/data.json' }

const { spider: myConfig } = require('./configs.ts')
const port = process.env.PORT || myConfig.port
const app = express()

app.all('*', (req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

// app.use(Blog.prefix, express.static(Blog.prefix))

fs.stat(preDir+dir, function (error: any, stats: any) {
  if (error) {
    fs.mkdir(preDir, function (error: any) {
      fs.writeFile(preDir + dir, '[]', function (error: any) {
        if (error) {
          console.log(error)
        }
        console.log('创建临时配置文件成功')
      })
    })
  }
})
app.use((req: any, res: any, next: any) => {
  console.log(req.path)
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(router)

app.listen(port, () => console.log(`devServer start on port:${port}`))
