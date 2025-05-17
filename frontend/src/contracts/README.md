# Fractea NFT Contract Integration

## Contract Information
- **Address**: `0xC7301a077d4089C6e620B6f41C1fE70686092057`
- **Network**: Mantle Sepolia (Chain ID: 5003)
- **Deployed By**: `0xe505fEe4bD1B2F380017f65adB9DE550Ca06D191`

## Key Contract Functions

### View Functions

1. **balanceOf(address account, uint256 propertyId) → uint256**
   - Returns the number of fractions owned by an account for a specific property
   - Parameters:
     - `account`: User address
     - `propertyId`: ID of the property

2. **properties(uint256 propertyId) → (uint256 totalSupply, uint256 totalRent, uint256 createdAt)**
   - Returns property information
   - Parameters:
     - `propertyId`: ID of the property
   - Returns:
     - `totalSupply`: Total number of fractions for this property
     - `totalRent`: Total rent deposited (in wei)
     - `createdAt`: Timestamp when property was created

3. **calculateClaimable(uint256 propertyId, address user) → uint256**
   - Calculates claimable rent for a user
   - Parameters:
     - `propertyId`: ID of the property
     - `user`: User address
   - Returns:
     - Amount of rent claimable in wei

### Write Functions

1. **mintFraction(address to, uint256 propertyId, uint256 amount)**
   - Mints new property fractions (owner only)
   - Parameters:
     - `to`: Recipient address
     - `propertyId`: ID of the property
     - `amount`: Number of fractions to mint

2. **depositRent(uint256 propertyId)**
   - Deposits rent for a property (owner only)
   - Parameters:
     - `propertyId`: ID of the property
   - Note: Payable function, send ETH with transaction

3. **claimRent(uint256 propertyId, address user)**
   - Claims rent for a user (relayer only)
   - Parameters:
     - `propertyId`: ID of the property
     - `user`: User address to receive rent

## Events

1. **FractionMinted(address indexed to, uint256 indexed propertyId, uint256 amount)**
   - Emitted when new fractions are minted

2. **RentDeposited(uint256 indexed propertyId, uint256 amount)**
   - Emitted when rent is deposited

3. **RentClaimed(address indexed user, uint256 indexed propertyId, uint256 amount)**
   - Emitted when rent is claimed

## Available Properties

The contract currently has at least two properties:
- Property #1: 200 fractions minted, 0.01 ETH rent deposited
- Property #2: 200 fractions minted, 0.0 ETH rent deposited

## Usage Notes

1. Regular users should only be able to:
   - View their property balances
   - View claimable rent
   - Request rent claims through the relayer

2. Only the contract owner can:
   - Mint new property fractions
   - Deposit rent

3. Only the designated relayer can:
   - Execute the claim function on behalf of users

4. The platform takes a 2% fee on all rent claims (200 basis points) 