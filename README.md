# SimpleChat

Technologies:

  - **Server side:** Node.js, Express, Socket.io
  - **Client side:** Bootstrap, Angular
  - **Database:** MongoDB

### Requires

  - Node.js, NPM
  - MongoDB

### Configuration
  - MongoDB connection url: configs\database.js file
  - Session configaration: configs\session.js file

### Run

  - Fetch dependencies:
        npm install

  - Launch MongoDB

  If you'd like to change connection url for Mongodb, you should change it in configs\database.js file

  - Launch chat server:
        node bin\www

  Now open this URL in your browser:
    http://localhost:30000/

