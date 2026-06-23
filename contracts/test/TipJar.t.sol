// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/TipJar.sol";

contract TipJarTest is Test {
    TipJar public tipJar;
    address owner = address(1);
    address user = address(2);

    function setUp() public {
        vm.prank(owner);
        tipJar = new TipJar();
    }

    function testSendTip() public {
        vm.deal(user, 1 ether);

        vm.prank(user);
        tipJar.sendTip{value: 0.1 ether}("Great work!");

        TipJar.Tip[] memory tips = tipJar.getTips();
        
        assertEq(tips.length, 1);
        assertEq(tips[0].from, user);
        assertEq(tips[0].timestamp, block.timestamp);
        assertEq(tips[0].message, "Great work!");
        assertEq(tips[0].amount, 0.1 ether);
        assertEq(address(tipJar).balance, 0.1 ether);
    }

    function testWithdraw() public {
        vm.deal(user, 1 ether);

        vm.prank(user);
        tipJar.sendTip{value: 0.5 ether}("Keep it up!");

        vm.prank(user);
        vm.expectRevert("Only the owner can withdraw funds!");
        tipJar.withdraw(0.5 ether);

        uint256 initialOwnerBalance = owner.balance;

        vm.prank(owner);
        uint256 amount = 0.5 ether;
        tipJar.withdraw(amount);

        assertEq(address(tipJar).balance, 0);
        assertEq(owner.balance, initialOwnerBalance + amount);
    }


    function test_RevertWhen_SendZeroTip() public {
        vm.deal(user, 1 ether);
        vm.prank(user);

        vm.expectRevert("Tip must be greater than 0");
        tipJar.sendTip{value: 0 ether}("This is a zero tip!");
    }
}
