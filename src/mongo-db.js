import mongodb from 'mongodb';

export class MongoCollection {

    constructor(collection) {
        this.collection = collection;
    }

    async list(filter = {}) {
        const collection = await this.collection;
        return collection.find(filter).toArray();
    }

    async create(item) {
        const collection = await this.collection;
        const result = await collection.insertOne(item);
        return result.ops[0];
    }

    async get(filter) {
        const collection = await this.collection;
        return await collection.findOne(filter);
    }

    getById(id) {
        return this.get(this.getFilterBydId(id));
    }

    async update(filter, update) {
        const collection = await this.collection;
        const result = await collection.findOneAndUpdate(filter, { $set: update }, { returnOriginal: false });
        return result.value;
    }

    updateById(id, update) {
        return this.update(this.getFilterBydId(id), update);
    }

    async delete(filter) {
        const collection = await this.collection;
        const result = await collection.findOneAndDelete(filter);
        return result.value;
    }

    async deleteById(id) {
        return this.delete(this.getFilterBydId(id));
    }

    getFilterBydId(id) {
        return { _id: mongodb.ObjectID(id) }; // TODO: this should be configurable per collection
    }

}

export const createContext = (connection, collections) => {

    const context = {};

    for (const name of collections) {

        const collection = connection.then(connection => connection.collection(name));
        const wrapped = new MongoCollection(collection);

        context[name] = wrapped;

    }

    return context;

};
