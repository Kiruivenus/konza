-- Initialize default settings for Konza Coin platform
-- This script sets up the initial configuration

db.settings.insertOne({
  transferFee: 1.5,
  swapEnabled: true,
  minSwapAmount: 10,
  kycRequiredForSwap: true,
  referralEnabled: true,
  referralBonus: 50,
  miningEnabled: true,
  miningRewardRate: 0.5,
  miningSessionDuration: 3600,
  platformName: "Konza Coin",
  updatedAt: new Date()
});

-- Initialize coin price
db.coinprice.insertOne({
  currentPrice: 1.25,
  trend: "stable",
  changePercentage: 0,
  nextChangeTime: new Date(Date.now() + 3600000),
  updatedAt: new Date()
});
