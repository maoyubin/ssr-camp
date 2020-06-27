import React from 'react'
import {connect} from 'react-redux'
import {getUserInfo} from '../store/user'
import {Redirect} from 'react-router-dom'


function User(props){
  //console.log(props.userinfo)

  return <Redirect to="/about">
  </Redirect>

  // return <div>
  //   <h1>
  //     你好{props.userinfo.name}!,你们最棒的人是{props.userinfo.best}
  //   </h1>
  // </div>
}
User.loadData = (store)=>{
  return store.dispatch(getUserInfo())
}
export default connect(
  state=>{
    return {
      userinfo:state.user.userinfo
    }
  }
)(User)
