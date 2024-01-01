const { Store } = require('data-store');
const { existsSync, writeFileSync } = require('fs');

module.exports = class DataStore extends Store {

	static path = process.cwd();
	static data = new Map();

	/**
	 *
	 * @param {string} key
	 * @returns {DataStore | undefined}
	 */
	static getStore(key) {
		return this.data.get(key);
	};

	/**
	 *
	 * @param {string} key
	 * @param {DataStore} value
	 * @returns {DataStore}
	 */
	static setStore(key, value) {
		this.data.set(key, value);
		return value;
	};

	/**
	 * @public
	 * @constructor
	 * @param {string} name
	 * @param {string} type
	 */
	constructor(name, type = 'json') {
		super(`${DataStore.path}/src/databases/${name}.${type}`);
		this.path = `${DataStore.path}/src/databases/${name}.${type}`;
		this.name = name;
		this.type = type;
		if (!existsSync(this.path)) {
			writeFileSync(this.path, '{}');
		};
	};

};