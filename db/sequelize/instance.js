/**
 * Database Instance Helper
 * Repository layer with utility methods for database operations
 * Usage: const userInstance = new sequelize.db(sequelize.models.users);
 */
const handle = require('./../utils/promise_handler');

const omitAsNull = function (value, options) {
    return options && options.omitNull === true && value === null;
};

class DatabaseInstance {
    constructor(model) {
        this.model = model;
    }

    // Find by primary key
    find(id) {
        return handle(this.model.findByPk(id));
    }

    // Find one with query options
    findOne(query) {
        return handle(this.model.findOne(query));
    }

    // Find all with query options
    findAll(query) {
        return handle(this.model.findAll(query));
    }

    // Find by primary key
    findByPk(id) {
        return handle(this.model.findByPk(id));
    }

    // Fetch one with simple where clause
    fetchOne(where) {
        return handle(this.model.findOne({ where: where }));
    }

    // Fetch all with simple where clause
    fetchAll(where) {
        return handle(this.model.findAll({ where: where }));
    }

    // Execute raw query
    query(query, options) {
        return handle(this.model.sequelize.query(query, options || {}));
    }

    // Build model instance without saving
    build(values, options) {
        return this.model.build(values, options);
    }

    // Count records
    count(query) {
        return handle(this.model.count(query));
    }

    // Sum column
    sum(field, query) {
        return handle(this.model.sum(field, query));
    }

    // Destroy records
    destroy(options) {
        return handle(this.model.destroy(options));
    }

    // Update all matching records
    updateAll(values, options) {
        return handle(this.model.update(values, options));
    }

    // Create new record
    create(values, options) {
        return handle(this.model.create(values, options));
    }

    // Update existing instance
    async update(instance, values, options) {
        const changed = [];
        const newValues = {};
        options = options || { omitNull: true };

        const dataValues = instance.toJSON();

        if (values && Object.keys(values).length > 0) {
            const attributes = Object.keys(this.model.rawAttributes);
            for (const key in values) {
                if (
                    attributes.includes(key) &&
                    String(values[key]) !== String(dataValues[key]) &&
                    !omitAsNull(values[key], options)
                ) {
                    changed.push(key);
                    newValues[key] = values[key];
                }
            }
        }

        const [result, err] = await handle(instance.update(newValues, options));
        if (result && changed.length > 0) {
            result._changed = changed;
            result._previousDataValues = dataValues;
        }
        return [result, err];
    }

    // Find and count all
    findAndCountAll(query) {
        return handle(this.model.findAndCountAll(query));
    }

    // Find or create
    async findOrCreate(where, values, options) {
        const [instance, err] = await this.fetchOne(where);
        if (err) {
            return [undefined, err];
        }
        if (instance) {
            return [instance, null];
        }
        return this.create(values, options);
    }

    // Create or update (upsert pattern)
    async createOrUpdate(where, values, options) {
        const [instance, err] = await this.fetchOne(where);
        if (err) {
            return [undefined, err];
        }
        if (!instance) {
            return this.create(values, options);
        }
        return handle(instance.update(values, options));
    }

    // Bulk create
    bulkCreate(values, options) {
        return handle(this.model.bulkCreate(values, options || {}));
    }

    // Increment field
    increment(field, options) {
        return handle(this.model.increment(field, options));
    }

    // Decrement field
    decrement(field, options) {
        return handle(this.model.decrement(field, options));
    }
}

module.exports = DatabaseInstance;
