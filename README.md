# Persistr Examples

These are examples of how to use Persistr Server and Persistr JS SDK. The following examples are included:

- [js/auth.js](js/auth.js): Demonstrates how to connect to Persistr Server using a Persistr connection string

- [js/connection.js](js/connection.js): Demonstrates how to connect to Persistr Server without specifying an initial database

- [js/database.js](js/database.js): Demonstrates how to connect to a specific database on a Persistr Server instance

- [js/events.js](js/events.js): Demonstrates how to write events into an event stream and read events back from the database

- [js/selectors.js](js/selectors.js): Demonstrates how to use event selectors to filter and iterate over events in an event stream

- [js/types.js](js/types.js): Demonstrates how to use the `types` selector to filter events by type

## Running the examples

Change into the `js` folder and run `npm ci` to install dependencies:

```
cd js
npm ci
```

Then run each example on the command-line by using `node`:

```
node events.js
```

## License

See the [LICENSE](LICENSE) file for license rights and limitations (GPL).
