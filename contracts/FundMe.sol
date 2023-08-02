// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Imports

import "./PriceConverter.sol";

// Error Codes

error FundMe__NotOwner();

// Intefaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Oleksii Kvasov
 * @notice This contract is sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations

    using PriceConverter for uint256;

    // State variables

    address private immutable i_owner;
    uint256 public constant MIN_USD = 20 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    // Modifiers

    modifier onlyOwner() {
        if (i_owner != msg.sender) {
            revert FundMe__NotOwner();
        }
        _; //do rest of the code
    }

    // Functions order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getCorversionRate(s_priceFeed) >= MIN_USD,
            "Didn't send enough."
        ); // 1e18 => 1 * 10 ** 18
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool isCallSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(isCallSuccess, "Funds call is failed!");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool isCallSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(isCallSuccess);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
