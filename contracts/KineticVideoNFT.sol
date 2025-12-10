// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title KineticVideoNFT
 * @dev NFT contract for Kinetic RWA Training Data Marketplace
 * Each NFT represents a video that can be registered as an IP Asset on Story Protocol
 * 
 * Deploy on Story Protocol Iliad Testnet:
 * - Chain ID: 1513
 * - RPC: https://testnet.storyrpc.io
 * - Explorer: https://testnet.storyscan.xyz
 * 
 * After deployment, register the NFT with Story Protocol's IP Asset Registry
 */
contract KineticVideoNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to IPFS hash of the video
    mapping(uint256 => string) public videoIpfsHashes;
    
    // Mapping from token ID to Story Protocol IP ID
    mapping(uint256 => address) public tokenToIpId;
    
    // Mapping from token ID to creator address (original minter)
    mapping(uint256 => address) public creators;
    
    // Mapping from token ID to verification status (World ID verified)
    mapping(uint256 => bool) public isVerifiedHuman;

    // Events
    event VideoMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        string metadataUri,
        bool isVerified
    );
    
    event IPRegistered(
        uint256 indexed tokenId,
        address indexed ipId
    );

    constructor() ERC721("Kinetic Video NFT", "KVID") Ownable(msg.sender) {}

    /**
     * @dev Mint a new video NFT
     * @param to Address to mint the NFT to
     * @param metadataUri IPFS URI containing the video metadata
     * @param ipfsHash IPFS hash of the video file
     * @param verified Whether the creator is World ID verified
     */
    function mintVideo(
        address to,
        string memory metadataUri,
        string memory ipfsHash,
        bool verified
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
        
        videoIpfsHashes[tokenId] = ipfsHash;
        creators[tokenId] = to;
        isVerifiedHuman[tokenId] = verified;

        emit VideoMinted(tokenId, to, ipfsHash, metadataUri, verified);

        return tokenId;
    }

    /**
     * @dev Set the Story Protocol IP ID for a token
     * @param tokenId The token ID
     * @param ipId The Story Protocol IP Asset ID
     */
    function setIpId(uint256 tokenId, address ipId) public {
        require(_ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        tokenToIpId[tokenId] = ipId;
        emit IPRegistered(tokenId, ipId);
    }

    /**
     * @dev Get video info for a token
     */
    function getVideoInfo(uint256 tokenId) public view returns (
        address creator,
        string memory ipfsHash,
        address ipId,
        bool verified,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            creators[tokenId],
            videoIpfsHashes[tokenId],
            tokenToIpId[tokenId],
            isVerifiedHuman[tokenId],
            tokenURI(tokenId)
        );
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get all tokens owned by an address
     */
    function tokensOfOwner(address owner_) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner_);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_ownerOf(i) == owner_) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
