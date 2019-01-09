/*global contract, config, embark, it, web3, before*/

const VendingMachine = require('Embark/contracts/VendingMachine');
const ERC20Vendable = require('Embark/contracts/ERC20Vendable');
const expect = require('chai').expect

let accounts;

config({
  contracts: {
    "VendingMachine": {
      args: []
    }
  }
}, (err, theAccounts) => {
  accounts = theAccounts;
});

contract("VendingMachine", function () {
  debugger;
  before(async function() {
    let tokenAddress = await VendingMachine.methods.tokenContract().call();
    ERC20Vendable.options.address = tokenAddress;
  });

  it("should create a ERC20Vendable token", async function () {
    let tokenAddress = await VendingMachine.methods.tokenContract().call();
    expect(tokenAddress, "Vendable token not deployed").to.exist;
  });

  it("should configure ERC20Vendable correctly", async function () {
    let supply = await ERC20Vendable.methods.totalSupply().call();
    expect(supply, "Tokens should not exist on init").to.equal('0');

    let creator = await ERC20Vendable.methods.creator().call();
    expect(creator, "Creator should be the VendingMachine").to.equal(VendingMachine.options.address);
  });
});
