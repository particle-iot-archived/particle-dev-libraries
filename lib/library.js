'use babel';

import {Notification} from 'atom';
import when from 'when';
import {profileManager} from './index';


export function noProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project directory', {
		dismissable:true
	});
}

function notifyErrors(err) {
	throw err;
}

let commandResultPromise = null;

export function setCommandResultPromise(promise) {
	commandResultPromise = promise;
}

function commandResultOrError(result, err) {
	if (err) {
		notifyErrors(err);
	}
	return result;
}

function handleCommandResult(result, err) {
	const promise = commandResultPromise;
	commandResultPromise = undefined;
	if (promise!==undefined) {
		return promise.then(() => commandResultOrError(result, err));
	} else {
		return commandResultOrError(result, err);
	}
}

export function runCommand(promise) {
	return when(promise).done((result) => handleCommandResult(result), (err) => handleCommandResult(undefined, err));
}

export function fetchApiClient() {
	const pm = profileManager();
	const apiClient = pm.apiClient;
	return apiClient;
}