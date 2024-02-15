#### Assumptions

"Both players should be able to play automatically without user input. One of the players should optionally be adjustable by a user."

The game can be played automatically with a user. (A real player playing with the machine) and optionally 2 real players playing together.




#### Setup

- Install lts versions of nodejs, docker and docker compose
- Install task cli globally (it's similar to make)
    -  `npm install -g @go-task/cli`
- Run `task init`


#### Migrations
> Migration is run automatically on the development environment

##### Create a new migration
- `task server:migration:create -- {migration-name}`
##### Revert the latest migration
- `task server:migration:revert`
