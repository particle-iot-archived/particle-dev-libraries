'use babel';

import {MiniEditorView} from 'particle-dev-views';
import {validateField} from 'particle-library-manager';


function validationMessage(validationResult, fieldName) {
	return validationResult.errors[fieldName];
}

function fieldValidator(fieldName) {
	const validator = (value) => {
		const result = validateField(fieldName, value);
		return (result && result.valid) ?
			'' : validationMessage(result, fieldName);
	};
	return validator;
}

export class Validators {
	static field(fieldName) {
		return fieldValidator(fieldName);
	}
}

export class ValidatingEditorView extends MiniEditorView {

	/**
	 * Wraps the MiniEditorView content
	 * @returns {*}
	 *
	 * todo - perhaps use composition here rather than inheritance?
	 */
	static content() {
		return this.div({class:'particle-validating-editor block'}, () => {
			MiniEditorView.content.bind(this)();
			this.div({ class: 'text-error block', outlet: 'errorLabel' });
		});
	}

	/**
	 *
	 * @param {string} placeholderText  Text to display when the editor is empty.
	 * @param {function} validator A function that returns a validation error for the field, or
	 *  a falsey value if the field is valid. Can be undefined.
	 */
	initialize(placeholderText, validator) {
		super.initialize(placeholderText);
		this.validator = validator;
		this.editorModel.onDidStopChanging(() => {
			this.validate();
		});
	}

	/**
	 * Validate the input and set the error text accordintly.
	 * If there is no validation error, the error text is clared.
	 */
	validate() {
		const msg = this.validator ? this.validator(this.value) : '';
		this.error = msg;
		return !msg;
	}

	set error(msg) {
		this.errorModel.text(msg || '');
	}

	get error() {
		return this.errorModel.text();
	}

	get editorModel() {
		return this.editor.getModel();
	}

	get errorModel() {
		return this.errorLabel;
	}

	get value() {
		return this.editorModel.getText();
	}

	set value(value) {
		this.editorModel.setText(value);
		this.validate();
	}

}
