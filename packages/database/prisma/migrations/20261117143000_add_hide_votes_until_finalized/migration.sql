ALTER TABLE "polls"
ADD COLUMN "hide_votes_until_finalized" BOOLEAN NOT NULL DEFAULT false;
