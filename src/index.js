import mongo from 'mongodb';
import winston from 'winston';

import { createContext } from './mongo-db';
import { createServer } from './server';

// environmental configs
const PORT = process.env.PORT || 80;
const DB_URL = process.env.DB_URL || 'mongodb://localhost/ideation';

// configure error logging
// TODO: depending on infrastructure, you'd want this to be externally configurable, perhaps via json config or similar
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
    ],
});

const db = createContext(mongo.MongoClient.connect(DB_URL), ['ideas']);
const server = createServer({ logger, db });

// ..and begin listening for requests
server.listen(PORT, () => logger.info(`${server.name} listening at ${server.url}`));
