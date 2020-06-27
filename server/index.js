// 这里的node代码。会用babel处理
import React from 'react'
import {renderToString } from 'react-dom/server'
import express from 'express'
import {StaticRouter,matchPath, Route} from 'react-router-dom'
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
    console.log('+++++++++++++++++++++++'+req.url)
    let u = '/api'+req.url
    return u
  }
}))
// app.use(
//   '/api',
//   proxy({ target:'http://localhost:9090', changeOrigin: true}))

app.get('*',(req,res)=>{
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
    // 把react组件，解析成html
    const content = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url}>
          <Header></Header>
          {routes.map(route=><Route {...route}></Route>)}
        </StaticRouter>
      </Provider>

    )
    // 字符串模板
    res.send(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>react ssr</title>
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

