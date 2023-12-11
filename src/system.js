class EventEmitter {
	constructor() {
		this.events = {};
	}

	on(eventName, callback) {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);
	}

	emit(eventName, ...args) {
		const eventCallbacks = this.events[eventName];
		if (eventCallbacks) {
			eventCallbacks.forEach(callback => {
				callback(...args);
			});
		}
	}
}

module.exports = EventEmitter;
