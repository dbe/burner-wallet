import React from 'react';
import { Blockie } from "dapparatus";
import Ruler from "./Ruler";
import { Scaler } from "dapparatus";

const BockieSize = 4

export default ({ERC20TOKEN, vendorName, address, recentTxs, block, changeView}) => {
  let txns = []
  for(let r in recentTxs){
    let thisValue = parseFloat(recentTxs[r].value)
    if(thisValue>0.0){
      if(txns.length>0){
        txns.push(
          <hr key={"ruler"+recentTxs[r].hash} style={{ "color": "#DFDFDF",marginTop:0,marginBottom:7 }}/>
        )
      }

      let extraIcon = ""
      if(recentTxs[r].data){
        extraIcon = (
          <div style={{position:'absolute',right:0,top:7,opacity:0.3}}>
            <i className="fas fa-comment"></i>
          </div>
        )
      }

      let dollarView
      if(ERC20TOKEN){
        if(recentTxs[r].token){
          dollarView = (
            <span>
              <span style={{opacity:0.33}}>-</span>${parseFloat(recentTxs[r].value).toFixed(2)}<span style={{opacity:0.33}}>-></span>
            </span>
          )
        }else{
          dollarView = (
            <span style={{opacity:0.5,fontSize:14}}>
              {parseFloat(recentTxs[r].value).toFixed(2)}
            </span>
          )
        }

      } else {
        dollarView = (
          <span>
            <span style={{opacity:0.33}}>-</span>${parseFloat(recentTxs[r].value).toFixed(2)}<span style={{opacity:0.33}}>-></span>
          </span>
        )
      }

      let toBlockie = (
        <Blockie
          address={recentTxs[r].to}
          config={{size:BockieSize}}
        />
      )
      if(recentTxs[r].to==address && recentTxs[r].data) {
        let message = recentTxs[r].data
        let limit = 14
        if(message.length>limit){
          message = message.substring(0,limit-3)+"..."
        }
        toBlockie = (
          <span style={{fontSize:14}}>
            {message}
          </span>
        )
      }

      txns.push(
        <div style={{position:'relative',cursor:'pointer'}} key={recentTxs[r].hash} className="content bridge row" onClick={()=>{
          if(recentTxs[r].from==address){
            changeView("account_"+recentTxs[r].to)
          }else{
            changeView("account_"+recentTxs[r].from)
          }
        }}>
          {extraIcon}
          <div className="col-3 p-1" style={{textAlign:'center'}}>
            <Blockie
              address={recentTxs[r].from}
              config={{size:BockieSize}}
            />
          </div>
          <div className="col-3 p-1" style={{textAlign:'center',whiteSpace:"nowrap",letterSpacing:-1}}>
            <Scaler config={{startZoomAt:600,origin:"25% 50%",adjustedZoom:1}}>
              {dollarView}
            </Scaler>
          </div>
          <div className="col-3 p-1" style={{textAlign:'center',whiteSpace:"nowrap",letterSpacing:-1}}>
            {toBlockie}
          </div>
          <div className="col-3 p-1" style={{textAlign:'center',whiteSpace:"nowrap",letterSpacing:-1}}>
            <Scaler config={{startZoomAt:600,origin:"25% 50%",adjustedZoom:1}}>
            <span style={{marginLeft:5,marginTop:-5,opacity:0.4,fontSize:12}}>{cleanTime((block-recentTxs[r].blockNumber)*5)} ago</span>
            </Scaler>
          </div>

        </div>
      )
    }
  }
  if(txns.length>0){
    return (
      <div className="main-card card w-100">
        {txns}
      </div>
    )
  }else{
    return (
      <span></span>
    )
  }
}

let cleanTime = (s)=>{
  if(s<60){
    return s+"s"
  }else if(s/60<60){
    return Math.round(s/6)/10+"m"
  }else {
    return Math.round((s/60/6)/24)/10+"d"
  }
}
