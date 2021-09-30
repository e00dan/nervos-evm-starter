// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

contract SimpleStorage {
    uint256 storedData;

    event ValueChanged(address indexed _from, uint256 _value);

    constructor() payable {
        storedData = 123;
    }

    function set(uint256 x) public payable {
        storedData = x;
        emit ValueChanged(msg.sender, x);
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}
