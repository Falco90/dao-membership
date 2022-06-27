// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Trophy is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    address gameAddress;

    constructor(address _gameAddress) ERC721("Trophy", "TROPHY") {
        gameAddress = _gameAddress;
    }

    function createToken(string memory _tokenURI) public onlyOwner returns (uint256) {
        tokenIds.increment();
        uint256 newTokenId = tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        setApprovalForAll(gameAddress, true);
        return newTokenId;
    }
}