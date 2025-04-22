// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SolyToken is ERC20, ERC20Permit, Ownable {
    address treasury;
    uint transactionFees;

   event FeesPaid(address indexed from, uint256 feeAmount);

    constructor(uint initialSupply, address treasuryAddress, uint transactionFee) ERC20("SolyToken", "SOLY") ERC20Permit("SolyToken") Ownable(msg.sender){
        if (treasuryAddress == address(0)) revert("Treasury address cannot be empty");
        require(transactionFees <= 10, "Transaction fee too high");
        treasury = treasuryAddress;
        _mint(msg.sender, initialSupply *10 ** decimals() );
        transactionFees = transactionFee;
    }

   function mint(address to, uint amount) external onlyOwner {
         _mint(to, amount);
    }

    
    function transfer(address to, uint value) public  override returns (bool) {
        uint256 feeAmount = (value * transactionFees) / 100;
        uint256 netAmount = value - feeAmount;
        super._transfer(msg.sender, treasury, feeAmount);
        emit FeesPaid(msg.sender,feeAmount);

        super._transfer(msg.sender, to, netAmount);
        return true;
    }
}
