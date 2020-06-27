// 存储的入口
import {createStore,applyMiddleware,combineReducers } from 'redux'
import thunk from 'redux-thunk'
import indexReducer from './index'
import userReducer from './user'
import axios from 'axios'

const reducer = combineReducers({
  index:indexReducer,
  user:userReducer
})

const serverAxios = axios.create({
  baseURL:"http://localhost:9090/"
})

const clientAxios = axios.create({
  baseURL:"/"
})

// export default store
export const getServerStore = ()=>{
  // 服务端用的
  // 通过server的dispatch来获取和充实
  return createStore(reducer,applyMiddleware(thunk.withExtraArgument(serverAxios)))
}
export const getClientStore = ()=>{
  
  // 通过window.__context来获取数据
  // 浏览器端
  const defaultState = window.__context ?window.__context:{}
  return createStore(reducer,defaultState,applyMiddleware(thunk.withExtraArgument(clientAxios)))
}
