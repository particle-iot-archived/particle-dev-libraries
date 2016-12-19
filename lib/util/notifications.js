'use babel';

import {Notification} from 'atom';

export function showLibraryAdded(library) {
	showNotification(new Notification('info', `${library.name} library added to your project`));
}

function showNotification(notification) {
	atom.notifications.addNotification(notification);
}
