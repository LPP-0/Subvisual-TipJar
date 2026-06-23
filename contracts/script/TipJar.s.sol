// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/TipJar.sol";

contract TipJarScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        TipJar tipJar = new TipJar();

        vm.stopBroadcast();

        console.log("TipJar deployed at:", address(tipJar));
    }
}