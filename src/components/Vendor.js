import React from 'react';
import { Scaler } from "dapparatus";
import Blockies from 'react-blockies';
import Ruler from "./Ruler";
import {CopyToClipboard} from "react-copy-to-clipboard";
const QRCode = require('qrcode.react');

let interval

export default class Advanced extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      changingAvailable: {}
    }
  }
  componentDidMount(){
    interval = setInterval(this.poll.bind(this),3000)
    setTimeout(this.poll.bind(this),444)
  }
  componentWillUnmount(){
    clearInterval(interval)
  }
  async poll(){
    let id = 0
    let products = []//this.state.products
    if(!products){
      products = []
    }

    let found = true
    while(found){
      let nextProduct = await this.props.contracts[this.props.ERC20TOKEN].products(this.props.address,id).call()
      if(nextProduct.exists){
        products[id++] = nextProduct
      }else{
        found=false
      }
    }
    console.log("========PPPPPP",products)
    this.setState({products})
  }
  render(){
    let {dollarDisplay,mainStyle,contracts,vendor,tx,web3} = this.props

    let products = []
    for(let p in this.state.products){
      let prod = this.state.products[p]
      if(prod.exists){

        //console.log(prod)

        let productAvailableDisplay = ""
        if(this.state.changingAvailable[p]){
          productAvailableDisplay = (
            <i className="fas fa-cog fa-spin"></i>
          )
        }else if(prod.isAvailable){
          productAvailableDisplay = (
            <i className="fas fa-eye"></i>
          )
        }else{
          productAvailableDisplay = (
            <i className="fas fa-eye-slash"></i>
          )
        }

        let productIsActive = (
          <button className="btn btn-large w-100"
            onClick={()=>{
              let {changingAvailable} = this.state
              changingAvailable[p] = true
              this.setState({changingAvailable})
              //addProduct(uint256 id, bytes32 name, uint256 cost, bool isAvailable)
              console.log(prod.id,prod.name,prod.cost,prod.isAvailable)
              tx(contracts[this.props.ERC20TOKEN].addProduct(prod.id,prod.name,prod.cost,!prod.isAvailable),240000,0,0,(result)=>{
                console.log("PRODUCT:",result)
                setTimeout(this.poll.bind(this),444)
                setTimeout(()=>{
                  let {changingAvailable} = this.state
                  changingAvailable[p] = false
                  this.setState({changingAvailable})
                },1500)
              })
            }}
            style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"
          }}>
            <Scaler config={{startZoomAt:500,origin:"50% 50%"}}>
              {productAvailableDisplay}
            </Scaler>
          </button>
        )

        let available = (
          <i className="far fa-eye"></i>
        )
        if(!prod.isAvailable){
          available = (
            <i className="far fa-eye" style={{opacity:0.3}}></i>
          )
        }

        let opacity  =  1.0
        if(!prod.isAvailable){
          opacity = 0.5
        }

        products.push(
          <div className="content bridge row" style={{opacity}}>
            <div className="col-6 p-1">
              {web3.utils.hexToUtf8(prod.name)}
            </div>
            <div className="col-4 p-1">
              ${dollarDisplay(web3.utils.fromWei(prod.cost,'ether'))}
            </div>
            <div className="col-2 p-1">
              {productIsActive}
            </div>
          </div>
        )
      }
    }

    let venderButtonText = ""
    if(this.state.changingActive){
      venderButtonText = (
          <div>
            <i className="fas fa-cog fa-spin"></i> Updating
          </div>
      )
    }else if(vendor.isActive){
      venderButtonText = (
          <div>
            <i className="fas fa-thumbs-up"></i> Open
          </div>
      )
    }else{
      venderButtonText = (
        <div>
          <i className="fas fa-window-close"></i> Closed
        </div>
      )
    }

    let addProductText = (
      <span>
        <i className="fas fa-plus-square"></i> Add Product
      </span>
    )

    if(this.state.addingProduct){
      addProductText = (
        <span>
          <i className="fas fa-cog fa-spin"></i> Adding
        </span>
      )
    }


    return (
      <div className="main-card card w-100">
        <div className="content bridge row">
          <div className="col-8 p-1" style={{textAlign:'center'}}>
            <h2>{web3.utils.hexToUtf8(vendor.name)}</h2>
          </div>
          <div className="col-4 p-1">
          <button className="btn btn-large w-100" style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}} onClick={()=>{
            this.setState({changingActive:true})
            let setActiveTo = !vendor.isActive
            tx(contracts[this.props.ERC20TOKEN].activateVendor(setActiveTo),120000,0,0,(result)=>{
              console.log("ACTIVE:",result)
              setTimeout(()=>{
                this.setState({changingActive:false})
              },1500)
            })
          }}>
            <Scaler config={{startZoomAt:500,origin:"40% 50%"}}>
              {venderButtonText}
            </Scaler>
          </button>
          </div>
        </div>
        {products}
        <div className="content bridge row">
          <div className="col-4 p-1">
            <input type="text" className="form-control" placeholder="Name..." value={this.state.newProductName}
                   onChange={event => this.setState({newProductName:event.target.value})} />
          </div>
          <div className="col-4 p-1">
          <div className="input-group">
            <div className="input-group-prepend">
              <div className="input-group-text">$</div>
            </div>
            <input type="text" className="form-control" placeholder="0.00" value={this.state.newProductAmount}
              onChange={event => this.setState({newProductAmount:event.target.value})} />
          </div>
          </div>
          <div className="col-4 p-1">
          <button className="btn btn-large w-100" style={{backgroundColor:mainStyle.mainColor,whiteSpace:"nowrap"}} onClick={()=>{
            //addProduct(uint256 id, bytes32 name, uint256 cost, bool isAvailable)
            let nextId = this.state.products.length
            this.setState({addingProduct:true})
            tx(contracts[this.props.ERC20TOKEN].addProduct(nextId,web3.utils.utf8ToHex(this.state.newProductName),web3.utils.toWei(""+this.state.newProductAmount, 'ether'),true),240000,0,0,(result)=>{
              console.log("PRODUCT ADDED",result)
              this.setState({newProductAmount:"",newProductName:""})
              setTimeout(this.poll.bind(this),100)
              setTimeout(()=>{
                this.setState({addingProduct:false})
              },1500)
            })
          }}>
            <Scaler config={{startZoomAt:650,origin:"20% 50%"}}>
              {addProductText}
            </Scaler>
          </button>
          </div>
        </div>
      </div>
    )
  }
}
