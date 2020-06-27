
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'


function WithStyle(Comp, styles){

    function NewComp(props){
        if(props.staticContext){
            props.staticContext.css.push(styles._getCss())
        }
        return <Comp {...props} />
    }        

    hoistNonReactStatics(NewComp, Comp)
    return NewComp
}

export default WithStyle