// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();
error FundMe__Insufficient_Funds();

/**
 * @title Crowd-Funding Platform
 * @author Abhishek Gupta
 * @notice This contract demos crowd-funding mechanism
 * @dev This contarct makes use of internally made library PriceConverter with uses Chainlink Oracles for pricefeed
 */
contract FundMe {
  using PriceConverter for uint256;

  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;
  address private i_owner;
  uint256 public constant MINIMUM_USD = 50 * 10**18;
  AggregatorV3Interface private s_priceFeed;

  modifier onlyOwner() {
    // require(msg.sender == owner);
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  constructor(address priceFeedAddress) {
    console.log("constructing contract...");
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  /**
   * @notice This function funds this contract
   * @dev This function internally stores public address and amount of token donated
   */
  function fund() public payable {
    console.log("testing...........");
    console.log("value");

    console.log(msg.value);

    console.log(msg.value.getConversionRate(s_priceFeed));
    console.log(MINIMUM_USD);

    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "You need to spend more ETH!"
    );
    // if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
    //   revert FundMe__Insufficient_Funds();
    // }

    // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public onlyOwner {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function cheaperWithdraw() public onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funderAddress = funders[funderIndex];
      s_addressToAmountFunded[funderAddress] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function getAddressToAmountFunded(address funderAddress)
    public
    view
    returns (uint256)
  {
    return s_addressToAmountFunded[funderAddress];
  }

  function getFunders(uint256 funderIndex) public view returns (address) {
    return s_funders[funderIndex];
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
