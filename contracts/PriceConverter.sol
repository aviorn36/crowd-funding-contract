// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

library PriceConverter {
  function getPrice(AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256)
  {
    // AggregatorV3Interface priceFeed = AggregatorV3Interface(
    //   0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
    // );
    (, int256 answer, , , ) = priceFeed.latestRoundData();
    return uint256(answer * 10000000000);
  }

  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256)
  {
    console.log("ethAmount");
    console.log(ethAmount);
    uint256 ethPrice = getPrice(priceFeed);
    console.log("ethPrice");
    console.log(ethPrice);
    uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
    console.log("ethAmountInUsd");
    console.log(ethAmountInUsd);
    return ethAmountInUsd;
  }
}
