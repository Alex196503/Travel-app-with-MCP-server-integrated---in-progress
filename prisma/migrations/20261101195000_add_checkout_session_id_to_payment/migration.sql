-- Add a unique reference from each local payment attempt to its Stripe Checkout Session.
ALTER TABLE `Payment` ADD COLUMN `stripe_checkout_session_id` VARCHAR(255) NULL;

CREATE UNIQUE INDEX `Payment_stripe_checkout_session_id_key`
ON `Payment`(`stripe_checkout_session_id`);
