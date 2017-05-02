'use babel';

/**
 * A thin wrapper for SpacePen text editor making it work with Etch
 */
const { TextEditorView } = require('atom-space-pen-views');
import etch from 'etch';

export class EtchTextEditorView extends TextEditorView {
	update(props, children) {}

	async destroy () {
		await etch.destroy(this);
	}
}
