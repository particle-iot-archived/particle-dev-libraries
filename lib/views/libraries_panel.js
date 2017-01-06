'use babel';
/** @jsx etch.dom */

import etch from 'etch';
import {EtchTextEditorView} from './text_editor';
import {LibrariesListView} from './libraries_list';

export class LibrariesPanelView {
	constructor(props, children) {
		this.props = props;
		etch.initialize(this);

		this.refs.searchEditor.getModel().onDidStopChanging(() => {
			let query = this.refs.searchEditor.getModel().getText();
			this.refs.mineLibs.fetchLibraries(query);
			this.refs.communityLibs.fetchLibraries(query);
		});

		this.refs.mineLibs.fetchLibraries('');
		this.refs.communityLibs.fetchLibraries('');
	}

	render() {
		return <div id='libraries-panel'>
			<h1>Particle Libraries</h1>
			<div className='editor-container'>
				<EtchTextEditorView mini={true} placeholderText='Search libraries' ref='searchEditor' />
			</div>
			<h2>My Libraries</h2>
			<LibrariesListView section='mine' ref='mineLibs' />

			<h2>Community Libraries</h2>
			<LibrariesListView section='community' ref='communityLibs' />
		</div>;
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
}
