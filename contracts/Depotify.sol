// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Depotify is Ownable, ERC721URIStorage {
    constructor() ERC721("Depotify", "DPT") Ownable(msg.sender) {}

    uint256 public tokenId;

    struct Item {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        address payable artist;
        uint256 royalty;
    }

    Item[] public marketItems;
    mapping(uint256 => uint256) public likes;

    event TokenMinted(uint256 indexed tokenId, address indexed artist, uint256 royalty);
    event MarketItemBought(uint256 indexed tokenId, address indexed seller, address buyer, uint256 price, address indexed artist);
    event MarketItemRelisted(uint256 indexed tokenId, address indexed seller, uint256 price, address indexed artist);
    event TokenLiked(uint256 indexed tokenId, address indexed liker, uint256 amount);

    function mintToken(string memory _tokenURI, uint256 _price, uint256 _royalty) external {
        tokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        Item memory newItem = Item(
            tokenId,
            payable(address(0)),
            _price,
            payable(msg.sender),
            _royalty
        );
        marketItems.push(newItem);
        emit TokenMinted(tokenId, msg.sender, _royalty);
    }

    function buyToken(uint256 _tokenId) external payable {
        uint256 price = marketItems[_tokenId].price;
        address seller = marketItems[_tokenId].seller;
        address artist = marketItems[_tokenId].artist;
        uint256 royalty = marketItems[_tokenId].royalty;

        require(msg.value == price, "Please send the required price to complete the purchase.");
        marketItems[_tokenId].seller = payable(address(0));
        _transfer(address(this), msg.sender, _tokenId);
        payable(artist).transfer(royalty);
        payable(seller).transfer(msg.value - royalty);
        emit MarketItemBought(_tokenId, seller, msg.sender, price, artist);
    }

    function getAllUnsoldTokens() external view returns (Item[] memory) {
        uint256 unsoldCount = 0;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (marketItems[i].seller == address(0)) {
                unsoldCount++;
            }
        }

        Item[] memory tokens = new Item[](unsoldCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (marketItems[i].seller == address(0)) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return tokens;
    }

    function getMyTokens() external view returns (Item[] memory) {
        uint256 myTokenCount = balanceOf(msg.sender);
        Item[] memory tokens = new Item[](myTokenCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (ownerOf(marketItems[i].tokenId) == msg.sender) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return tokens;
    }

    function resellTokens(uint256 _tokenId, uint256 _price) external payable {
        uint256 royalty = marketItems[_tokenId].royalty;
        address artist = marketItems[_tokenId].artist;

        require(msg.value == royalty, "Must pay Royalty");
        require(_price > 0, "Price must be greater than 0");

        marketItems[_tokenId].price = _price;
        marketItems[_tokenId].seller = payable(msg.sender);
        _transfer(msg.sender, address(this), _tokenId);
        payable(artist).transfer(msg.value);
        emit MarketItemRelisted(_tokenId, msg.sender, _price, artist);
    }

    function likeToken(uint256 _tokenId) external payable {
        require(msg.value > 0, "Must pay to like a token");
        likes[_tokenId]++;
        emit TokenLiked(_tokenId, msg.sender, msg.value);
    }
}
