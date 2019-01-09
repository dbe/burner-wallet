pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/access/Roles.sol";

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
