// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolaETH is ERC20, ERC20Permit, Ownable{
    mapping(address => bool) public authorizable;
    mapping(address => uint) public lockedBalances;

    event TokensLocked(address indexed user, uint256 amount, string destinationChain, address recipient);
    event TokensUnlocked(address indexed user, uint256 amount);
    constructor(uint initialSupply) ERC20("SolaETH", "SOLA") ERC20Permit("SolaETH") Ownable(msg.sender){
        _mint(msg.sender, initialSupply* 10 ** decimals());
    }

    modifier onlyAuthorized(){
        require(authorizable[msg.sender], "Not Authorized");
        _;
    }

    function addAuthorisedAddress(address newOwner) public onlyOwner{
        authorizable[newOwner] = true;
    }

    function removeAuthorisedAddress(address newOwner) public onlyOwner{
        authorizable[newOwner] = false;
    }


    function lockTokens(uint amount, string memory destinationChain, address recipient) public{
        require(amount > 0, "Amount must be greater than zero");
        lockedBalances[msg.sender] += amount;
        _transfer(msg.sender, address(this), amount);
        emit TokensLocked(msg.sender, amount, destinationChain, recipient);
    }

    function unlockTokens(uint amount, address account) public onlyAuthorized{
        require(amount > 0, "Amount must be greater than zero");
        require(lockedBalances[msg.sender] >= amount, "Insufficient locked balance");
        lockedBalances[account] -= amount;
        _transfer(address(this), msg.sender, amount);
        emit TokensUnlocked(msg.sender, amount);
    }

}