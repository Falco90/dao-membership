require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    ropsten: {
      url: process.env.ALCHEMY_ROPSTEN_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY]
    },
  },
  solidity: "0.8.4",
};
