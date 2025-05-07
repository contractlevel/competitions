// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface ICrossChain {
    function setAllowedPeer(address peer) external;
    function setAllowedChain(uint64 chainSelector) external;
    function setCcipGasLimit(uint256 gasLimit) external;
}
