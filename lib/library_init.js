'use babel';

import {Panel} from 'atom';
import {View} from 'atom-space-pen-views';
import {DialogView} from 'particle-dev-views';
import etch from 'etch';

const cli = require('./cli');
const {LibraryInitCommandSite, LibraryInitCommand} = cli;
import path from 'path'

// use flexbox
// populate with directory - the current project with the last directory selected
// if no directory, then use home directory with /newlibrary suffix
// last directory component used to pre-populate the library name

class DevLibraryInitCommandSite extends LibraryInitCommandSite {

	constructor() {
		super();
	}

	yeomanAdapter() {
		throw new Error('not implemented');
	}

	yeomanEnvironment() {
		throw new Error('not implemented');
	}

	options() {
		return {};
	}

	args() {
		return [];
	}

}


/** @jsx etch.dom */
class LibraryInitComponent {

	constructor(props, children) {
		etch.initialize(this);
	}

	render() {
		return <div class="particle-library-init">
			<div class='block'>
				<label>Name</label>
				<atom-text-editor mini></atom-text-editor>
			</div>

			<div class='block'>
				<label>Author</label>
				<atom-text-editor mini></atom-text-editor>
			</div>

			<div class='block'>
				<label>Email</label>
				<atom-text-editor mini></atom-text-editor>
			</div>

			<div class='block'>
				<label>Description</label>
				<atom-text-editor mini></atom-text-editor>
			</div>

		</div>;
	}

	update(props, children) {
		etch.update(this);
	}
}

class DevLibraryInitView extends View {

	static content() {
		const cnt = <div></div>;
		console.log('DevLibraryInitView', cnt);
		return cnt;
	}
}


export function libraryInitCommand(atom, dir) {

	const content = new LibraryInitComponent();
	const view = new DevLibraryInitView();
	view.element.appendChild(content.element);
	const panel = atom.workspace.addModalPanel({item: view});

}
