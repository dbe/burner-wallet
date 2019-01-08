pragma solidity ^0.5.0;

import 'lib/AdministratorRole.sol';
import 'lib/WhitelistedRole.sol';
import 'lib/ERC20Vendable.sol';

contract VendingMachine is AdministratorRole, WhitelistedRole {
  ERC20Vendable public tokenContract;

  event Deposit(address indexed depositor, uint amount);
  event Withdraw(address indexed withdrawer, uint amount);


  constructor() public {
    tokenContract = new ERC20Vendable("DenDai", "DEN");
  }

  //Fallback. Just send currency here to deposit
  function () external payable {
    deposit();
  }

  function deposit() public payable {
    tokenContract.mint(msg.sender, msg.value);
    emit Deposit(msg.sender, msg.value);
  }

  function withdraw(uint256 amount) public onlyWhitelisted {
    tokenContract.burn(msg.sender, amount);
    msg.sender.transfer(amount);

    emit Withdraw(msg.sender, amount);
  }

  //TODO: Decide if we want to trust the admin system enough to allow this form of functionality
  function sweep(uint256 amount) public onlyAdministrator {
      msg.sender.transfer(amount);
  }
}
