// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Competitions} from "../../src/Competitions.sol";

contract Harness is Competitions {
    constructor(address feed) Competitions(feed) {}

    function stringToBytes(string memory str) public pure returns (bytes memory) {
        return bytes(str);
    }

    function getCompetitionCount() public view returns (uint256) {
        return s_competitionCount;
    }

    function getSubmissionsLength(uint256 compId) public view returns (uint256) {
        return s_competitions[compId].submissions.length;
    }
}
