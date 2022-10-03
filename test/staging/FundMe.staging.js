const { assert } = require("chai");
const { getNamedAccounts, ethers, network, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("fund", async function () {
      console.log("Running staging test scripts...");

      let deployer, fundMeContract;
      let sendValue = ethers.utils.parseEther("0.1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMeContract = await ethers.getContract("FundMe", deployer);
      });

      it("staging - allows people to fund and withdraw", async function () {
        const startingContractBalance =
          await fundMeContract.provider.getBalance(fundMeContract.address);
        await fundMeContract.fund({ value: sendValue });
        const fundedContractBalance = await fundMeContract.provider.getBalance(
          fundMeContract.address
        );
        const tx = await fundMeContract.cheaperWithdraw();
        //const tx = await fundMe.withdraw()
        await tx.wait(1);
        const endingContractBalance = await fundMeContract.provider.getBalance(
          fundMeContract.address
        );
        assert.equal(startingContractBalance, "0");
        assert.equal(fundedContractBalance.toString(), sendValue.toString());
        assert.equal(endingContractBalance, "0");
      });

      console.log("Staging test scripts exited...");
    });
