import SchemaValidator from 'ajv';

const schemaValidator = new SchemaValidator().compile({
    properties: {
        title: { type: 'string', maxLength: 18 },
        body: { type: 'string', maxLength: 140 },
    },
});

const idSelector = req => req.params.id;

function publicizer({ title, body, createdAt, modifiedAt, _id: id }) {

    return {
        id,
        createdAt,
        modifiedAt,
        title,
        body,
    };
}

function validator(obj) {

    // note: ajv is the best maintained schema validator but
    // suffers from questionable api patterns, after validating
    // an object, it populates the .errors property of the
    // validator function, we take a shallow copy of the errors
    // immediately and return those instead

    schemaValidator(obj);

    return schemaValidator.errors ? [...schemaValidator.errors] : [];

}

export const createConfig = ({ clock }) => {

    function preparer({ title, body }, creating) {

        const now = clock.now();

        if (creating) return {
            createdAt: now,
            modifiedAt: now,
            title,
            body,
        };

        return {
            modifiedAt: now,
            title,
            body,
        };

    }

    return {
        idSelector,
        preparer,
        publicizer,
        validator,
    };

};

