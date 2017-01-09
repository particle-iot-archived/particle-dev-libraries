'use babel';

export default (superclass) => class extends superclass {
	constructor() {
		super();
		this.notification = null;
	}

	removeNotification() {
		if (this.notification!==null) {
			this.notification.dismiss();
			this.notification = null;
		}
	}

	showNotification(notification) {
		this.removeNotification();
		this.notification = notification;
		this.atom.notifications.addNotification(notification);
	}
};
