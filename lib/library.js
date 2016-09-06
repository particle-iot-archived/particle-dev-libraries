'use babel';

import {Notification} from 'atom';
import when from 'when';


export function noProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project directory', {
		dismissable:true
	});
}

function notifyErrors(err) {
	throw err;
}

export function runCommand(promise) {
	when(promise).done(result => result, notifyErrors);
}
