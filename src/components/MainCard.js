import React from 'react';
import { Scaler } from "dapparatus";
import Ruler from "./Ruler";
import {CopyToClipboard} from "react-copy-to-clipboard";
import Balance from "./Balance";
const QRCode = require('qrcode.react');


export default ({mainStyle,ERC20TOKEN,address, balance, changeAlert, changeView, dollarDisplay, subBalanceDisplay}) => {

  let url = window.location.protocol+"//"+window.location.hostname
  if(window.location.port&&window.location.port!=80&&window.location.port!=443){
    url = url+":"+window.location.port
  }
  let qrSize = Math.min(document.documentElement.clientWidth,512)-90
  let qrValue = url+"/"+address

  let sendButtons = (
    <div className="content ops row">
      <div className="col-6 p-1" onClick={() => changeView('send_with_link')}>
        <button className="btn btn-large w-100" style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}}>
          <Scaler config={{startZoomAt:600,origin:"10% 50%"}}>
            <i className="fas fa-link"  /> Send with Link
          </Scaler>
        </button>
      </div>
      <div className="col-6 p-1">
        <button className="btn btn-large w-100" onClick={() => changeView('send_to_address')} style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}}>
          <Scaler config={{startZoomAt:600,origin:"10% 50%"}}>
            <i className="fas fa-address-book"/> Send to Address
          </Scaler>
        </button>
      </div>
    </div>
  )

  if(ERC20TOKEN){
    sendButtons = (
      <div className="content ops row">
        <div className="col-6 p-1" onClick={() => changeView('vendors')}>
          <button className="btn btn-large w-100" style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}}>
            <Scaler config={{startZoomAt:600,origin:"10% 50%"}}>
              <i className="fas fa-truck"></i> Vendors
            </Scaler>
          </button>
        </div>
        <div className="col-6 p-1">
          <button className="btn btn-large w-100" onClick={() => changeView('send_to_address')} style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}}>
            <Scaler config={{startZoomAt:600,origin:"10% 50%"}}>
              <i className="fas fa-address-book"/> Send to Address
            </Scaler>
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="main-card card w-100">
      <Balance amount={balance} address={address} dollarDisplay={dollarDisplay} subDisplay={subBalanceDisplay}/>
      <Ruler/>
      <CopyToClipboard text={address} onCopy={() => {
        changeAlert({type: 'success', message: 'Address copied to clipboard'})
      }}>
        <div className="content qr row" style={{cursor:"pointer"}}>
          <QRCode value={qrValue} size={qrSize}/>
          <div className="input-group">
            <input type="text" className="form-control" value={address} disabled/>
            <div className="input-group-append">
              <span className="input-group-text"><i className="fas fa-copy"/></span>
            </div>
          </div>
        </div>
      </CopyToClipboard>
      <div>
        <Ruler/>
        {sendButtons}
      </div>

    </div>
  )
}
