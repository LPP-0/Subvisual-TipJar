// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract TipJar {
    event NewTip(address indexed from, uint256 timestamp, string message, uint256 amount);

    struct Tip{
        address from;
        uint256 timestamp;
        string message;
        uint256 amount;
    }

    Tip[] public tips;
    address public immutable owner;

    constructor(){
        owner = msg.sender;
    }

    function sendTip(string memory _message) public payable {
        require(msg.value > 0, "Tip must be greater than 0");

        tips.push(Tip(msg.sender, block.timestamp, _message, msg.value));

        emit NewTip(msg.sender, block.timestamp, _message, msg.value);

    }


    function withdraw(uint256 _amount) public {
        require(msg.sender == owner, "Only the owner can withdraw funds!");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= address(this).balance, "Insufficient contract balance");

        (bool success, ) = owner.call{value: _amount}("");
        require(success, "Failed to withdraw funds");
    }

    function getTips() public view returns (Tip[] memory) {
        return tips;
    }
}