// SPDX-License-Identifier: MiT

pragma solidity ^0.8.10;

contract Vivek_19IT062 {
    uint256 public totalSupply;
    string public name = "Vivek_19IT062"; // token name
    string public standard = "Vivek_19IT062 v1.0"; // token standard
    string public symbol = "VM62"; // token symbol

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // consrtuctor to initialize supply with iniialSupply
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        // allocate initial supply
        balanceOf[msg.sender] = _initialSupply;
    }

    // transfer function
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Exception if account doesn't have enough
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // transfer event
        emit Transfer(msg.sender, _to, _value);
        // Returns a boolean
        return true;
    }

    // approve
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transferfrom
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update the allowance
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}
