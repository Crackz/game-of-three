#### Assumptions
- It's mentioned on the assignment that "Both players should be able to play automatically without user input" I assumed that the user should join a game automatically once he enters the game page I also assumed the user has the control over the other actions (otherwise it will be boring game).
- "One of the players should optionally be adjustable by a user" I assumed that the user has the ability to choose between two players either he's the player 1 or player 2




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
