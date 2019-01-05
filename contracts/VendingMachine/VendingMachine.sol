pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";

/**
 * @title Burnable Token
 * @dev Token that can be irreversibly burned (destroyed).
 */
contract ERC20Burnable is ERC20 {
    //Call this creator because I don't want to
    //confuse it with the standard "Ownable" interface which allows for reassignment
    address creator;

    constructor() public {
        creator = msg.sender;
    }

    modifier onlyCreator() {
    require(msg.sender == creator);
    _;
  }


    /**
     * @dev Burns a specific amount of tokens.
     * This is different then the standard Burnable definition.
     * We only want the vending machine to be able to burn the tokens, but we don't want to require
     * the two step approve and burnFrom which the standard case would require.
     * @param from The address of which tokens should be burned away from.
     * @param value The amount of token to be burned.
     */
    function burn(address from, uint256 value) public onlyCreator {
        _burn(from, value);
    }
}


contract ERC20Mintable is ERC20, MinterRole {
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

contract ERC20Vendable is ERC20Mintable, ERC20Burnable {
  string public name;
  string public symbol;
  uint8 public decimals = 18;

  constructor(string memory _name, string memory _symbol) public {
      name = _name;
      symbol = _symbol;
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

contract WhitelistedRole is AdministratorRole {
    using Roles for Roles.Role;

    event WhitelistedAdded(address indexed account);
    event WhitelistedRemoved(address indexed account);

    Roles.Role private _whitelisteds;

    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender));
        _;
    }

    function isWhitelisted(address account) public view returns (bool) {
        return _whitelisteds.has(account);
    }

    function addWhitelisted(address account) public onlyAdministrator {
        _addWhitelisted(account);
    }

    function removeWhitelisted(address account) public onlyAdministrator {
        _removeWhitelisted(account);
    }

    function renounceWhitelisted() public {
        _removeWhitelisted(msg.sender);
    }

    function _addWhitelisted(address account) internal {
        _whitelisteds.add(account);
        emit WhitelistedAdded(account);
    }

    function _removeWhitelisted(address account) internal {
        _whitelisteds.remove(account);
        emit WhitelistedRemoved(account);
    }
}

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
