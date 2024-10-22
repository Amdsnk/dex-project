require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    // Add other networks as needed
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};