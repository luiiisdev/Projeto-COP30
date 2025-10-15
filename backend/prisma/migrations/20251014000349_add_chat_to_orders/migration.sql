-- AlterTable
ALTER TABLE `message` ADD COLUMN `systemMessage` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `chatId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Conversation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
