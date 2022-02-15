七牛云相关服务

./config.js 需要自行配置，业务配置不保存到代码库

```JavaScript
/**
 *   七牛云配置
 */
const QiNiu = {
    AK: '',
    SK: ''
}

exports.QiNiu = QiNiu
```

### 环境需求

    yarn install
    npm install apidoc -g

### npm run build:apidoc

生成 api 文档，打开项目目录下\_apidoc 文件夹以访问静态 html 文件

### npm run dev

ts-node 直接运行，并监听文件修改自动重启服务

### npm run build

使用 webpack 打包 ts 项目为用于部署的文件

### npm run serve

实验功能，使用 webpack/tsc 编译 ts，supervisor/pm2 监听编译后文件变动重启服务，gulp 自动化任务
