// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //ABI address in polygon testnet - 0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676
        //AggregatorV3Interface(0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676);
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getCorversionRate(
        uint256 tokenAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(priceFeed);
        uint256 tokenAmountInUSD = (tokenPrice * tokenAmount) / 1e18;
        return tokenAmountInUSD;
    }
}
