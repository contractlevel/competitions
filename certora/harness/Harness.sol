// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ContentCompetition} from "../../src/crosschain/ContentCompetition.sol";

contract Harness is ContentCompetition {
    constructor(address feed, address link, address ccipRouter, uint256 ccipGasLimit)
    ContentCompetition(feed, link, ccipRouter, ccipGasLimit) {}
}