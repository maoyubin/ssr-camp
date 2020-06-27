// 这里的node代码。会用babel处理
import React from 'react'
import path from 'path'
import fs from 'fs'
import {renderToString } from 'react-dom/server'
import express from 'express'
import {StaticRouter,matchPath, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux'
import {getServerStore} from '../src/store/store'
import routes from '../src/App'
import Header from '../src/component/Header'
//import proxy from 'http-proxy-middleware'
import proxy from 'express-http-proxy'


const store = getServerStore()
const app = express()
app.use(express.static('public'))

app.use('/api', proxy('http://localhost:9090', {
  proxyReqPathResolver: function(req) {
    let u = '/api'+req.url
    return u
  }
}))
// app.use(
//   '/api',
//   proxy({ target:'http://localhost:9090', changeOrigin: true}))

function csrRender(res){
  const filename = path.resolve(process.cwd(), 'public/index.csr.html')
  const html = fs.readFileSync(filename, 'utf-8')

  return res.send(html)
}

app.get('*',(req,res)=>{
    if(req.query._mode=='csr'){
      console.log('开启csr 降级')
      return csrRender(res)
    }



    // 获取根据路由渲染出的组件，并且拿到loadData方法 获取数据
    // 存储网络请求
    const promises = [];
    // use `some` to imitate `<Switch>` behavior of selecting only
    // 路由匹配
    routes.some(route=>{

      //console.log('match',matchPath(req.path,route))
      //console.log('route',route)


      const match = matchPath(req.path,route)

      if(match){
        const {loadData} = route.component
        if(loadData){
          promises.push(loadData(store))
        }
      }
    })
  // 等待所有网络请求结束再渲染

  Promise.all(promises).then(()=>{

    const context = {
      css:[]
    }

    // 把react组件，解析成html
    const content = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <Header></Header>
          <Switch>
            {routes.map(route=><Route {...route}></Route>)}
          </Switch>
        </StaticRouter>
      </Provider>
    )

    //console.log('context',context)
    if(context.statuscode){
      res.status(context.statuscode)
    }

    if(context.action=='REPLACE'){
      res.redirect(301, context.url)
    }

    const css = context.css.join('\n')
    // 字符串模板
    res.send(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>react ssr</title>
        <style>
        ${css}
        </style>
      </head>
      <body>
        <div id="root">${content}</div>
        <script>
          window.__context=${JSON.stringify(store.getState())}
        </script>
        <script src="/bundle.js"></script>
      </body>
    </html>

    `)
  }).catch(()=>{
    res.send('报错页面500')
  })
  
})
app.listen(9093,()=>{
  console.log('监听完毕')
})

