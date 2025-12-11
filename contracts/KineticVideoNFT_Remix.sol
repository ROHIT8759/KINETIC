// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title KineticVideoNFT - Remix Ready Version
 * @dev Deploy this on Story Protocol Iliad Testnet via Remix
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://remix.ethereum.org
 * 2. Create a new file and paste this code
 * 3. In Remix, go to "Solidity Compiler" tab:
 *    - Select compiler version 0.8.23 or higher
 *    - Click "Compile"
 * 4. Go to "Deploy & Run Transactions" tab:
 *    - Environment: "Injected Provider - MetaMask"
 *    - Make sure MetaMask is connected to Story Iliad Testnet:
 *      - Network Name: Story Iliad Testnet
 *      - RPC URL: https://testnet.storyrpc.io
 *      - Chain ID: 1513
 *      - Currency Symbol: IP
 *      - Block Explorer: https://testnet.storyscan.xyz
 * 5. Click "Deploy"
 * 6. Copy the deployed contract address to your .env:
 *    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
 * 
 * Get testnet IP tokens from: https://faucet.story.foundation
 */

// OpenZeppelin Contracts - Using import for Remix
// Remix will automatically fetch these from npm
import "@openzeppelin/contracts@5.0.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";

contract KineticVideoNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from token ID to IPFS hash of the video
    mapping(uint256 => string) public videoIpfsHashes;
    
    // Mapping from token ID to Story Protocol IP ID
    mapping(uint256 => address) public tokenToIpId;
    
    // Mapping from token ID to creator address (original minter)
    mapping(uint256 => address) public creators;
    
    // Mapping from token ID to verification status (World ID verified)
    mapping(uint256 => bool) public isVerifiedHuman;
    
    // Mapping from token ID to category
    mapping(uint256 => string) public categories;

    // Events
    event VideoMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        string metadataUri,
        string category,
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
     * @param category Video category (motion, industrial, nature, etc.)
     * @param verified Whether the creator is World ID verified
     */
    function mintVideo(
        address to,
        string memory metadataUri,
        string memory ipfsHash,
        string memory category,
        bool verified
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
        
        videoIpfsHashes[tokenId] = ipfsHash;
        creators[tokenId] = to;
        isVerifiedHuman[tokenId] = verified;
        categories[tokenId] = category;

        emit VideoMinted(tokenId, to, ipfsHash, metadataUri, category, verified);

        return tokenId;
    }

    /**
     * @dev Set the Story Protocol IP ID for a token
     * @param tokenId The token ID
     * @param ipId The Story Protocol IP Asset ID
     */
    function setIpId(uint256 tokenId, address ipId) public {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
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
        string memory category,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            creators[tokenId],
            videoIpfsHashes[tokenId],
            tokenToIpId[tokenId],
            isVerifiedHuman[tokenId],
            categories[tokenId],
            tokenURI(tokenId)
        );
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Check if a token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get all tokens owned by an address (gas intensive for large collections)
     */
    function tokensOfOwner(address _owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter && index < tokenCount; i++) {
            if (_ownerOf(i) == _owner) {
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
