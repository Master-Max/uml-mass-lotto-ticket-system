This is the Demo Project for Team 13 Systems' Mass Lotto Ticket Inventory System

To run this project:

install node v24.15.0
install yarn 
  > npm install -global yarn 

run dev server using
  > yarn run dev

For this initial dev version we are using Next.js for the frontend and backend
We are using SQLite as our database
And we are using Prisma to connect Next.js to the SQLite database

We can update tables in SQLite by making changes to our schema.prisma file

After updating the schema.prisma file, we sync those changes with
  > yarn prisma migrate dev --name "message goes here"