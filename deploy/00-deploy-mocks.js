const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
} = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("mocks: deployment script running...");

  if (developmentChains.includes(network.name)) {
    log("mocks: deployment inprogress...");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("mocks: deployed...");
  }
  log("mocks: deployment script exited...");
  log("-------------------------------------------------");
};

module.exports.tags = ["all", "mocks"];
