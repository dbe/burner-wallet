pragma solidity 0.4.25;

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

  //*****************  Product/Vendor related code *******************//

  mapping (address => Vendor) public vendors;
  /* mapping (address => uint32) public productCount;
  mapping (address => mapping (uint256 => Product)) public products; */

  event UpdateVendor(address indexed vendorAddress, bytes32 name, bool isAllowed, bool isActive, address sender);

  struct Vendor {
    bytes32 name;
    bool isActive; //let's vendor indicate if they are open at the time
    bool isAllowed; //let's admin turn them off
  }

  /* struct Product {
    uint256 id;
    uint256 cost;
    bytes32 name;
    bool exists;
    bool isAvailable;
  } */

  function addVendor(address _vendorAddress, bytes32 _name) public onlyAdministrator {
    require(!vendors[_vendorAddress], "This address already is a vendor.");

    vendors[_vendorAddress] = Vendor({
      name: _name,
      isActive: false,
      isAllowed: true
    });

    _emitUpdateVendor(_vendorAddress);
  }

  function activateVendor(bool _isActive) public {
    //Existing vendor check happens in _updateVendor. No need to do it here
    _updateVendor(
      msg.sender,
      vendors[msg.sender].name,
      _isActive,
      vendors[msg.sender].isAllowed
    );
  }

  function updateVendor(address _vendorAddress, bytes32 _name, bool _isActive, bool _isAllowed) public onlyAdministrator {
    _updateVendor(_vendorAddress, _name, _isActive, _isAllowed);
  }

  function _updateVendor(address _vendorAddress, bytes32 _name, bool _isActive, bool _isAllowed) private {
    require(vendors[_vendorAddress], "Cannot update a non-existent vendor");

    vendors[_vendorAddress].name = _name;
    vendors[_vendorAddress].isActive = _isActive;
    vendors[_vendorAddress].isAllowed = _isAllowed;

    _emitUpdateVendor(_vendorAddress);
  }

  function _emitUpdateVendor(adresss _vendorAddress) private {
    emit UpdateVendor(
      _vendorAddress,
      vendors[_vendorAddress].name,
      vendors[_vendorAddress].isActive,
      vendors[_vendorAddress].isAllowed,
      msg.sender
    );
  }
}
