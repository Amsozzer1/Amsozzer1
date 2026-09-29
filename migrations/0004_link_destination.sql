-- Every /r/ slug used to land on the home page. A link sent as "here is the PlusWeb write-up"
-- should land on the PlusWeb write-up, so each one can now name where it goes. NULL keeps the
-- old behaviour.
ALTER TABLE links ADD COLUMN destination TEXT;
