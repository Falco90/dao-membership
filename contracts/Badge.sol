// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IDaoContractInterface {
    function fetchPlayerData(address) external view returns (Player memory);

    function fetchPromotions() external view returns (Promotion[] memory);
}

struct Player {
    uint256 playerId;
    uint256 contractsCompleted;
    uint256 totalRewardsEarned;
}

struct Promotion {
    uint256 level;
    uint256 contractsRequired;
    uint256 bonus;
}

contract Badge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    address contractAddress;
    string[] tokenURIs;

    constructor(address _contractAddress, string[] memory _tokenURIs)
        ERC721("Badge", "BADGE")
    {
        contractAddress = _contractAddress;
        tokenURIs = _tokenURIs;
    }

    mapping(address => uint256) addressToTokenId;

    function claim() public {
        require(balanceOf(msg.sender) == 0, "A player can only mint one badge");
        Player memory player = IDaoContractInterface(contractAddress)
            .fetchPlayerData(msg.sender);

        console.log(
            player.playerId,
            player.contractsCompleted,
            player.totalRewardsEarned
        );
        require(
            player.contractsCompleted >= 1,
            "A player must atleast complete one contract to earn a badge"
        );
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(msg.sender, newItemId);
        addressToTokenId[msg.sender] = newItemId;
        _setTokenURI(newItemId, tokenURIs[0]);
    }

    function updateTokenURI(address _player, uint256 _index) public {
        uint256 contractsCompleted = IDaoContractInterface(contractAddress)
            .fetchPlayerData(_player)
            .contractsCompleted;
        uint256 contractsRequired = IDaoContractInterface(contractAddress)
        .fetchPromotions()[_index].contractsRequired;
        require(contractsCompleted >= contractsRequired);
        uint256 tokenId = addressToTokenId[_player];
        _setTokenURI(tokenId, tokenURIs[_index]);
        console.log("Latest tokenURI: ", tokenURI(tokenId));
    }
}
