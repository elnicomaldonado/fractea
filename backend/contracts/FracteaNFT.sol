// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FracteaNFT is ERC1155, Ownable, ReentrancyGuard {
    struct Property {
        uint256 totalSupply;
        uint256 totalRent;
        uint256 createdAt;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(address => uint256)) public claimedRent;
    
    address public relayer;
    uint256 public constant FEE_BASIS_POINTS = 200;
    
    event RentDeposited(uint256 indexed propertyId, uint256 amount);
    event RentClaimed(address indexed user, uint256 propertyId, uint256 amount);
    event RelayerUpdated(address newRelayer);
    event FractionMinted(address indexed to, uint256 indexed propertyId, uint256 amount);

    constructor() 
        ERC1155("https://api.fractea.app/metadata/{id}.json")
        Ownable(msg.sender)
    {}

    function mintFraction(address to, uint256 propertyId, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, propertyId, amount, "");
        properties[propertyId].totalSupply += amount;
        if(properties[propertyId].createdAt == 0) {
            properties[propertyId].createdAt = block.timestamp;
        }
        emit FractionMinted(to, propertyId, amount);
    }

    function depositRent(uint256 propertyId) external payable onlyOwner {
        require(msg.value > 0, "Deposit must be greater than 0");
        properties[propertyId].totalRent += msg.value;
        emit RentDeposited(propertyId, msg.value);
    }

    function claimRent(uint256 propertyId, address user) external nonReentrant onlyRelayer {
        uint256 claimable = calculateClaimable(propertyId, user);
        require(claimable > 0, "Nothing to claim");
        
        uint256 fee = (claimable * FEE_BASIS_POINTS) / 10000;
        uint256 netAmount = claimable - fee;
        
        claimedRent[propertyId][user] += claimable;
        
        (bool successUser,) = payable(user).call{value: netAmount}("");
        (bool successFee,) = payable(owner()).call{value: fee}("");
        require(successUser && successFee, "Transfer failed");
        
        emit RentClaimed(user, propertyId, netAmount);
    }

    function setRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "Invalid relayer address");
        relayer = _relayer;
        emit RelayerUpdated(_relayer);
    }

    function calculateClaimable(uint256 propertyId, address user) public view returns(uint256) {
        uint256 balance = balanceOf(user, propertyId);
        if(balance == 0) return 0;
        
        Property memory prop = properties[propertyId];
        if (prop.totalSupply == 0) return 0;
        
        uint256 totalClaimable = (prop.totalRent * balance) / prop.totalSupply;
        return totalClaimable - claimedRent[propertyId][user];
    }

    function uri(uint256 id) public view override returns (string memory) {
        require(properties[id].createdAt != 0, "Non-existent property");
        return string(abi.encodePacked(super.uri(id), Strings.toString(id)));
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Caller is not relayer");
        _;
    }
}