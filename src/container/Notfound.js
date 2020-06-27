import React from 'react'
import {Route} from 'react-router-dom'

function Status({code, children}){
    return <Route render={({staticContext})=>{
        if(staticContext){
            staticContext.statuscode=code
        }
        //console.log('staticContext', staticContext)
        return children
    }}></Route>
}


function Notfound(props){

    return <Status code="404">
        <h1>大兄弟瞅啥呢</h1>
        <img id='img-404'src="/404.jpg"></img>
    </Status>
}


export default Notfound