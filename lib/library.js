'use babel';

import { Notification } from 'atom';
import { profileManager } from './index';


export function noProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project directory', {
		dismissable:true
	});
}

function notifyErrors(err) {
	console.log(err);
	throw err;
}

let commandResultCallback = null;

/**
 * Sets the promise to execute after the command is available
 * @param {Promise} callback The callback to invoke
 */
export function setCommandResultCallback(callback) {
	commandResultCallback = callback;
}

let lastRunCommand;
function setLastRunCommandPromise(promise) {
	lastRunCommand = promise;
	console.log('setLastRunCommandPromise', promise);
	return promise;
}

export function getLastRunCommandPromise() {
	const promise = lastRunCommand;
	lastRunCommand = undefined;
	if (!promise) {
		throw Error('no command promise provided. This could be an indication that the atom command was not executed/registered.');
	}
	return promise;
}


function commandResultOrError(result, err) {
	if (err) {
		notifyErrors(err);
	}
	return result;
}

function handleCommandResult(result, err) {
	console.log('command result', err || result);
	const promise = commandResultCallback;
	commandResultCallback = undefined;

	if (promise) {
		promise();
	}
	return commandResultOrError(result, err);
}

export function runCommand(promise) {
	return setLastRunCommandPromise(promise.then((result) => handleCommandResult(result), (err) => handleCommandResult(undefined, err)));
}

export function fetchApiClient() {
	const pm = profileManager();
	const apiClient = pm.apiClient;
	return apiClient;
}

export function notifyNoProjectSelected() {
	atom.notifications.addNotification(noProjectSelectedNotification());
}

export function noProjectSelected() {
	return Promise.resolve().then(() => notifyNoProjectSelected());
}
