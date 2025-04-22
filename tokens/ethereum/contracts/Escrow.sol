// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address payable public seller;
    address payable public buyer;

    address public escrowAccount;
   

    bool public isCancelled;

    bool public isSellerApproved;
    bool public isBuyerApproved;

    constructor(address _seller)payable {
        seller = payable(_seller);
        buyer = payable(msg.sender);
        escrowAccount = address(this);

        isCancelled = false;
        isSellerApproved = false;
        isBuyerApproved = false;
    }

    function approve() public {
        if (msg.sender == seller) {
            isSellerApproved = true;
        } else if (msg.sender == buyer) {
            isBuyerApproved = true;
        }
    }

    function cancel() public {
        if (msg.sender == seller) {
            isCancelled = true;
            buyer.transfer(escrowAccount.balance);
        }
    }

    function release() public {
        if (isSellerApproved && isBuyerApproved) {
            seller.transfer(escrowAccount.balance);
        }
    }

}