// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SDAthleteNFT
 * @notice ERC-1155 multi-token contract for Street Dinamics Athlete Cards.
 *         Token IDs map 1:1 to rarity tiers (1=rising_star … 4=living_legend).
 *         Users pay ETH directly; platform minter wallet signs the tx.
 *         Deploy on Polygon PoS for low gas fees.
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SDAthleteNFT is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ─── CONSTANTS ────────────────────────────────────────────────────────────
    uint256 public constant RISING_STAR     = 1;
    uint256 public constant BREAKOUT_TALENT = 2;
    uint256 public constant ELITE_PERFORMER = 3;
    uint256 public constant LIVING_LEGEND   = 4;

    // Tier prices in wei (Polygon MATIC)
    mapping(uint256 => uint256) public tierPrice;

    // Supply tracking
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalMinted;

    // Authorized minter (backend wallet)
    address public minter;

    // Fee recipient
    address public feeRecipient;

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    event AthleteCardMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 amount,
        string  athleteName,
        uint256 serialStart
    );
    event MinterUpdated(address indexed newMinter);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────────
    constructor(
        string  memory _baseUri,
        address _minter,
        address _feeRecipient
    ) ERC1155(_baseUri) Ownable(msg.sender) {
        minter       = _minter;
        feeRecipient = _feeRecipient;

        // Default prices (in MATIC wei, ~$10–100 range at ~$0.5/MATIC)
        tierPrice[RISING_STAR]     = 20  ether; //  20 MATIC ≈ $10
        tierPrice[BREAKOUT_TALENT] = 50  ether; //  50 MATIC ≈ $25
        tierPrice[ELITE_PERFORMER] = 150 ether; // 150 MATIC ≈ $75
        tierPrice[LIVING_LEGEND]   = 300 ether; // 300 MATIC ≈ $150

        // Max supply per tier
        maxSupply[RISING_STAR]     = 1000;
        maxSupply[BREAKOUT_TALENT] = 500;
        maxSupply[ELITE_PERFORMER] = 200;
        maxSupply[LIVING_LEGEND]   = 50;
    }

    // ─── MODIFIERS ────────────────────────────────────────────────────────────
    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner(), "SDAthleteNFT: not minter");
        _;
    }

    // ─── MINT (backend-signed, ETH payment) ──────────────────────────────────
    /**
     * @notice Mint athlete card(s) to recipient. Called by minter backend wallet.
     *         Recipient sends ETH; minter pays gas.
     */
    function mint(
        address        to,
        uint256        tokenId,
        uint256        amount,
        string calldata athleteName
    ) external payable onlyMinter nonReentrant returns (uint256 serialStart) {
        require(tokenId >= 1 && tokenId <= 4, "SDAthleteNFT: invalid tier");
        require(amount >= 1 && amount <= 100, "SDAthleteNFT: amount out of range");
        require(
            totalMinted[tokenId] + amount <= maxSupply[tokenId],
            "SDAthleteNFT: exceeds max supply"
        );

        uint256 required = tierPrice[tokenId] * amount;
        require(msg.value >= required, "SDAthleteNFT: insufficient payment");

        serialStart = totalMinted[tokenId] + 1;
        totalMinted[tokenId] += amount;

        _mint(to, tokenId, amount, "");

        // Forward payment to fee recipient
        if (msg.value > 0) {
            (bool ok,) = feeRecipient.call{value: msg.value}("");
            require(ok, "SDAthleteNFT: payment forwarding failed");
        }

        emit AthleteCardMinted(to, tokenId, amount, athleteName, serialStart);
    }

    /**
     * @notice Admin free-mint (for rewards, UGC prizes, Last Man Standing).
     */
    function adminMint(
        address        to,
        uint256        tokenId,
        uint256        amount,
        string calldata athleteName
    ) external onlyOwner nonReentrant returns (uint256 serialStart) {
        require(tokenId >= 1 && tokenId <= 4, "SDAthleteNFT: invalid tier");
        require(totalMinted[tokenId] + amount <= maxSupply[tokenId], "SDAthleteNFT: exceeds max supply");

        serialStart = totalMinted[tokenId] + 1;
        totalMinted[tokenId] += amount;
        _mint(to, tokenId, amount, "");

        emit AthleteCardMinted(to, tokenId, amount, athleteName, serialStart);
    }

    // ─── URI ──────────────────────────────────────────────────────────────────
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString(), ".json"));
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────
    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function setPrice(uint256 tokenId, uint256 priceWei) external onlyOwner {
        tierPrice[tokenId] = priceWei;
        emit PriceUpdated(tokenId, priceWei);
    }

    function setMaxSupply(uint256 tokenId, uint256 supply) external onlyOwner {
        require(supply >= totalMinted[tokenId], "SDAthleteNFT: below already minted");
        maxSupply[tokenId] = supply;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    // View helpers
    function availableSupply(uint256 tokenId) external view returns (uint256) {
        return maxSupply[tokenId] - totalMinted[tokenId];
    }
}