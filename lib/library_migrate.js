'use babel';

import {Notification} from 'atom';
const {LibraryMigrateCommandSite, LibraryMigrateCommand} = require('./cli');
import {runCommand, noProjectSelectedNotification} from './library';


export function notifyLibraryMigrating(lib) {
	return new Notification();
}

export function notifyLibraryMigreated(lib, result, error) {
	let type = 'info';
	let msg;
	if (error) {
		type = 'error';
		msg = error.message || 'unknown error';
	} else {
		if (result) {
			msg = 'Library successfully migrated!';
		} else {
			msg = 'Nothing to do. The library was already migrated.';
		}
	}
	return new Notification(type, msg, {dismissable:true});
}

class DevLibraryMigrateCommandSite extends LibraryMigrateCommandSite {

	constructor(atom, dir) {
		super();
		this.dir = dir;
		this.atom = atom;
	}

	getLibraries() {
		return [this.dir];
	}

	removeNotification() {
		if (this.notification!==undefined) {
			this.notification.dismiss();
			delete this.notification;
		}
	}

	showNotification(notification) {
		this.removeNotification();
		this.notification = notification;
		this.atom.notifications.addNotification(notification);
	}

	notifyStart(lib) {
		this.showNotification(notifyLibraryMigrating(lib));
	}

	notifyEnd(lib, result, err) {
		this.showNotification(notifyLibraryMigreated(lib, result, err));
	}

}

export function libraryMigrateCommand(atom, dir) {
	if (!dir) {
		atom.notifications.addNotification(noProjectSelectedNotification());
	} else {
		runCommand(new DevLibraryMigrateCommandSite(atom, dir).run(new LibraryMigrateCommand()));
	}
}
