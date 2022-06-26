// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

interface IBadge {
    function updateTokenURI(address, uint256) external;
}

contract BountyHunterDAO is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private contractIds;
    Counters.Counter private contractsCompleted;
    Counters.Counter public playerIds;
    address public owner;
    Promotion[] promotions;
    Player[] public players;

    struct Contract {
        uint256 contractId;
        address nftContract;
        uint256 tokenId;
        uint256 reward;
        bool completed;
        address completedBy;
        address owner;
    }

    struct Promotion {
        uint256 level;
        uint256 contractsRequired;
        uint256 bonus;
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
        address playerAddress;
        uint256 contractsCompleted;
        uint256 totalRewardsEarned;
    }

    // mapping(address => Player) public addressToPlayer;

    mapping(address => uint256) public addressToPlayerId;

    mapping(uint256 => Player) public idToPlayer;


    function fetchPlayerData(address _address)
        public
        view
        returns (Player memory)
    {
        uint256 playerId = addressToPlayerId[_address];
        return idToPlayer[playerId];
    }

    constructor(Promotion[] memory _promotions) {
        owner = msg.sender;
        for (uint256 i = 0; i < _promotions.length; i++) {
            promotions.push(_promotions[i]);
        }
    }

    function fetchPromotions() public view returns (Promotion[] memory) {
        return promotions;
    }

    function createContract(
        address _nftContract,
        uint256 _tokenId,
        uint256 _reward
    ) public onlyOwner {
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
        if (addressToPlayerId[player] == 0) {
            addNewPlayer(player);
        }
        uint256 playerId = addressToPlayerId[player];
        uint256 reward = idToContract[_contractId].reward;
        uint256 tokenId = idToContract[_contractId].tokenId;

        require(IERC20(_erc20contract).balanceOf(address(this)) >= reward);
        idToContract[_contractId].completedBy = msg.sender;
        IERC721(_nftContract).transferFrom(address(this), msg.sender, tokenId);
        IERC20(_erc20contract).transfer(msg.sender, reward);

        idToContract[_contractId].owner = msg.sender;
        idToContract[_contractId].completed = true;
        contractsCompleted.increment();
        idToPlayer[playerId].totalRewardsEarned += reward;
        idToPlayer[playerId].contractsCompleted++;

        //check if player is eligible for promotion
        for (uint256 i = 0; i < promotions.length; i++) {
            if (
                idToPlayer[playerId].contractsCompleted ==
                promotions[i].contractsRequired
            ) {
                promotePlayer(_badgeContract, _erc20contract, player, i);
            }
        }
    }

    function addNewPlayer(address _player) private {
        playerIds.increment();
        uint256 newPlayerId = playerIds.current();
        addressToPlayerId[_player] = newPlayerId;
        idToPlayer[newPlayerId].playerId = newPlayerId;
        idToPlayer[newPlayerId].playerAddress = _player;
    }

    function fetchPlayers() public view returns (Player[] memory) {
        uint256 playerCount = playerIds.current();
        uint256 currentIndex = 0;

        Player[] memory _players = new Player[](playerCount);
        for (uint256 i = 0; i < playerCount; i++) {
            Player storage currentPlayer = idToPlayer[i + 1];
            _players[currentIndex] = currentPlayer;
            currentIndex++;
        }
        return _players;
    }

    function promotePlayer(
        address _badgeContract,
        address _erc20contract,
        address _player,
        uint256 _index
    ) private {
        IERC20(_erc20contract).transfer(
            _player,
            promotions[_index].bonus * 10**18
        );
        IBadge(_badgeContract).updateTokenURI(_player, _index);
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

    modifier onlyOwner {
        require(msg.sender == owner, "This can only be called by the owner/gamemaster");
        _;
    }
}
