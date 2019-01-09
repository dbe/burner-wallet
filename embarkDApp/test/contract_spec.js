/*global assert, contract, config, embark, it, web3, before*/

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
  before(async function() {
    let tokenAddress = await VendingMachine.methods.tokenContract().call();
    ERC20Vendable.options.address = tokenAddress;
  });

  it("should create a ERC20Vendable token", async function () {
    let tokenAddress = await VendingMachine.methods.tokenContract().call();
    expect(tokenAddress, "Vendable token not deployed").to.exist;
  });

  it("should configure ERC20Vendable correctly", async function () {
    return Promise.all([
      ERC20Vendable.methods.totalSupply().call().then(supply => {
        expect(supply, "Tokens should not exist on init").to.equal('0');
      }),

      ERC20Vendable.methods.creator().call().then(creator => {
        expect(creator, "Creator should be the VendingMachine").to.equal(VendingMachine.options.address);
      })
    ]);
  });

  it("should mint correctly with fallback", async function () {
    const vmAddr = VendingMachine.options.address;

    await web3.eth.sendTransaction( {
        from: accounts[0],
        to: vmAddr,
        value: 100
      })

    return Promise.all([
      web3.eth.getBalance(vmAddr).then(balance => {
        expect(balance).to.equal('100')
      }),

      ERC20Vendable.methods.balanceOf(accounts[0]).call().then(balance => {
        expect(balance).to.equal('100')
      })
    ]);
  });

  it("should not allow unauthorized withdrawls", async function () {
    let tx = VendingMachine.methods.withdraw(100).send({from: accounts[0]});
    await assert.rejects(tx, "Should reject this tx")
  });
});
