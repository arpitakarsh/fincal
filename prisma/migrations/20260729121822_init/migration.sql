-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "currentCapital" DOUBLE PRECISION NOT NULL,
    "monthlyInvestmentCap" DOUBLE PRECISION NOT NULL,
    "existingSip" DOUBLE PRECISION NOT NULL,
    "existingLumpsum" DOUBLE PRECISION NOT NULL,
    "emergencyFund" DOUBLE PRECISION NOT NULL,
    "annualIncome" DOUBLE PRECISION,
    "goalType" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION,
    "targetYear" INTEGER NOT NULL,
    "riskAppetite" TEXT NOT NULL,
    "investmentKnowledge" TEXT NOT NULL,
    "liquidityPreference" TEXT NOT NULL,
    "investmentStyle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AMC" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AMC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutualFund" (
    "id" TEXT NOT NULL,
    "isin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amcId" TEXT NOT NULL,
    "expenseRatio" DOUBLE PRECISION NOT NULL,
    "aumCr" DOUBLE PRECISION NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "benchmark" TEXT NOT NULL,
    "riskometer" TEXT NOT NULL,
    "minSip" DOUBLE PRECISION NOT NULL,
    "minLumpsum" DOUBLE PRECISION NOT NULL,
    "exitLoad" TEXT,

    CONSTRAINT "MutualFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundMetrics" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "cagr1Y" DOUBLE PRECISION,
    "cagr3Y" DOUBLE PRECISION,
    "cagr5Y" DOUBLE PRECISION,
    "sharpeRatio" DOUBLE PRECISION,
    "sortinoRatio" DOUBLE PRECISION,
    "alpha" DOUBLE PRECISION,
    "beta" DOUBLE PRECISION,
    "stdDev" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "upsideCapture" DOUBLE PRECISION,
    "downsideCapture" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalNAV" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoricalNAV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollingReturn" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "windowYears" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "annualizedCagr" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RollingReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsCache" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "probabilityData" JSONB NOT NULL,
    "riskData" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorAllocation" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "sectorName" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SectorAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ticker" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortfolioHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderMetadata" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerFundId" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "monthlySip" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL,
    "healthScore" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "successProbability" DOUBLE PRECISION,
    "recommendedCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalProgress" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GoalProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalInvested" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMonthlySip" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "netInvested" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationHistory" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "scoreAtTime" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsightHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "insight" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsightHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AMC_name_key" ON "AMC"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MutualFund_isin_key" ON "MutualFund"("isin");

-- CreateIndex
CREATE UNIQUE INDEX "FundMetrics_fundId_key" ON "FundMetrics"("fundId");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalNAV_fundId_date_key" ON "HistoricalNAV"("fundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RollingReturn_fundId_windowYears_date_key" ON "RollingReturn"("fundId", "windowYears", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCache_fundId_key" ON "AnalyticsCache"("fundId");

-- CreateIndex
CREATE UNIQUE INDEX "SectorAllocation_fundId_sectorName_key" ON "SectorAllocation"("fundId", "sectorName");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioHolding_fundId_companyName_key" ON "PortfolioHolding"("fundId", "companyName");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderMetadata_fundId_key" ON "ProviderMetadata"("fundId");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_key" ON "Portfolio"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutualFund" ADD CONSTRAINT "MutualFund_amcId_fkey" FOREIGN KEY ("amcId") REFERENCES "AMC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundMetrics" ADD CONSTRAINT "FundMetrics_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalNAV" ADD CONSTRAINT "HistoricalNAV_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollingReturn" ADD CONSTRAINT "RollingReturn_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsCache" ADD CONSTRAINT "AnalyticsCache_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorAllocation" ADD CONSTRAINT "SectorAllocation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHolding" ADD CONSTRAINT "PortfolioHolding_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderMetadata" ADD CONSTRAINT "ProviderMetadata_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalProgress" ADD CONSTRAINT "GoalProgress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationHistory" ADD CONSTRAINT "RecommendationHistory_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationHistory" ADD CONSTRAINT "RecommendationHistory_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsightHistory" ADD CONSTRAINT "AIInsightHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
