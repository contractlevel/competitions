// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.s.sol";
import {
    IFeed,
    CreatePostParams,
    Post,
    KeyValue,
    RuleProcessingParams,
    RuleChange
} from "@lens-protocol/lens-v3/contracts/core/interfaces/IFeed.sol";

contract CreatePost is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (uint256 postId) {
        HelperConfig config = new HelperConfig();
        (address feed,,,,,,) = config.activeNetworkConfig();

        vm.startBroadcast();

        CreatePostParams memory postParams = CreatePostParams({
            author: 0xD208335060493C8f3f5a3626Ac057BD231abF235,
            contentURI: "ipfs://QmYyWke2bCECSHnzfJz9LQy2TfEms9fxWC15NcoBGfAr23",
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

        // 32910474675807611669661198314046357146877598215297530963739702532800160048202
        postId = IFeed(feed).createPost(
            postParams, customParams, feedRulesParams, rootPostRulesParams, quotedPostRulesParams
        );

        vm.stopBroadcast();
    }
}
