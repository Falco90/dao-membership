// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

interface IBadgeInterface {
    function updateURI(address) external;
}

contract BountyHunterDAO is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private contractIds;
    Counters.Counter private contractsCompleted;
    Counters.Counter private playerIds;
    address public sheriff;
    uint256[] promotionLevels;
    Player[] players;

    struct Contract {
        uint256 contractId;
        address nftContract;
        uint256 tokenId;
        uint256 reward;
        bool completed;
        address completedBy;
        address owner;
    }

    mapping(uint256 => Contract) private idToContract;

    event ContractCreated(
        uint256 indexed id,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 reward,
        bool completed,
        address completedBy,
        address owner
    );

    struct Player {
        uint256 playerId;
        uint256 contractsCompleted;
        uint256 totalRewardsEarned;
    }

    mapping(address => Player) public addressToPlayer;

    function fetchPlayerData(address _address)
        public
        view
        returns (Player memory)
    {
        return addressToPlayer[_address];
    }

    constructor(uint256[] memory _promotionLevels) payable {
        sheriff = msg.sender;
        promotionLevels = _promotionLevels;
    }

    // function claimPromotion(uint256 _level) public {
    //     require(addressToBountyHunter[msg.sender].contractsCompleted >= promotionLevels[_level]);
    // }

    function fetchPromotionLevels() public view returns (uint256[] memory) {
        return promotionLevels;
    }

    function fetchPlayers() public view returns (Player[] memory) {
        return players;
    }

    function createContract(
        address _nftContract,
        uint256 _tokenId,
        uint256 _reward
    ) public {
        require(_reward > 0, "Reward must be greater than 0");

        contractIds.increment();
        uint256 newContractId = contractIds.current();

        idToContract[newContractId] = Contract(
            newContractId,
            _nftContract,
            _tokenId,
            _reward,
            false,
            address(0),
            address(msg.sender)
        );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        emit ContractCreated(
            newContractId,
            _nftContract,
            _tokenId,
            _reward,
            false,
            address(0),
            msg.sender
        );
    }

    function completeContract(
        address _nftContract,
        uint256 _contractId,
        address _erc20contract,
        address _badgeContract
    ) public {
        address player = msg.sender;
        uint256 reward = idToContract[_contractId].reward;
        uint256 tokenId = idToContract[_contractId].tokenId;
        require(IERC20(_erc20contract).balanceOf(address(this)) >= reward);
        idToContract[_contractId].completedBy = msg.sender;
        IERC721(_nftContract).transferFrom(address(this), msg.sender, tokenId);
        IERC20(_erc20contract).transfer(msg.sender, reward);

        idToContract[_contractId].owner = msg.sender;
        idToContract[_contractId].completed = true;
        contractsCompleted.increment();
        addressToPlayer[msg.sender].totalRewardsEarned += reward;
        addressToPlayer[msg.sender].contractsCompleted++;

        if (addressToPlayer[msg.sender].contractsCompleted == 0) {
            playerIds.increment();
            addressToPlayer[msg.sender].playerId = playerIds.current();
            players.push(addressToPlayer[msg.sender]);
        }
        if (IERC721(_badgeContract).balanceOf(player) == 1) {
            updateBadge(_badgeContract, player);
        }
    }

    function updateBadge(address _badgeContract, address _player) private {
        IBadgeInterface(_badgeContract).updateURI(_player);
    }

    function fetchContracts() public view returns (Contract[] memory) {
        uint256 contractCount = contractIds.current();
        uint256 uncompletedContractCount = contractIds.current() -
            contractsCompleted.current();
        uint256 currentIndex = 0;

        Contract[] memory contracts = new Contract[](uncompletedContractCount);
        for (uint256 i = 0; i < contractCount; i++) {
            if (idToContract[i + 1].completedBy == address(0)) {
                uint256 currentId = idToContract[i + 1].contractId;
                Contract storage currentContract = idToContract[currentId];
                contracts[currentIndex] = currentContract;
                currentIndex++;
            }
        }
        return contracts;
    }

    function fetchMyContracts() public view returns (Contract[] memory) {
        uint256 totalContractCount = contractIds.current();
        uint256 contractCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalContractCount; i++) {
            if (idToContract[i + 1].completedBy == msg.sender) {
                contractCount++;
            }
        }

        Contract[] memory contracts = new Contract[](contractCount);

        for (uint256 i = 0; i < totalContractCount; i++) {
            if (idToContract[i + 1].completedBy == msg.sender) {
                uint256 currentId = idToContract[i + 1].contractId;
                Contract storage currentContract = idToContract[currentId];
                contracts[currentIndex] = currentContract;
                currentIndex++;
            }
        }
        return contracts;
    }

    function fetchCompletedContracts() public view returns (Contract[] memory) {
        uint256 totalContractCount = contractIds.current();
        uint256 contractCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalContractCount; i++) {
            if (idToContract[i + 1].completed == true) {
                contractCount++;
            }
        }

        Contract[] memory contracts = new Contract[](contractCount);

        for (uint256 i = 0; i < totalContractCount; i++) {
            if (idToContract[i + 1].completed == true) {
                uint256 currentId = idToContract[i + 1].contractId;
                Contract storage currentContract = idToContract[currentId];
                contracts[currentIndex] = currentContract;
                currentIndex++;
            }
        }
        return contracts;
    }
}
