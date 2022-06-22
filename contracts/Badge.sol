// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IDaoContractInterface {
    function fetchPlayerData(address) external view returns (Player memory);
}

struct Player {
    uint256 playerId;
    uint256 contractsCompleted;
    uint256 totalRewardsEarned;
}

contract Badge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    address contractAddress;
    string bronzeURI;
    string silverURI;
    string goldURI;
    uint256[] promotionLevels;

    constructor(
        address _contractAddress,
        string memory _bronzeURI,
        string memory _silverURI,
        string memory _goldURI,
        uint256[] memory _promotionLevels
    ) ERC721("Badge", "BADGE") {
        contractAddress = _contractAddress;
        promotionLevels = _promotionLevels;
        setBronzeURI(_bronzeURI);
        setSilverURI(_silverURI);
        setGoldURI(_goldURI);
    }

    mapping(address => uint256) addressToTokenId;

    function claim() public {
        require(balanceOf(msg.sender) == 0, "A player can only mint one badge");
        Player memory player = IDaoContractInterface(contractAddress)
            .fetchPlayerData(msg.sender);

        console.log(player.playerId, player.contractsCompleted, player.totalRewardsEarned);
        require(
            player.contractsCompleted >= promotionLevels[0],
            "Not enough contracts completed"
        );
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(msg.sender, newItemId);
        addressToTokenId[msg.sender] = newItemId;
        _setTokenURI(newItemId, bronzeURI);
    }

    function updateURI(address _player) public {
        uint256 contractsCompleted = IDaoContractInterface(contractAddress)
            .fetchPlayerData(_player).contractsCompleted;
        uint256 tokenId = addressToTokenId[_player];    
        if (contractsCompleted >= promotionLevels[2]) {
            _setTokenURI(tokenId, goldURI);
        } else if (contractsCompleted >= promotionLevels[1]) {
            _setTokenURI(tokenId, silverURI);
        }
        console.log("Latest tokenURI: ", tokenURI(tokenId));
    }

    function setBronzeURI(string memory _bronzeURI) public onlyOwner {
        bronzeURI = _bronzeURI;
    }

    function setSilverURI(string memory _silverURI) public onlyOwner {
        silverURI = _silverURI;
    }

    function setGoldURI(string memory _goldURI) public onlyOwner {
        goldURI = _goldURI;
    }
}
