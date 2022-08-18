// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Secret3 is ERC1155, Ownable, Pausable, ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter public tokenIdCounter;

    uint256 public createTokenPrice = 0.01 ether;
    uint256 public platformCommission = 100; // 100 / 10000 = 1%
    uint256 public platformCommissionBalance = 0;

    mapping(uint256 => string) public tokenURIMap;
    mapping(address => uint256[]) public tokenOwnByMap;
    mapping(uint256 => address) public tokenOwnerMap;
    mapping(uint256 => uint256) public tokenVaultMap;
    mapping(uint256 => uint256) public basicPriceMap;
    mapping(uint256 => uint256) public inviteCommissionMap; // inviteCommission/10000 = inviterBalanceDelta
    mapping(address => address) public inviteByMap;
    mapping(address => uint256) public inviterBalanceMap;

    mapping(address => uint256) public userTotalMintCountMap; // userAddress => userTotalAmount
    mapping(uint256 => string[]) public mintMetadataCIDArrayMap; // tokenId =>  mintMetadataCID[], store all cid for every token's mint
    mapping(uint256 => string[]) public tokenItemsCIDArrayMap; // tokenId =>  itemsCID[], store all cid for every token's items

    // profile
    mapping(address => string) public userProfileMap; // userAddress => userProfileCID
    address[] public userProfileAddressList;

    function addTokenItem(uint256 tokenId, string memory itemCID) public {
        address createdBy = _msgSender();
        require(
            createdBy == tokenOwnerMap[tokenId],
            "you are not the token owner"
        );
        tokenItemsCIDArrayMap[tokenId].push(itemCID);
    }

    // get specify token's items
    function getTokenItems(
        uint256 tokenId,
        uint256 start,
        uint256 limit
    ) public view returns (string[] memory arr_) {
        string[] memory all = tokenItemsCIDArrayMap[tokenId];
        uint256 lens = all.length - start;
        if (lens < limit) {
            limit = lens;
        }
        arr_ = new string[](limit);

        for (uint256 i = 0; i < limit; i++) {
            arr_[i] = all[start + i];
        }
    }

    // get all tokens
    function getTokenList(uint256 start, uint256 limit)
        public
        view
        returns (
            string[] memory tokenURIs,
            uint256[] memory totalMintCounts,
            uint256[] memory mintMetadataCIDList
        )
    {
        uint256 lens = uint256(tokenIdCounter._value - start);
        if (lens < limit) {
            limit = lens;
        }

        tokenURIs = new string[](limit);
        totalMintCounts = new uint256[](limit);
        mintMetadataCIDList = new uint256[](limit);

        for (uint256 i = 0; i < limit; i++) {
            tokenURIs[i] = tokenURIMap[start + i];
            totalMintCounts[i] = totalSupply(start + i);
            mintMetadataCIDList[i] = mintMetadataCIDArrayMap[start + i].length;
        }
    }

    function getTokenListByOwner(address owner)
        public
        view
        returns (
            uint256[] memory tokenIds,
            string[] memory tokenURIs,
            uint256[] memory totalMintCounts,
            uint256[] memory mintMetadataCIDList
        )
    {
        uint256 lens = tokenOwnByMap[owner].length;

        tokenIds = new uint256[](lens);
        tokenURIs = new string[](lens);
        totalMintCounts = new uint256[](lens);
        mintMetadataCIDList = new uint256[](lens);

        for (uint256 i = 0; i < lens; i++) {
            uint256 tokenId = tokenOwnByMap[owner][i];
            tokenIds[i] = tokenId;
            tokenURIs[i] = tokenURIMap[tokenId];
            totalMintCounts[i] = totalSupply(tokenId);
            mintMetadataCIDList[i] = mintMetadataCIDArrayMap[tokenId].length;
        }
    }

    // get specify token mint metadata
    function getMintMetadataCIDList(
        uint256 tokenId,
        uint256 start,
        uint256 limit
    ) public view returns (string[] memory arr_) {
        string[] memory all = mintMetadataCIDArrayMap[tokenId];
        uint256 lens = all.length - start;
        if (lens < limit) {
            limit = lens;
        }
        arr_ = new string[](limit);

        for (uint256 i = 0; i < limit; i++) {
            arr_[i] = all[start + i];
        }
    }

    // function getUserList(uint256 start, uint256 limit)
    //     public
    //     view
    //     returns (string[] memory arr_)
    // {
    //     uint256 lens = userProfileAddressList.length - start;
    //     if (lens < limit) {
    //         limit = lens;
    //     }
    //     arr_ = new string[](limit);

    //     for (uint256 i = 0; i < limit; i++) {
    //         arr_[i] = userProfileMap[userProfileAddressList[start + i]];
    //     }
    // }

    function updateProfile(string memory profileCID) public whenNotPaused {
        require(bytes(profileCID).length > 0, "profileCID is empty");
        address createdBy = _msgSender();

        if (bytes(userProfileMap[createdBy]).length == 0) {
            userProfileAddressList.push(createdBy);
        }
        userProfileMap[createdBy] = profileCID;
    }

    /* solhint-disable func-visibility */
    constructor() ERC1155("") {
        _setURI("");
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory tokenURI = tokenURIMap[tokenId];
        return tokenURI;
    }

    function createToken(
        uint256 basicPrice,
        uint256 inviteCommission,
        string memory metadataCID
    ) public payable whenNotPaused {
        require(bytes(metadataCID).length > 0, "metadataCID is empty");
        require(
            inviteCommission <= 1000,
            "inviteCommission must smaller than 10%"
        );
        require(
            msg.value >= createTokenPrice,
            "insufficient funds for createToken"
        );

        address createdBy = _msgSender();

        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();

        tokenURIMap[tokenId] = metadataCID;
        tokenOwnerMap[tokenId] = createdBy;
        basicPriceMap[tokenId] = basicPrice;
        inviteCommissionMap[tokenId] = inviteCommission;
        tokenOwnByMap[createdBy].push(tokenId);
    }

    function updateToken(
        uint256 tokenId,
        uint256 basicPrice,
        uint256 inviteCommission,
        string memory metadataCID
    ) public whenNotPaused {
        address createdBy = _msgSender();
        require(
            tokenOwnerMap[tokenId] == createdBy,
            "you are not the token creator"
        );
        require(bytes(metadataCID).length > 0, "metadataCID is empty");
        require(
            inviteCommission <= 1000,
            "inviteCommission must smaller than 10%"
        );

        tokenURIMap[tokenId] = metadataCID;
        basicPriceMap[tokenId] = basicPrice;
        inviteCommissionMap[tokenId] = inviteCommission;
    }

    function mintNFT(
        uint256 tokenId,
        uint256 amount,
        string memory metadataCID
    ) public payable whenNotPaused {
        require(bytes(tokenURIMap[tokenId]).length > 0, "token not create yet");
        uint256 basicPrice = basicPriceMap[tokenId];
        require(
            msg.value >= basicPrice * amount,
            "insufficient funds for mintNFT"
        );
        address createdBy = _msgSender();

        _mint(createdBy, tokenId, amount, "");
        userTotalMintCountMap[createdBy] += amount;
        mintMetadataCIDArrayMap[tokenId].push(metadataCID);

        uint256 inviteCommission = inviteCommissionMap[tokenId];

        uint256 inviterBalanceDelta = 0;
        address inviter = inviteByMap[createdBy];
        if (inviter != address(0)) {
            inviterBalanceDelta = (inviteCommission * msg.value) / 10000;
            inviterBalanceMap[inviter] += inviterBalanceDelta;
        }

        uint256 platformCommissionDelta = (platformCommission * msg.value) /
            10000;
        platformCommissionBalance += platformCommissionDelta;
        tokenVaultMap[tokenId] +=
            msg.value -
            (inviterBalanceDelta + platformCommissionDelta);
    }

    // TODO: refactor the withdraw code before deploy to mainnet
    function withdrawTokenVault(uint256 tokenId, address withdrawTo)
        public
        whenNotPaused
    {
        address createdBy = _msgSender();
        require(
            createdBy == tokenOwnerMap[tokenId],
            "you are not the owner of current token"
        );
        uint256 tokenVault = tokenVaultMap[tokenId];

        require(tokenVault > 0, "tokenVault must greater than 0");
        tokenVaultMap[tokenId] = 0;
        (bool success, ) = payable(withdrawTo).call{value: tokenVault}("");
        require(success, "pay failed");
    }

    function withdrawInviterBalance(address withdrawTo) public whenNotPaused {
        address createdBy = _msgSender();
        uint256 inviterBalance = inviterBalanceMap[createdBy];
        require(inviterBalance > 0, "inviterBalance must greater than 0");
        inviterBalanceMap[createdBy] = 0;

        (bool success, ) = payable(withdrawTo).call{value: inviterBalance}("");
        require(success, "pay failed");
    }

    function withdrawPlatformCommissionBalance(address withdrawTo)
        public
        whenNotPaused
        onlyOwner
    {
        require(
            platformCommissionBalance > 0,
            "platformCommissionBalance must greater than 0"
        );
        platformCommissionBalance = 0;
        (bool success, ) = payable(withdrawTo).call{
            value: platformCommissionBalance
        }("");
        require(success, "pay failed");
    }

    /* solhint-disable */
    function withdraw(address withdrawTo) public onlyOwner {
        (bool success, ) = payable(withdrawTo).call{
            value: (address(this).balance)
        }("");
        require(success, "Failed to withdraw");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
