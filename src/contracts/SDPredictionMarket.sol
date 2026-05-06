// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SDPredictionMarket
 * @notice Binary YES/NO prediction market per match, funded with $SD tokens.
 *         Uses a constant-product AMM model for low-gas efficiency on Polygon.
 *         Upgradeable via OpenZeppelin Transparent Proxy.
 */

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SDPredictionMarket is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    uint256 public constant FEE_BPS   = 150;   // 1.5% platform fee
    uint256 public constant BPS_DENOM = 10_000;

    enum MarketStatus { Open, Resolved, Cancelled }
    enum Side         { Yes, No }

    struct Market {
        bytes32       matchId;
        string        question;      // e.g. "Will Athlete A win?"
        uint256       yesPool;       // $SD in YES side
        uint256       noPool;        // $SD in NO side
        MarketStatus  status;
        Side          result;
        uint256       closesAt;      // unix timestamp
    }

    IERC20  public sdToken;
    address public oracle;
    address public feeRecipient;

    uint256 public marketCount;
    mapping(uint256 => Market)                       public markets;
    // marketId → user → (yesShares, noShares)
    mapping(uint256 => mapping(address => uint256))  public yesShares;
    mapping(uint256 => mapping(address => uint256))  public noShares;

    event MarketCreated  (uint256 indexed marketId, bytes32 matchId, string question, uint256 closesAt);
    event SharesBought   (uint256 indexed marketId, address user, Side side, uint256 amount, uint256 shares);
    event MarketResolved (uint256 indexed marketId, Side result);
    event Redeemed       (uint256 indexed marketId, address user, uint256 payout);
    event OracleUpdated  (address indexed newOracle);

    modifier onlyOracle() { require(msg.sender == oracle, "not oracle"); _; }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address _sdToken, address _oracle, address _feeRecipient) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        sdToken      = IERC20(_sdToken);
        oracle       = _oracle;
        feeRecipient = _feeRecipient;
    }

    // ─── ADMIN: CREATE MARKET ─────────────────────────────────────────────────
    function createMarket(
        bytes32 matchId,
        string calldata question,
        uint256 closesAt,
        uint256 seedYes,
        uint256 seedNo
    ) external onlyOwner returns (uint256 marketId) {
        require(closesAt > block.timestamp, "closes in past");
        require(seedYes > 0 && seedNo > 0, "must seed both sides");

        require(sdToken.transferFrom(msg.sender, address(this), seedYes + seedNo), "seed transfer failed");

        marketId = ++marketCount;
        markets[marketId] = Market({
            matchId:  matchId,
            question: question,
            yesPool:  seedYes,
            noPool:   seedNo,
            status:   MarketStatus.Open,
            result:   Side.Yes, // placeholder, overwritten on resolution
            closesAt: closesAt
        });

        emit MarketCreated(marketId, matchId, question, closesAt);
    }

    // ─── BUY SHARES ───────────────────────────────────────────────────────────
    /**
     * @notice Buy YES or NO shares using $SD tokens.
     *         Shares = amount * otherPool / (thisPool + amount) — AMM price discovery.
     */
    function buyShares(uint256 marketId, Side side, uint256 amount) external nonReentrant returns (uint256 shares) {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Open, "market not open");
        require(block.timestamp < m.closesAt, "market closed");
        require(amount > 0, "zero amount");

        uint256 fee        = (amount * FEE_BPS) / BPS_DENOM;
        uint256 netAmount  = amount - fee;

        require(sdToken.transferFrom(msg.sender, address(this), amount), "transfer failed");
        if (fee > 0) require(sdToken.transfer(feeRecipient, fee), "fee failed");

        if (side == Side.Yes) {
            shares = (netAmount * m.noPool) / (m.yesPool + netAmount);
            m.yesPool += netAmount;
            yesShares[marketId][msg.sender] += shares;
        } else {
            shares = (netAmount * m.yesPool) / (m.noPool + netAmount);
            m.noPool += netAmount;
            noShares[marketId][msg.sender] += shares;
        }

        emit SharesBought(marketId, msg.sender, side, amount, shares);
    }

    // ─── ORACLE RESOLUTION ────────────────────────────────────────────────────
    function resolveMarket(uint256 marketId, Side result) external onlyOracle {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Open, "not open");
        m.status = MarketStatus.Resolved;
        m.result = result;
        emit MarketResolved(marketId, result);
    }

    function cancelMarket(uint256 marketId) external onlyOracle {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Open, "not open");
        m.status = MarketStatus.Cancelled;
    }

    // ─── REDEEM WINNINGS ──────────────────────────────────────────────────────
    function redeem(uint256 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Resolved || m.status == MarketStatus.Cancelled, "not resolved");

        uint256 payout;
        if (m.status == MarketStatus.Cancelled) {
            // Pro-rata refund
            uint256 totalPool  = m.yesPool + m.noPool;
            uint256 userYes    = yesShares[marketId][msg.sender];
            uint256 userNo     = noShares[marketId][msg.sender];
            uint256 totalShares = userYes + userNo;
            require(totalShares > 0, "nothing to redeem");
            payout = (totalShares * totalPool) / (m.yesPool + m.noPool); // simplified
        } else {
            uint256 winShares = m.result == Side.Yes
                ? yesShares[marketId][msg.sender]
                : noShares[marketId][msg.sender];
            require(winShares > 0, "no winning shares");

            uint256 winPool   = m.result == Side.Yes ? m.yesPool : m.noPool;
            uint256 totalPool = m.yesPool + m.noPool;
            payout = (winShares * totalPool) / winPool;
        }

        yesShares[marketId][msg.sender] = 0;
        noShares[marketId][msg.sender]  = 0;

        require(sdToken.transfer(msg.sender, payout), "payout failed");
        emit Redeemed(marketId, msg.sender, payout);
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }
}