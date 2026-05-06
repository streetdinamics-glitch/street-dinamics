// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AthleteWager
 * @notice P2P escrow wagering gated by AthleteToken (ERC-1155) ownership.
 *         Polygon-compatible. Uses OpenZeppelin Transparent Proxy pattern.
 * @dev Deploy via TransparentUpgradeableProxy. Set oracle post-deploy.
 */

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AthleteWager is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    // ─── CONSTANTS ────────────────────────────────────────────────────────────
    uint256 public constant FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOM = 10_000;

    // ─── TYPES ────────────────────────────────────────────────────────────────
    enum WagerStatus { Open, Matched, Resolved, Refunded }
    enum Outcome     { Pending, SideA, SideB, Draw, Cancelled }

    struct Wager {
        bytes32  matchId;
        address  sideA;          // challenger
        address  sideB;          // acceptor (0x0 until matched)
        uint256  athleteTokenIdA;
        uint256  athleteTokenIdB;
        uint256  amount;         // per side, in $SD tokens
        WagerStatus status;
        Outcome  result;
        uint256  createdAt;
    }

    // ─── STORAGE ──────────────────────────────────────────────────────────────
    IERC20   public sdToken;         // $SD utility token
    IERC1155 public athleteNFT;      // ERC-1155 card contract
    address  public oracle;          // result-oracle wallet (configurable)
    address  public feeRecipient;

    mapping(uint256 => Wager) public wagers;
    uint256 public wagerCount;

    // matchId → wagerId (one active wager per match)
    mapping(bytes32 => uint256) public activeWagerByMatch;

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    event WagerCreated  (uint256 indexed wagerId, bytes32 indexed matchId, address sideA, uint256 tokenIdA, uint256 amount);
    event WagerMatched  (uint256 indexed wagerId, address sideB, uint256 tokenIdB);
    event WagerResolved (uint256 indexed wagerId, Outcome result, address winner, uint256 payout);
    event WagerRefunded (uint256 indexed wagerId, string reason);
    event OracleUpdated (address indexed newOracle);

    // ─── MODIFIERS ────────────────────────────────────────────────────────────
    modifier onlyOracle() {
        require(msg.sender == oracle, "AthleteWager: caller is not oracle");
        _;
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address _sdToken,
        address _athleteNFT,
        address _oracle,
        address _feeRecipient
    ) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        sdToken      = IERC20(_sdToken);
        athleteNFT   = IERC1155(_athleteNFT);
        oracle       = _oracle;
        feeRecipient = _feeRecipient;
    }

    // ─── WAGER CREATION ───────────────────────────────────────────────────────
    /**
     * @notice Create a new wager. Caller must hold athleteTokenIdA.
     * @param matchId         Off-chain match identifier
     * @param athleteTokenIdA ERC-1155 token ID for caller's athlete
     * @param athleteTokenIdB ERC-1155 token ID for the opponent's athlete
     * @param amount          $SD tokens to lock (both sides must match)
     */
    function createWager(
        bytes32 matchId,
        uint256 athleteTokenIdA,
        uint256 athleteTokenIdB,
        uint256 amount
    ) external nonReentrant returns (uint256 wagerId) {
        require(amount > 0, "AthleteWager: zero amount");
        require(activeWagerByMatch[matchId] == 0, "AthleteWager: wager already exists for match");
        require(
            athleteNFT.balanceOf(msg.sender, athleteTokenIdA) > 0,
            "AthleteWager: must hold athlete token to wager"
        );

        // Pull $SD from caller into escrow
        require(sdToken.transferFrom(msg.sender, address(this), amount), "AthleteWager: transfer failed");

        wagerId = ++wagerCount;
        wagers[wagerId] = Wager({
            matchId:         matchId,
            sideA:           msg.sender,
            sideB:           address(0),
            athleteTokenIdA: athleteTokenIdA,
            athleteTokenIdB: athleteTokenIdB,
            amount:          amount,
            status:          WagerStatus.Open,
            result:          Outcome.Pending,
            createdAt:       block.timestamp
        });
        activeWagerByMatch[matchId] = wagerId;

        emit WagerCreated(wagerId, matchId, msg.sender, athleteTokenIdA, amount);
    }

    /**
     * @notice Accept an open wager. Caller must hold athleteTokenIdB.
     */
    function acceptWager(uint256 wagerId) external nonReentrant {
        Wager storage w = wagers[wagerId];
        require(w.status == WagerStatus.Open, "AthleteWager: not open");
        require(w.sideA != msg.sender, "AthleteWager: cannot wager against yourself");
        require(
            athleteNFT.balanceOf(msg.sender, w.athleteTokenIdB) > 0,
            "AthleteWager: must hold opponent athlete token"
        );

        require(sdToken.transferFrom(msg.sender, address(this), w.amount), "AthleteWager: transfer failed");

        w.sideB   = msg.sender;
        w.status  = WagerStatus.Matched;

        emit WagerMatched(wagerId, msg.sender, w.athleteTokenIdB);
    }

    // ─── ORACLE RESOLUTION ────────────────────────────────────────────────────
    /**
     * @notice Resolve a wager with the official tournament result.
     * @param wagerId   The wager to resolve
     * @param outcome   SideA wins, SideB wins, Draw, or Cancelled
     */
    function resolveWager(uint256 wagerId, Outcome outcome) external onlyOracle nonReentrant {
        Wager storage w = wagers[wagerId];
        require(w.status == WagerStatus.Matched, "AthleteWager: not matched");
        require(outcome != Outcome.Pending, "AthleteWager: invalid outcome");

        w.result = outcome;
        uint256 pot = w.amount * 2;

        if (outcome == Outcome.Cancelled || outcome == Outcome.Draw) {
            // Full refund both sides
            w.status = WagerStatus.Refunded;
            require(sdToken.transfer(w.sideA, w.amount), "refund A failed");
            require(sdToken.transfer(w.sideB, w.amount), "refund B failed");
            emit WagerRefunded(wagerId, outcome == Outcome.Cancelled ? "Event cancelled" : "Draw");
            delete activeWagerByMatch[w.matchId];
            return;
        }

        w.status = WagerStatus.Resolved;
        address winner = outcome == Outcome.SideA ? w.sideA : w.sideB;

        uint256 fee    = (pot * FEE_BPS) / BPS_DENOM;
        uint256 payout = pot - fee;

        require(sdToken.transfer(winner, payout), "payout failed");
        if (fee > 0) require(sdToken.transfer(feeRecipient, fee), "fee transfer failed");

        delete activeWagerByMatch[w.matchId];
        emit WagerResolved(wagerId, outcome, winner, payout);
    }

    /**
     * @notice Cancel an open (unmatched) wager — refund sideA.
     */
    function cancelWager(uint256 wagerId) external nonReentrant {
        Wager storage w = wagers[wagerId];
        require(w.status == WagerStatus.Open, "AthleteWager: not open");
        require(msg.sender == w.sideA || msg.sender == owner(), "AthleteWager: not authorized");

        w.status = WagerStatus.Refunded;
        require(sdToken.transfer(w.sideA, w.amount), "refund failed");
        delete activeWagerByMatch[w.matchId];
        emit WagerRefunded(wagerId, "Cancelled by creator");
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "zero address");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "zero address");
        feeRecipient = _feeRecipient;
    }

    function getWager(uint256 wagerId) external view returns (Wager memory) {
        return wagers[wagerId];
    }
}