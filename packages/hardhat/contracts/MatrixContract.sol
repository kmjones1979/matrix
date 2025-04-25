// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "./MatrixNFT.sol";

/**
 * @title The Matrix
 * @dev A smart contract that simulates "The Matrix" with multiple levels of security to hack through
 */
contract MatrixContract {
    // State Variables
    address public immutable oracle; // Admin/oracle that can update challenges
    
    // User progress tracking
    mapping(address => uint8) public userLevel; // Track user progress through levels
    mapping(address => bool) public redPillTaken; // Has user chosen the red pill?
    mapping(address => uint256) public lastAccessTime; // For cooldown mechanics
    mapping(address => mapping(string => bool)) public unlockedSecrets; // Track which easter eggs a user has found
    
    // Challenge data
    mapping(uint8 => bytes32) private passcodeHashes; // Hashed passcodes for each level
    mapping(uint8 => string) public levelHints; // Hints for each level
    mapping(uint8 => string) public levelNames; // Names for each level

    // Easter eggs and rewards
    mapping(bytes32 => uint256) private easterEggRewards; // Rewards for finding easter eggs
    
    // NFT contract for level badges
    MatrixNFT public nftContract;
    bool public nftMintingEnabled = false;
    
    // Events
    event LevelCompleted(address indexed user, uint8 level, uint256 timestamp);
    event SecretFound(address indexed user, string secretId);
    event RedPillTaken(address indexed user);
    event BluePillTaken(address indexed user);
    event MatrixEntered(address indexed user);
    event NFTMinted(address indexed user, uint8 level, uint256 tokenId);
    
    // Constructor
    constructor(address _oracle) {
        oracle = _oracle;
        
        // Initialize level names
        levelNames[0] = "Wake Up, Neo...";
        levelNames[1] = "Follow the White Rabbit";
        levelNames[2] = "The Choice";
        levelNames[3] = "Training Program";
        levelNames[4] = "The Matrix";
        
        // Set initial passcodes (in production, oracle would set these)
        _setPasscodeHash(0, "wake_up");
        _setPasscodeHash(1, "white_rabbit");
        _setPasscodeHash(2, "red_pill");
        _setPasscodeHash(3, "i_know_kung_fu");
        _setPasscodeHash(4, "there_is_no_spoon");
        
        // Set initial hints
        levelHints[0] = "The most famous line that starts everything...";
        levelHints[1] = "Look for the symbol that guides you to the truth";
        levelHints[2] = "One pill offers truth, the other ignorance";
        levelHints[3] = "What Neo said after his first training program";
        levelHints[4] = "Remember what the child says about bending reality";
        
        // Setup some easter eggs (hashed secret phrase => reward amount)
        easterEggRewards[keccak256(abi.encodePacked("morpheus"))] = 0.01 ether;
        easterEggRewards[keccak256(abi.encodePacked("trinity"))] = 0.01 ether;
        easterEggRewards[keccak256(abi.encodePacked("nebuchadnezzar"))] = 0.02 ether;
    }
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only the Oracle can perform this action");
        _;
    }
    
    /**
     * @dev Sets the NFT contract address
     * @param _nftContract The address of the NFT contract
     */
    function setNFTContract(address _nftContract) external onlyOracle {
        nftContract = MatrixNFT(_nftContract);
        nftMintingEnabled = true;
    }
    
    /**
     * @dev Enables or disables NFT minting
     * @param _enabled Whether NFT minting is enabled
     */
    function setNFTMintingEnabled(bool _enabled) external onlyOracle {
        nftMintingEnabled = _enabled;
    }
    
    /**
     * @dev Attempt to solve the current level with a passcode
     * @param passcode The passcode to try
     */
    function solveLevel(string memory passcode) public {
        uint8 currentLevel = userLevel[msg.sender];
        require(currentLevel < 5, "You have already reached the highest level");
        
        // Check cooldown to prevent brute forcing
        require(block.timestamp - lastAccessTime[msg.sender] >= 3 seconds, "Too many attempts, please wait");
        lastAccessTime[msg.sender] = block.timestamp;
        
        // Verify passcode
        bytes32 passcodeHash = keccak256(abi.encodePacked(passcode));
        
        // Use stored hash for validation
        require(passcodeHash == passcodeHashes[currentLevel], "Incorrect passcode");
        
        // Level up the user
        userLevel[msg.sender] = currentLevel + 1;
        
        // Special case for level 2 (red pill choice)
        if (currentLevel == 2) {
            redPillTaken[msg.sender] = true;
            emit RedPillTaken(msg.sender);
        }
        
        // Emit level completion event
        emit LevelCompleted(msg.sender, currentLevel, block.timestamp);
        
        // Mint NFT badge for the level if enabled
        if (nftMintingEnabled && address(nftContract) != address(0)) {
            // NFT levels are 1-based (level 1-5), but our userLevel is 0-based
            uint8 completedLevel = currentLevel + 1;
            
            uint256 tokenId = nftContract.mintLevelBadge(msg.sender, completedLevel);
            if (tokenId > 0) {
                emit NFTMinted(msg.sender, completedLevel, tokenId);
            }
        }
        
        // If user reaches final level
        if (currentLevel + 1 == 5) {
            emit MatrixEntered(msg.sender);
        }
    }
    
    /**
     * @dev Choose the blue pill (alternative path)
     */
    function takeBluePill() public {
        require(userLevel[msg.sender] == 2, "You can only take the blue pill at level 2");
        require(!redPillTaken[msg.sender], "You've already taken the red pill");
        
        // Reset progress
        userLevel[msg.sender] = 0;
        emit BluePillTaken(msg.sender);
    }
    
    /**
     * @dev Try to discover an easter egg with a secret phrase
     * @param secretPhrase The secret phrase to try
     */
    function discoverSecret(string memory secretPhrase) public {
        bytes32 secretHash = keccak256(abi.encodePacked(secretPhrase));
        uint256 reward = easterEggRewards[secretHash];
        
        // Check if this is a valid secret and user hasn't found it yet
        require(reward > 0, "Invalid secret phrase");
        require(!unlockedSecrets[msg.sender][secretPhrase], "Secret already discovered");
        
        // Mark secret as discovered
        unlockedSecrets[msg.sender][secretPhrase] = true;
        
        // Emit event
        emit SecretFound(msg.sender, secretPhrase);
        
        // If there's a reward and contract has enough balance, send it
        if (reward > 0 && address(this).balance >= reward) {
            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "Failed to send reward");
        }
    }
    
    /**
     * @dev Get current level details for a user
     */
    function getUserProgress(address user) public view returns (
        uint8 level,
        string memory levelName,
        string memory hint,
        bool hasRedPill
    ) {
        level = userLevel[user];
        levelName = levelNames[level];
        hint = levelHints[level];
        hasRedPill = redPillTaken[user];
    }
    
    /**
     * @dev Oracle functions to manage the passcodes
     */
    function setPasscode(uint8 level, string memory passcode) public onlyOracle {
        _setPasscodeHash(level, passcode);
    }
    
    function setLevelHint(uint8 level, string memory hint) public onlyOracle {
        levelHints[level] = hint;
    }
    
    function setLevelName(uint8 level, string memory name) public onlyOracle {
        levelNames[level] = name;
    }
    
    function addEasterEgg(string memory secretPhrase, uint256 reward) public onlyOracle {
        bytes32 secretHash = keccak256(abi.encodePacked(secretPhrase));
        easterEggRewards[secretHash] = reward;
    }
    
    // Internal functions
    function _setPasscodeHash(uint8 level, string memory passcode) private {
        bytes32 passcodeHash = keccak256(abi.encodePacked(passcode));
        passcodeHashes[level] = passcodeHash;
    }
    
    // To receive ETH for rewards
    receive() external payable {}
} 