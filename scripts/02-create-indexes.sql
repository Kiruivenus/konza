-- Create indexes for better query performance

-- Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ walletAddress: 1 }, { unique: true });
db.users.createIndex({ referralCode: 1 }, { unique: true });

-- Transactions collection indexes
db.transactions.createIndex({ hash: 1 }, { unique: true });
db.transactions.createIndex({ sender: 1 });
db.transactions.createIndex({ receiver: 1 });
db.transactions.createIndex({ timestamp: -1 });

-- KYC collection indexes
db.kyc.createIndex({ userId: 1 });
db.kyc.createIndex({ status: 1 });

-- Mining collection indexes
db.mining.createIndex({ userId: 1 });
db.mining.createIndex({ status: 1 });

-- Swaps collection indexes
db.swaps.createIndex({ userId: 1 });
db.swaps.createIndex({ timestamp: -1 });

-- Referrals collection indexes
db.referrals.createIndex({ referrerId: 1 });
db.referrals.createIndex({ referredId: 1 });
