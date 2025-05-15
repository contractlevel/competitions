// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console2, Vm} from "forge-std/Test.sol";
import {DeployCompetitions, Competitions, HelperConfig} from "../script/deploy/DeployCompetitions.s.sol";
import {
    IFeed,
    CreatePostParams,
    Post,
    KeyValue,
    RuleProcessingParams,
    RuleChange
} from "@lens-protocol/lens-v3/contracts/core/interfaces/IFeed.sol";

contract BaseTest is Test {
    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    string internal constant LENS_MAINNET_RPC_URL = "https://rpc.lens.xyz"; // https://rpc.testnet.lens.xyz
    uint256 internal constant LENS_MAINNET_STARTING_BLOCK = 1685437;
    uint256 internal constant LENS_MAINNET_CHAIN_ID = 232;
    uint256 internal lensFork;

    Competitions internal comp;
    HelperConfig internal config;
    address internal feed;

    address internal owner = makeAddr("owner");
    address internal user = makeAddr("user");
    address internal creator = makeAddr("creator");
    address internal author = makeAddr("author");
    address internal voter = makeAddr("voter");

    uint256 internal constant ONE_ETH = 1e18;
    uint256 internal constant TEN_LINK = 1e18 * 10;

    /*//////////////////////////////////////////////////////////////
                                 SET UP
    //////////////////////////////////////////////////////////////*/
    function setUp() public virtual {
        _forkLens();
        _deployInfra();

        vm.deal(creator, ONE_ETH);
    }

    /// @notice empty test to ignore file in coverage report
    function test_baseTest() public {}

    function _forkLens() internal {
        lensFork = vm.createSelectFork(LENS_MAINNET_RPC_URL, LENS_MAINNET_STARTING_BLOCK);
        assertEq(block.chainid, LENS_MAINNET_CHAIN_ID);
    }

    function _deployInfra() internal {
        /// @dev get Lens global Feed contract and deploy Competitions contract
        config = new HelperConfig();
        (feed,,,,,,) = config.activeNetworkConfig();
        comp = new Competitions(feed);
        /// @dev transfer ownership
        vm.prank(comp.owner());
        comp.transferOwnership(owner);
    }

    /*//////////////////////////////////////////////////////////////
                                UTILITY
    //////////////////////////////////////////////////////////////*/
    function _changePrank(address newPrank) internal {
        vm.stopPrank();
        vm.startPrank(newPrank);
    }

    function _stopPrank() internal {
        vm.stopPrank();
    }

    function _createCompetition() internal returns (uint256 competitionId) {
        string memory theme = "pirates";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 votingDeadline = submissionDeadline + 10 minutes;

        _changePrank(creator);
        competitionId = comp.createCompetition{value: ONE_ETH}(theme, submissionDeadline, votingDeadline);
    }

    function _createPost() internal returns (uint256 postId) {
        CreatePostParams memory postParams = CreatePostParams({
            author: author,
            contentURI: "https://example.com",
            repostedPostId: 0,
            quotedPostId: 0,
            repliedPostId: 0,
            ruleChanges: new RuleChange[](0),
            extraData: new KeyValue[](0)
        });
        KeyValue[] memory customParams = new KeyValue[](0);
        RuleProcessingParams[] memory feedRulesParams = new RuleProcessingParams[](0);
        RuleProcessingParams[] memory rootPostRulesParams = new RuleProcessingParams[](0);
        RuleProcessingParams[] memory quotedPostRulesParams = new RuleProcessingParams[](0);

        _changePrank(author);
        postId = IFeed(feed).createPost(
            postParams, customParams, feedRulesParams, rootPostRulesParams, quotedPostRulesParams
        );
    }
}

// bytes4(keccak256("InvalidMsgSender()"))

/**
 * function createPost(
 *             CreatePostParams calldata postParams,
 *             KeyValue[] calldata customParams,
 *             RuleProcessingParams[] calldata feedRulesParams,
 *             RuleProcessingParams[] calldata rootPostRulesParams,
 *             RuleProcessingParams[] calldata quotedPostRulesParams
 *         ) external returns (uint256)
 */

/**
 * struct KeyValue {
 *     bytes32 key;
 *     bytes value;
 * }
 */

/**
 * struct RuleProcessingParams {
 *     address ruleAddress;
 *     bytes32 configSalt;
 *     KeyValue[] ruleParams;
 * }
 */
