#### Used Technologies
<p>
  <img src="https://nestjs.com/img/logo-small.svg" width="50" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg" width="50" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" width="50" />
  <img src="https://cdn.worldvectorlogo.com/logos/redis.svg" width="50" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="50" />
  <img src="https://raw.githubusercontent.com/vadimdemedes/ink/master/media/logo.png" width="50" />

</p>


#### Assumptions

- (Nemanja) The game can be played automatically with a user. (A real player playing with the machine) and optionally 2 real players playing together.

- E2E testing is sufficient (no need for unit testing).

- If a player didn't join the game within a specified period of time (configurable) a bot will take the player place.

- If a player goes offline for period of time (configurable). a bot will take his place.

- If the game doesn't have any players. the bot won't make any move.

----

#### Architecture
##### System Design
<a href="https://raw.githubusercontent.com/Crackz/takeaway-challenge/main/diagrams/SystemDesign.png">
<img src="https://raw.githubusercontent.com/Crackz/takeaway-challenge/main/diagrams/SystemDesign.png" width="400" />
</a>


##### Database Schemas
<a href="https://raw.githubusercontent.com/Crackz/takeaway-challenge/main/diagrams/DbSchemas.png">
<img src="https://raw.githubusercontent.com/Crackz/takeaway-challenge/main/diagrams/DbSchemas.png" width="400" />
</a>

###### Why used message queues?
It's because the message queue can provide control over the concurrency execution of requests.
Off course it can be solved in many other ways but I think this is the most appropriate solution.

###### Why used Redis as a message broker instead of kafka or rabbitmq?
It's simpler, easier to maintain also the system is designed to load game states from the database whenever it's presented in redis also all the game states would become absolute if the server goes off or crashes as the sockets will be closes in that case. so all the games states are flushed from redis on app bootstrap.

###### Why used Postgres ?
I would rephrase this to be why SQL instead of NOSQL
There is no advantage of using SQL over NOSQL for our simple use case but since SQL dbs are used for decades and more engineers are most likely to have experience using it I decided to use postgres.


###### How would you scale our Ws Server?
Another advantage of using redis its pub/sub model that can be used by socket.io to scale the Ws Server just by installing and using a single package.

---

#### User Flows

- Join a game: 
  > The user opens the client(terminal), then a request will be sent to the ws server to connect, if the socket is connected successfully. The client will fire `join` event, the server will handle this event by creating or getting an active game then It will add a message with a game id to the message broker(redis) so later a processor will get that message and try to make the socket connect to that game and whether it was successful or not the server will fire a `join` event with some details.

- Wait/Make a move:
  > After the client is connected and joined a game, he will be able to fire `new-move` event if it's his turn other wise he will have to wait for a `new-move` event to be fired by the other player.

- Bot Move:
  > Bots moves are pushed to the `bot moves manager` message queue whenever a player is disconnected, connected or made a move. The mq processor gets a bot move message and starts by checking the game state and the player states then it makes the move on behalf of the offline player.

- Game Events:
  > The server sends an `events` event to the players whenever someone joins or leaves the game.

---

#### Gameplay
![View It Here](https://raw.githubusercontent.com/Crackz/takeaway-challenge/main/diagrams/gameplay.gif)

--- 

#### Setup

- Install lts versions of nodejs, docker and docker compose
- Install task cli globally (it's similar to make)
    -  `npm install -g @go-task/cli`
- Run `task init`

--- 

#### Start the development
##### Run the server
- `task server:start`

##### Run the client
> It will build then run the client
- `task client:start`
> To watch the client changes
- `task client:watch`
--- 

#### Docs
> Make sure to run the server first
- [View Http Docs](http://localhost:3000/http-docs)
- [View Websocket Docs](http://localhost:3000/websocket-docs)

---

#### Tests
##### Run the test containers
- `task server:test:init`
##### Run the e2e tests
- `task server:test:start`

--- 


#### Migrations
> Migrations are run automatically on the development, testing environments

##### Create a new migration
- `task server:migration:create -- {migration-name}`

##### Run all migrations
- `task server:migration:run`

##### Revert the latest migration
- `task server:migration:revert`

---

#### Miscellaneous
##### Abbreviations
> You can replace `server` with `s` on any commands and the same goes for `client`

##### Missing Implementation
 
> - Didn't cover `bots module` e2e tests due to lack of available time. I think the current e2e tests implementation is good enough to judge my skill of writing tests

> - In some cases there were multiple commands fired to redis. They should be grouped into a single transaction but to keep it simple this is ignored.


