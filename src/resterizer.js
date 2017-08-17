import restifyErrors from 'restify-errors';

const asyncHandler = fn => async (req, res, next) => {
    try {
        await fn(req, res);
        next();
    } catch (err) {
        next(err);
    }
};

const createValidationError = errors => new restifyErrors.BadRequestError({
    context: {
        responseBody: {
            errors,
        },
    },
});

export const createHandlers = (collection, { idSelector, validator, preparer, publicizer }) => {

    const list = asyncHandler(async (req, res) => {

        const items = await collection.list();
        const response = await Promise.all(items.map(item => publicizer(item)));

        res.send(response);

    });

    const create = asyncHandler(async (req, res) => {

        const errors = await validator(req.body, true);

        if (errors.length) {
            throw createValidationError(errors);
        }

        const source = await preparer(req.body, true);

        const item = await collection.create(source);
        const response = await publicizer(item);

        res.send(response);

    });

    const get = asyncHandler(async (req, res) => {

        const id = idSelector(req);
        const item = await collection.getById(id);

        if (item == null) {
            throw new restifyErrors.NotFoundError();
        }

        const response = await publicizer(item);

        res.send(response);

    });

    const update = asyncHandler(async (req, res) => {

        const errors = await validator(req.body);

        if (errors.length) {
            throw createValidationError(errors);
        }

        const source = await preparer(req.body);
        const id = idSelector(req);

        const item = await collection.updateById(id, source);

        if (item == null) {
            throw new restifyErrors.NotFoundError();
        }

        const response = await publicizer(item);

        res.send(response);

    });

    const remove = asyncHandler(async (req, res) => {

        const id = idSelector(req);
        const item = await collection.deleteById(id);

        if (item == null) {
            throw new restifyErrors.NotFoundError();
        }

        const response = await publicizer(item);

        res.send(response);

    });

    return {
        list,
        create,
        get,
        update,
        remove,
    };

};
