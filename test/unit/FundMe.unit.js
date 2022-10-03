const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      console.log("Running unit test scripts...");
      let fundMeContract;
      let deployer;
      let mockAggregator;
      let sendValue = ethers.utils.parseEther("1");
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        mockAggregator = await ethers.getContract("MockV3Aggregator", deployer);
        fundMeContract = await ethers.getContract("FundMe", deployer);
      });

      describe("constructor", async function () {
        it("constructor01 - sets the aggregator address correctly", async function () {
          const response = await fundMeContract.getPriceFeed();
          assert.equal(response, mockAggregator.address);
        });
      });

      describe("fund", async function () {
        it("fund01 - Fails if dont send enough ETH", async function () {
          await expect(fundMeContract.fund()).to.be.reverted;
          // await expect(fundMeContract.fund()).to.be.revertedWith(
          //   "You need to spend more ETH!"
          // );
        });

        it("fund02 - Updates amount funded to the state", async function () {
          await fundMeContract.fund({ value: sendValue });
          const response = await fundMeContract.getAddressToAmountFunded(
            deployer
          );
          assert.equal(response.toString(), sendValue.toString());
        });

        it("fund03 - Adds funder to the state", async function () {
          await fundMeContract.fund({ value: sendValue });
          const response = await fundMeContract.getFunders(0);
          assert.equal(response, deployer);
        });

        it("fund04 - Fund from same address is going to be addedd in state", async function () {
          await fundMeContract.fund({ value: sendValue });
          await fundMeContract.fund({ value: sendValue });
          const response = await fundMeContract.getAddressToAmountFunded(
            deployer
          );
          assert.equal(response.toString(), (2 * sendValue).toString());
        });

        // find way to fund from two different address and make tests from it
      });

      describe("withdraw", async function () {
        this.beforeEach(async function () {
          await fundMeContract.fund({ value: sendValue });
        });

        it("withdraw01 - Withdraw ETH from single funder", async function () {
          const startingFundMeBalance =
            await fundMeContract.provider.getBalance(fundMeContract.address);
          const startingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const transactionResponse = await fundMeContract.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const endingFundMeBalance = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const gasCost = transactionReceipt.effectiveGasPrice.mul(
            transactionReceipt.gasUsed
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          );
        });

        it("withdraw02 - Withdraw ETH when multiple getFunders", async function () {
          const accounts = await ethers.getSigners();
          for (let index = 1; index < 6; index++) {
            const fundMeNewAccountConnected = await fundMeContract.connect(
              accounts[index]
            );
            await fundMeNewAccountConnected.fund({ value: sendValue });
          }
          //await fundMeContract.connect(deployer);
          const startingFundMeBalance =
            await fundMeContract.provider.getBalance(fundMeContract.address);
          const startingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const transactionResponse = await fundMeContract.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const endingFundMeBalance = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const gasCost = transactionReceipt.effectiveGasPrice.mul(
            transactionReceipt.gasUsed
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          );
          await expect(fundMeContract.getFunders(0)).to.be.reverted;
          for (let index = 1; index < 6; index++) {
            assert.equal(
              await fundMeContract.getAddressToAmountFunded(
                accounts[index].address
              ),
              0
            );
          }
        });

        it("withdraw03 - Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const falseAccount = accounts[1];
          const falseAccountConnected = await fundMeContract.connect(
            falseAccount
          );
          await expect(falseAccountConnected.withdraw()).to.be.reverted;
        });
      });

      describe("cheaperWithdraw", async function () {
        this.beforeEach(async function () {
          await fundMeContract.fund({ value: sendValue });
        });

        it("cheaperWithdraw01 - Withdraw ETH from single funder", async function () {
          const startingFundMeBalance =
            await fundMeContract.provider.getBalance(fundMeContract.address);
          const startingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const transactionResponse = await fundMeContract.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const endingFundMeBalance = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const gasCost = transactionReceipt.effectiveGasPrice.mul(
            transactionReceipt.gasUsed
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          );
        });

        it("cheaperWithdraw02 - Withdraw ETH when multiple getFunders", async function () {
          const accounts = await ethers.getSigners();
          for (let index = 1; index < 6; index++) {
            const fundMeNewAccountConnected = await fundMeContract.connect(
              accounts[index]
            );
            await fundMeNewAccountConnected.fund({ value: sendValue });
          }
          //await fundMeContract.connect(deployer);
          const startingFundMeBalance =
            await fundMeContract.provider.getBalance(fundMeContract.address);
          const startingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const transactionResponse = await fundMeContract.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const endingFundMeBalance = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBalance =
            await fundMeContract.provider.getBalance(deployer);
          const gasCost = transactionReceipt.effectiveGasPrice.mul(
            transactionReceipt.gasUsed
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            endingDeployerBalance.add(gasCost).toString(),
            startingDeployerBalance.add(startingFundMeBalance).toString()
          );
          await expect(fundMeContract.getFunders(0)).to.be.reverted;
          for (let index = 1; index < 6; index++) {
            assert.equal(
              await fundMeContract.getAddressToAmountFunded(
                accounts[index].address
              ),
              0
            );
          }
        });
      });
      console.log("Unit test scripts exited...");
    });
