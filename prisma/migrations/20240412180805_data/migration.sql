-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "whenLeft" DATETIME,
    "avatar" TEXT,
    "shortbio" TEXT,
    "office" TEXT,
    "gscholar" TEXT,
    "orcid" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    CONSTRAINT "Member_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Person" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "goby" TEXT,
    "middlename" TEXT,
    "externalLink" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_personId_key" ON "Member"("personId");
