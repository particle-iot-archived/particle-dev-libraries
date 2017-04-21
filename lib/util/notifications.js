'use babel';

import { Notification } from 'atom';

export function showLibraryAdded(library) {
	showNotification(new Notification('info', `${library.name} library added to your project`));
}

export function showLibraryCopied(library) {
	showNotification(new Notification('info', `${library.name} library copied to your project`));
}

function showNotification(notification) {
	atom.notifications.addNotification(notification);
}
