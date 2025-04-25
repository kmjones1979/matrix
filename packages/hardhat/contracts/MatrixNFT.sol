// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MatrixNFT
 * @dev ERC721 token representing Matrix level completion badges
 */
contract MatrixNFT is ERC721Enumerable, Ownable {
    // Replace Counters with a simple uint256
    uint256 private _nextTokenId;
    
    // Mapping from token ID to level
    mapping(uint256 => uint8) private _tokenLevel;
    
    // Only the Matrix contract can mint tokens
    address public matrixContract;
    
    // Level names for metadata
    mapping(uint8 => string) public levelNames;
    
    // Level URIs for metadata
    mapping(uint8 => string) public levelURIs;
    
    // Events
    event LevelBadgeMinted(address indexed to, uint256 tokenId, uint8 level);
    
    constructor() ERC721("Matrix Badges", "MATRIX") Ownable(msg.sender) {
        // Set level names
        levelNames[1] = "Wake Up, Neo...";
        levelNames[2] = "Follow the White Rabbit";
        levelNames[3] = "The Choice";
        levelNames[4] = "Training Program";
        levelNames[5] = "The Matrix";
        
        // Set URIs to placeholder values - these should be updated to IPFS hashes
        levelURIs[1] = "https://ipfs.io/ipfs/QmLevelOneHash";
        levelURIs[2] = "https://ipfs.io/ipfs/QmLevelTwoHash";
        levelURIs[3] = "https://ipfs.io/ipfs/QmLevelThreeHash";
        levelURIs[4] = "https://ipfs.io/ipfs/QmLevelFourHash";
        levelURIs[5] = "https://ipfs.io/ipfs/QmLevelFiveHash";
    }
    
    /**
     * @dev Sets the Matrix contract address
     * @param _matrixContract The address of the Matrix contract
     */
    function setMatrixContract(address _matrixContract) external onlyOwner {
        matrixContract = _matrixContract;
    }
    
    /**
     * @dev Sets the URI for a level
     * @param level The level to set the URI for
     * @param uri The URI to set
     */
    function setLevelURI(uint8 level, string calldata uri) external onlyOwner {
        levelURIs[level] = uri;
    }
    
    /**
     * @dev Mints a new token for a level
     * @param to The address to mint the token to
     * @param level The level the token represents
     */
    function mintLevelBadge(address to, uint8 level) external returns (uint256) {
        require(msg.sender == matrixContract || msg.sender == owner(), "Only Matrix contract can mint");
        require(level > 0 && level <= 5, "Invalid level");
        
        // Check if the user already has a badge for this level
        bool hasLevelBadge = false;
        uint256 tokenCount = balanceOf(to);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(to, i);
            if (_tokenLevel[tokenId] == level) {
                hasLevelBadge = true;
                break;
            }
        }
        
        // If they don't have a badge for this level, mint one
        if (!hasLevelBadge) {
            uint256 newTokenId = _nextTokenId++;
            
            _mint(to, newTokenId);
            _tokenLevel[newTokenId] = level;
            
            emit LevelBadgeMinted(to, newTokenId, level);
            
            return newTokenId;
        }
        
        return 0; // Return 0 if no new token was minted
    }
    
    /**
     * @dev Returns the level of a token
     * @param tokenId The ID of the token
     */
    function getTokenLevel(uint256 tokenId) external view returns (uint8) {
        // Check if token exists by trying to get its owner
        try this.ownerOf(tokenId) returns (address) {
            return _tokenLevel[tokenId];
        } catch {
            revert("Token doesn't exist");
        }
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Check if token exists by trying to get its owner
        try this.ownerOf(tokenId) returns (address) {
            uint8 level = _tokenLevel[tokenId];
            return levelURIs[level];
        } catch {
            revert("Token doesn't exist");
        }
    }
} 