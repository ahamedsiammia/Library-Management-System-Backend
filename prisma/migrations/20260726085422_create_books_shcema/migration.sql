-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OUT_OF_STOCK');

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "author" TEXT NOT NULL,
    "authorBio" TEXT,
    "category" TEXT NOT NULL,
    "categoryBn" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "coverImage" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publisherBn" TEXT,
    "publicationYear" INTEGER NOT NULL,
    "edition" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "pages" INTEGER NOT NULL,
    "format" TEXT DEFAULT 'Paperback',
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "copiesAvailable" INTEGER NOT NULL DEFAULT 1,
    "shelfLocation" TEXT NOT NULL,
    "status" "BookStatus" NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT NOT NULL,
    "descriptionBn" TEXT,
    "keyTopics" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");
