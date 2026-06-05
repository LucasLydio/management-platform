-- CreateTable
CREATE TABLE "notion_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "duplicatedTemplateId" TEXT,
    "ownerUserEmail" TEXT,
    "ownerUserId" TEXT,
    "ownerUserName" TEXT,
    "workspaceIcon" TEXT,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notion_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notion_connections_userId_key" ON "notion_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notion_connections_botId_key" ON "notion_connections"("botId");

-- AddForeignKey
ALTER TABLE "notion_connections" ADD CONSTRAINT "notion_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
