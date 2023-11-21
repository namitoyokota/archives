# GunFun-Frontend

Frontend for GunFun app

## Frontend

1. `git clone https://github.com/amsoftware-tech/GunFun-Frontend.git`
2. `cd GunFun-Frontend`
3. `yarn install` or `npm install` if you like things slow
4. `yarn start` or `npm run start`

## Database

### Windows

1. Download and install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Download scoop by running this command in a non admin powershell: `iwr -useb get.scoop.sh | iex`
3. Run the following commands:
   `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`
   `scoop install supabase`
4. Run `supabase login` to login to supabase. Use this access token: (I will send this over Slack so we don't expose a token)
5. Run `supabase start` to start up the database
6. Run `supabase link --project-ref eqpinbfkchquashbysgj` to link your local database with what is in the cloud
7. Run `supabase database push` to commit changes to database
8. Run `supabase stop` to stop running the database

### MacOS

1. Download and install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Follow this guide to downloading Supabase CLI: https://supabase.com/docs/guides/cli

## Tasks

### Namito

-   [x] `itemId` CANNOT be a number in case id like 00123 exists. This would be stored as 123 instead. Add to scripts
-   [x] Add `type` property with "GunFun" and "M/P" as radio button options
-   [x] Add `urgency` property to form with 'Low', 'Medium', and 'High' as dropdown options
-   [x] Add `Other` radio button to all input fields
-   [x] Auto-populate entire form with previously matched `itemId` expect for dates
-   [x] **Calendar Scheduling by week (similar to Chrome tabs by day of the week) - Add new `scheduledDate` property**
-   [x] Preview print with dynamic image
-   [x] Save previously selected date when going between pages
-   [x] Updating batch with previously loaded itemid doesn't work
-   [x] Create admin page for managing existing inks, presses (like names), press operator names, pictures, etc
-   [x] Create a filtering feature to gray out un-matching cards (by one or more of colors, GunFun/M&P type)
-   [x] Editing batch from history navigates back to home page
-   [x] Support Inks (4 rows - each with ink number dropdown, auto populated name, and quantity columns)
-   [-] **Email Completed Forms**

### Austin

-   [x] Create new `inks` table for storing id and name of each ink
-   [x] Add inks to db table
-   [x] Initialize database rows on reset
-   [x] Figure out how to ONLY spin up db in docker
-   [x] Write script to start Angular & Supabase together

### To-Dos

-   [ ] History page not displaying latest prints
-   [ ] Admin page needs to support scrolling
-   [ ] Remove foreign key of presses and use name instead (unable to delete presses due to the relationships)
-   [ ] Update home page to use presses data from admin page
-   [ ] Add support for manually sorting within press list (add `sortId` property to `batch`)
-   [ ] Display statistics on filtered history list with calendar range
-   [ ] Write documentation on how to use the tool
