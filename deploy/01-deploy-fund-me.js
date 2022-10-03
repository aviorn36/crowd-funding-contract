const { network } = require("hardhat");
const { verify } = require("../utils/utils");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments }) => {
  // how does javascript RE finds that these 2 variables (getNamedAccounts, deployments) are from hre object
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("FundMe: deployment script running...");

  const chainId = network.config.chainId;
  let priceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const mockMockV3Aggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = mockMockV3Aggregator.address;
  } else {
    //ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];
    ethUsdPriceFeedAddress = network.config.ethUsdPriceFeedAddress;
  }
  log("FundMe: deployment inprogress..." + ethUsdPriceFeedAddress);
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("FundMe: deployed...");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("FundMe: verification inprogress...");
    await verify(fundMe.address, args);
  }

  log("FundMe: deployment script exited...");
  log("-------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
