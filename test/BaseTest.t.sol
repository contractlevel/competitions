// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console2, Vm} from "forge-std/Test.sol";

import {DeployContentCompetition, ContentCompetition} from "../script/deploy/DeployContentCompetition.s.sol";
import {DeployCCAutomation, CCAutomation, HelperConfig} from "../script/deploy/DeployCCAutomation.s.sol";

// import {CCIPLocalSimulatorFork} from "@chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";

contract BaseTest is Test {
    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    string internal constant LENS_SEPOLIA_RPC_URL = "https://rpc.testnet.lens.dev";
    uint256 internal constant LENS_SEPOLIA_STARTING_BLOCK = 3491282; // https://testnet.lenscan.io/
    uint256 internal constant LENS_SEPOLIA_CHAIN_ID = 37111;
    uint256 internal lensFork;
    string internal ETH_SEPOLIA_RPC_URL = vm.envString("ETH_SEPOLIA_RPC_URL");
    uint256 internal constant ETH_SEPOLIA_STARTING_BLOCK = 8274222; // https://sepolia.etherscan.io/
    uint256 internal constant ETH_SEPOLIA_CHAIN_ID = 11155111;
    uint256 internal ethFork;

    // CCIPLocalSimulatorFork internal ccipLocalSimulatorFork;

    ContentCompetition internal comp;
    CCAutomation internal ccAuto;
    HelperConfig internal lensConfig;
    HelperConfig internal ethConfig;
    address internal feed;
    address internal lensLink;
    address internal ethLink;
    address internal lensCcipRouter;
    address internal ethCcipRouter;
    uint64 internal lensChainSelector;
    uint64 internal ethChainSelector;
    uint256 internal ccipGasLimit;

    address internal owner = makeAddr("owner");
    address internal user = makeAddr("user");
    address internal creator = makeAddr("creator");

    /*//////////////////////////////////////////////////////////////
                                 SET UP
    //////////////////////////////////////////////////////////////*/
    function setUp() public virtual {
        _deployInfra();
        // _setCrossChainVars();
    }

    // function setUp() public virtual {
    //     lensFork = vm.createSelectFork(LENS_SEPOLIA_RPC_URL, LENS_SEPOLIA_STARTING_BLOCK);
    //     assertEq(block.chainid, LENS_SEPOLIA_CHAIN_ID);
    //     ContentCompetition comp = new ContentCompetition(address(1), address(1), address(1), 1);
    // }

    /// @notice empty test to ignore file in coverage report
    function test_baseTest() public {}

    function _deployInfra() internal {
        // // @review - should this be after the chain forks?
        // ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        // vm.makePersistent(address(ccipLocalSimulatorFork));

        /// @dev fork lens
        lensFork = vm.createSelectFork(LENS_SEPOLIA_RPC_URL, LENS_SEPOLIA_STARTING_BLOCK);
        assertEq(block.chainid, LENS_SEPOLIA_CHAIN_ID);
        /// @dev deploy competition infrastructure
        // DeployContentCompetition deployComp = new DeployContentCompetition();
        // (comp, lensConfig) = deployComp.run();

        lensConfig = new HelperConfig();
        /// @dev fetch args passed in constructor by deploy script
        (feed, lensLink, lensCcipRouter, ccipGasLimit, ethChainSelector,,) = lensConfig.activeNetworkConfig();

        ContentCompetition comp = new ContentCompetition(feed, lensLink, lensCcipRouter, ccipGasLimit);
        /// @dev transfer ownership
        vm.prank(comp.owner());
        comp.transferOwnership(owner);

        // /// @dev fork eth
        // ethFork = vm.createSelectFork(ETH_SEPOLIA_RPC_URL, ETH_SEPOLIA_STARTING_BLOCK);
        // assertEq(block.chainid, ETH_SEPOLIA_CHAIN_ID);
        // /// @dev deploy automation infrastructure
        // DeployCCAutomation deployCcAuto = new DeployCCAutomation();
        // (ccAuto, ethConfig) = deployCcAuto.run();
        // /// @dev transfer ownership
        // vm.prank(ccAuto.owner());
        // ccAuto.transferOwnership(owner);
        // /// @dev fetch args passed in constructor by deploy script
        // (, ethLink, ethCcipRouter,, lensChainSelector,,) = ethConfig.activeNetworkConfig();
    }

    function _setCrossChainVars() internal {
        _changePrank(owner);

        _selectFork(lensFork);
        comp.setAllowedChain(ethChainSelector);
        comp.setAllowedPeer(address(ccAuto));

        // _selectFork(ethFork);
        // ccAuto.setAllowedChain(lensChainSelector);
        // ccAuto.setAllowedPeer(address(comp));
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

    function _selectFork(uint256 fork) internal {
        vm.selectFork(fork);
    }

    // function _selectForkAndRoute(uint256 fork) internal {
    //     ccipLocalSimulatorFork.switchChainAndRouteMessage(fork);
    // }
}
