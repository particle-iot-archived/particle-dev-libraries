'use babel';
/** @jsx etch.dom */

import etch from 'etch'
import {Notification} from 'atom';
const {LibraryListCommandSite, LibraryListCommand} = require('../cli');
import {EtchTextEditorView} from './text_editor';
import {LibrariesListView} from './libraries_list';
import {runCommand, fetchApiClient} from '../library';

let target = {};
let fetchPromise;

export function listingLibrariesErrorNotification() {
	return new Notification('error', 'There was an error while listing libraries. Please try again later.', {
		dismissable: true
	});
}

class DevLibraryListCommandSite extends LibraryListCommandSite {
	constructor(filter) {
		super();
		this._filter = filter;
	}

	sections() {
		return {
			'mine' : {},
			'community': {}
		};
	}

	settings() {
		return {
			filter: this._filter
		};
	}

	target() {
		return target;
	}

	apiClient() {
		return fetchApiClient();
	}
}

export class LibrariesPanelView {
	constructor(props, children) {
		this.props = props;
		etch.initialize(this);

		this.refs.searchEditor.getModel().onDidStopChanging(() => {
			this.fetchLibraries(this.refs.searchEditor.getModel().getText());
		});

		this.fetchLibraries('');
	}

	render() {
		return <div id='libraries-panel'>
			<h1>Particle Libraries</h1>
			<div className='editor-container'>
				<EtchTextEditorView mini={true} placeholderText='Search libraries' ref='searchEditor' />
			</div>
			<h2>My Libraries</h2>
			<LibrariesListView libs={this.mineLibs} />

			<h2>Community Libraries</h2>
			<LibrariesListView libs={this.communityLibs} />
		</div>
	}

	update(props, children) {
		return etch.update(this);
	}

	getTitle() {
		return 'Particle Libraries';
	}

	getPath() {
		return 'libraries';
	}

	getUri() {
		return `particle-dev://editor/${this.getPath()}`;
	}

	fetchLibraries(query) {
		if (fetchPromise) {
			return;
		}
		this.mineLibs = undefined;
		this.communityLibs = undefined;

		const list = new LibraryListCommand();
		fetchPromise = runCommand(new DevLibraryListCommandSite(query).run(list, {})).then(() => {
			this.mineLibs = target.mine;
			this.communityLibs = target.community;
			fetchPromise = undefined;
			return etch.update(this);
		}).catch(err => {
			atom.notifications.addNotification(listingLibrariesErrorNotification());
			console.error(err);
			fetchPromise = undefined;
			return etch.update(this);
		});

		return etch.update(this);
	}
}
