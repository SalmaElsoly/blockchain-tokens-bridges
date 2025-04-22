// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


contract SalmaNFT is ERC721Upgradeable, OwnableUpgradeable{
    uint256 private nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    function initialize() initializer public {
        __ERC721_init("SalmaNFT", "SLNFT");
        __Ownable_init(msg.sender);
    }

    function mint(address to, string memory uri) public onlyOwner returns (uint256){
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }
    
}