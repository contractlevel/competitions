// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @notice this is a mock of the lens-v3 Feed
contract MockFeed {
    mapping(uint256 postId => address author) internal s_postAuthors;

    /*//////////////////////////////////////////////////////////////
                             MOCK FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function postExists(uint256 postId) external view returns (bool) {
        return s_postAuthors[postId] != address(0);
    }

    function getPostAuthor(uint256 postId) external view returns (address) {
        return s_postAuthors[postId];
    }

    /*//////////////////////////////////////////////////////////////
                                 SETTER
    //////////////////////////////////////////////////////////////*/
    function setPostAuthor(uint256 postId, address author) external {
        s_postAuthors[postId] = author;
    }
}
