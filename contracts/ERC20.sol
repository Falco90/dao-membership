// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address _daoAddress) ERC20("MyToken", "MTK") {
        _mint(_daoAddress, 100000000 * 10**18);
    }
}