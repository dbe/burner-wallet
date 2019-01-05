pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";

contract ERC20Mintable is ERC20, MinterRole {
  string public name;
  string public symbol;
  uint8 public decimals = 18;

  constructor(string memory _name, string memory _symbol) public {
      name = _name;
      symbol = _symbol;
  }

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address to,
    uint256 amount
  )
    public
    onlyMinter
    returns (bool)
  {
    _mint(to, amount);
    return true;
  }
}

contract AdministratorRole {
  using Roles for Roles.Role;

  event AdministratorAdded(address indexed account);
  event AdministratorRemoved(address indexed account);

  Roles.Role private administrators;

  constructor() public {
    _addAdministrator(msg.sender);
  }

  modifier onlyAdministrator() {
    require(isAdministrator(msg.sender));
    _;
  }

  function isAdministrator(address account) public view returns (bool) {
    return administrators.has(account);
  }

  function addAdministrator(address account) public onlyAdministrator {
    _addAdministrator(account);
  }

  function renounceAdministrator() public {
    _removeAdministrator(msg.sender);
  }

  function _addAdministrator(address account) internal {
    administrators.add(account);
    emit AdministratorAdded(account);
  }

  function _removeAdministrator(address account) internal {
    administrators.remove(account);
    emit AdministratorRemoved(account);
  }
}

contract VendingMachine is AdministratorRole {
  ERC20Mintable public tokenContract;

  event Deposit(address indexed dst, uint wad);

  constructor() public {
    tokenContract = new ERC20Mintable("DenDai", "DEN");
  }

  //Fallback. Just send currency here to deposit
  function () external payable {
    deposit();
  }

  function deposit() public payable {
    tokenContract.mint(msg.sender, msg.value);
    emit Deposit(msg.sender, msg.value);
  }

  //TODO: Decide if we want to trust the admin system enough to allow this form of functionality
  function sweep(uint256 amount) public onlyAdministrator {
      msg.sender.transfer(amount);
  }
}
