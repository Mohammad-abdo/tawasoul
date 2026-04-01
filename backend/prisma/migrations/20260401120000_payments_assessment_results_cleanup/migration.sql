-- Drop legacy foreign keys that depend on columns being removed.
ALTER TABLE `assessment_results` DROP FOREIGN KEY `assessment_results_questionId_fkey`;
ALTER TABLE `payments` DROP FOREIGN KEY `payments_bookingId_fkey`;

-- Add the new package relation as nullable first so existing rows can be backfilled safely.
ALTER TABLE `payments` ADD COLUMN `packageId` VARCHAR(191) NULL;

-- Backfill packageId from the user's latest package purchase, preferring ACTIVE packages.
-- If a legacy payment has no matching user_package row, fall back to the oldest package record
-- so the required package relation can still be established deterministically.
UPDATE `payments` AS `p`
INNER JOIN `bookings` AS `b` ON `b`.`id` = `p`.`bookingId`
SET `p`.`packageId` = COALESCE(
  (
    SELECT `up`.`packageId`
    FROM `user_packages` AS `up`
    WHERE `up`.`userId` = `b`.`userId`
    ORDER BY (`up`.`status` = 'ACTIVE') DESC, `up`.`createdAt` DESC, `up`.`id` DESC
    LIMIT 1
  ),
  (
    SELECT `pkg`.`id`
    FROM `packages` AS `pkg`
    ORDER BY `pkg`.`createdAt` ASC, `pkg`.`id` ASC
    LIMIT 1
  )
);

-- Remove obsolete indexes before dropping the legacy columns.
ALTER TABLE `bookings` DROP INDEX `bookings_paymentId_key`;
ALTER TABLE `payments` DROP INDEX `payments_bookingId_key`;
ALTER TABLE `assessment_results` DROP INDEX `assessment_results_questionId_fkey`;

-- Drop removed columns and finalize the new required payment -> package relation.
ALTER TABLE `bookings`
  DROP COLUMN `price`,
  DROP COLUMN `paymentId`;

ALTER TABLE `assessment_results`
  DROP COLUMN `questionId`,
  DROP COLUMN `scoreGiven`;

ALTER TABLE `payments`
  MODIFY `packageId` VARCHAR(191) NOT NULL,
  DROP COLUMN `bookingId`;

ALTER TABLE `payments` ADD INDEX `payments_packageId_fkey`(`packageId`);
ALTER TABLE `payments` ADD CONSTRAINT `payments_packageId_fkey`
  FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
