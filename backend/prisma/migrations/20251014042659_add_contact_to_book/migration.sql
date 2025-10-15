/*
  Warnings:

  - You are about to drop the column `systemMessage` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_chatId_fkey`;

-- DropIndex
DROP INDEX `Order_chatId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `book` ADD COLUMN `contact` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `systemMessage`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `chatId`;
