-- Seed inventory is reserved for the investor walkthrough. It must not look
-- like real marketplace supply or appear in public search results.
UPDATE "Listing"
SET "status" = 'PAUSED', "updatedAt" = CURRENT_TIMESTAMP
WHERE "details"->>'_photoSource' = 'VAYRO_REPRESENTATIVE';
