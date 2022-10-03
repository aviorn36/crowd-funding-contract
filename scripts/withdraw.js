const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMeContract = await ethers.getContract("FundMe", deployer);
  console.log("withdrawing...");
  const transactionResponse = await fundMeContract.withdraw();
  await transactionResponse.wait(1);
  console.log("withdrawing completed...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
