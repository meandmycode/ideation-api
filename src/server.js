import restify from 'restify';
import restifyCors from 'restify-cors-middleware';
import restifyErrors from 'restify-errors';

import { createHandlers } from './resterizer';
import { createConfig as createIdeaConfig } from './entity-configs/idea';

export const DEFAULT_CLOCK = {
    now: () => new Date(),
};

export const createServer = ({ logger, clock = DEFAULT_CLOCK, db }) => {

    const server = restify.createServer({
        name: 'ideation-api',
        version: '1.0.0',
    });

    // create restful http handlers for our entities
    const ideas = createHandlers(db.ideas, createIdeaConfig({ clock }));

    // hookup standard middleware for accept request header and request body parsing
    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.bodyParser());

    const cors = restifyCors({ origins: ['*'] }); // TODO: in a real scenario we'd potentially want to restrict origins
    server.pre(cors.preflight);
    server.use(cors.actual);

    // hookup entity actions for idea endpoints
    server.get('/ideas', ideas.list);
    server.post('/ideas', ideas.create);
    server.get('/ideas/:id', ideas.get);
    server.put('/ideas/:id', ideas.update);
    server.del('/ideas/:id', ideas.remove);

    // whenever errors happen within our http layer we should log them
    server.on('restifyError', (req, res, error) => {

        const isHttpError = error instanceof restifyErrors.HttpError;

        logger.error('restify:error', { error, isHttpError });

        // if the thrown error is not a http error then this
        // error probably hasn't been well considered for public
        // transport and may contain details that should not be
        // disclosed, as such we'll take over the rendering here
        // with a generic internal server error
        const displayError = isHttpError ? error : new restifyErrors.InternalServerError();

        // for properly dispatched http errors, we support setting the
        // response body of the error explicitly via the responseBody
        // property of the error context, otherwise we send nothing
        const statusCode = displayError.statusCode;
        const responseBody = displayError.context && displayError.context.responseBody;

        if (responseBody) {
            res.send(statusCode, responseBody);
        } else {
            res.send(statusCode);
        }

    });

    return server;

};
