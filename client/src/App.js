import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";


import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false,kycAddress:"",tokenSaleAddress:null,userTokens:0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
     
      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenUserTokenTransfer();
      this.setState({loaded:true,tokenSaleAddress:MyTokenSale.networks[this.networkId].address},this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  updateUserTokens = async()=>{
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens :userTokens});
  }
  listenUserTokenTransfer = ()=>{
    this.tokenInstance.events.Transfer({to:this.accounts[0]}).on("data",this.updateUserTokens);
  }
  handleByTokens = async()=>{
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from:this.accounts[0],value:this.web3.utils.toWei("1","Wei")});
  }
 handleInputChange =(event)=>{
   const target = event.target;
   const value  = target.type==="checkbox" ? target.checked :target.value; 
   const name   = target.name;
  
   this.setState({
     [name]:value
   });
 }
handleKycWhitelisting =async () =>{
  if(this.state.kycAddress==""){
    alert("Lỗi - Address không được bỏ trống");
  }
  else{
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from:this.accounts[0]});
    alert("KYC for"+this.state.kycAddress+" is completed");
  }
  
};
  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
     
      <div className="App" class="container-fluid test">
        
        <h1 class="text-center text-white">CAPPU TOKEN SALE </h1>
        <div class="container content">
        <h3 class="text-white text-center">KYC Whitelist</h3>
        <div class="row">
          <div class="col-12">
          <input type="text" class="form-control" name="kycAddress" placeholder="Address to allow : " value={this.state.kycAddress} onChange={this.handleInputChange} />

          </div>
          <div class="col-12 text-center">
          <button class="btn btn-danger mt-2" type="button" onClick={this.handleKycWhitelisting}>Add to whitelist</button>

          </div>
        </div>
       <hr  />
        <div class="buytoken">
       
      <h5 class="text-white text-center">If you want to buy tokens, send Wei to this address: <div class="text-warning h3"> <br/> {this.state.tokenSaleAddress}</div> </h5>
      <h4 class="text-primary text-center"> Your  currtently have: {this.state.userTokens} CAPPU Token</h4>
     <div class="text-center">
     <h4 class="text-white">Buy more token </h4>
      <button type="button" class="btn btn-success" onClick={this.handleByTokens}>Click here</button>
       
     </div>
        </div>
    
       
        </div>
       
      </div>
    );
  }
}

export default App;
