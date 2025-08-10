require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    "avalanche-fuji": {
      url: process.env.RPC_URL, // e.g. https://api.avax-test.network/ext/bc/C/rpc
      accounts: [process.env.PRIVATE_KEY_ADMIN]
    },
    fuji: {
      url: process.env.RPC_URL, // e.g. https://api.avax-test.network/ext/bc/C/rpc
      accounts: [process.env.PRIVATE_KEY_ADMIN]
    }
  }
};
