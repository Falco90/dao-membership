// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BountyHunterToken is ERC20, Ownable {
    constructor(address _gameAddress) ERC20("BountyHunterToken", "BHT") {
        _mint(_gameAddress, 100000000 * 10**18);
    }
}