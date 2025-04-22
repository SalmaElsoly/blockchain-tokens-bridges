// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SalmaToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {

    uint256 public lockedTokens;

    event TokensLocked(address indexed locker, uint256 amount);
    event TokensUnlocked(address indexed locker, uint256 amount);

    error InsufficientLockedTokens();
    error InsufficientBalance();

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    function initialize(uint256 initialSupply) initializer public {
         __UUPSUpgradeable_init();
        __ERC20_init("SalmaToken", "SLT");
        __Ownable_init(msg.sender);
        __ERC20Permit_init("SalmaToken");
        _mint(msg.sender, initialSupply* 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function lockTokens(uint256 amount) public payable{
        uint256 perciseAmount = amount * 10 ** decimals();
        if(balanceOf(msg.sender) < perciseAmount){
            revert InsufficientBalance();
        }
        _transfer(msg.sender, address(this), perciseAmount);
        lockedTokens += perciseAmount;
        emit TokensLocked(msg.sender, amount);
    }

    function unlockTokens(uint256 amount) onlyOwner public{
        uint256 perciseAmount = amount * 10 ** decimals();
        if(lockedTokens < perciseAmount){
            revert InsufficientLockedTokens();
        }
        _transfer(address(this), msg.sender, perciseAmount);
        lockedTokens -= perciseAmount;
        emit TokensUnlocked(msg.sender, amount);
    }

}