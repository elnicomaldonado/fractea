# Fractea Frontend

This is the frontend application for the Fractea platform - a fractional real estate investment platform built on Mantle Sepolia blockchain.

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- View available properties and their details
- Connect your wallet (MetaMask) to view your property fractions
- Check your claimable rent for each property
- Calculate your ownership percentage

## Backend Integration

This frontend connects to the FracteaNFT smart contract deployed on Mantle Sepolia at:
`0xC7301a077d4089C6e620B6f41C1fE70686092057`

The contract ABI and connection utilities are provided in:
- `src/contracts/FracteaNFT.js`
- `src/utils/blockchain.js`

## Architecture

- Next.js 13 (App Router)
- React 18
- ethers.js v6
- Tailwind CSS

## Requirements

- Node.js 16+
- MetaMask or compatible wallet
- Access to Mantle Sepolia network 