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

- E2E testing is sufficient (no need for unit testing)

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
