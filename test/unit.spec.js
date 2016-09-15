'use babel';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
chai.use(sinonChai);

import {expect} from 'chai';
import {registerCommands, unregisterCommands} from '../lib/commands';
import {getProjectDir} from '../lib/util/package-helper';
import * as commands from '../lib/cli';


describe('unit tests', () => {
	describe('commands', () => {
		describe('when registering commands', () => {
			const libraryAddCommand = sinon.stub();
			const libraryMigrateCommand = sinon.stub();
			const libraryInitCommand = sinon.stub();
			const atom = { commands: { add: sinon.stub() }, project: { getDirectories: sinon.stub().returns([])}};
			const disposable = { dispose: sinon.stub() };
			const namespace = 'particle-dev-libraries';
			atom.commands.add.returns(disposable);

			registerCommands(atom, {libraryAddCommand, libraryMigrateCommand, libraryInitCommand});
			const commands = atom.commands.add.firstCall.args[1];

			it('calls the atom.command.add method', () => {
				expect(atom.commands.add).to.have.been.calledOnce;
				expect(disposable.dispose).to.have.been.not.called;
			});

			it('registers commands against the atom workspace', () => {
				expect(atom.commands.add.firstCall.args[0]).to.be.equal('atom-workspace');
			});

			function expectCommand(desc, cmd, stub, match) {
				describe(desc, () => {
					const name = namespace+':'+cmd;
					expect(commands).to.have.property(name);
					const command = commands[name];

					expect(stub).to.be.not.called;

					it(`which calls ${desc} with the provided atom instance`, () => {
						command();
						expect(stub).to.be.calledOnce;
						expect(stub).to.have.been.calledWithMatch(...match);
					});
				});
			}

			expectCommand('libraryAdd', 'add', libraryAddCommand, [atom, getProjectDir(atom)]);
			expectCommand('libraryMigrate', 'migrate', libraryMigrateCommand, [atom, getProjectDir(atom)]);
			expectCommand('libraryInit', 'init', libraryInitCommand, [atom, getProjectDir(atom)]);

			it('calls dispose on the disposeable when the commands are unregistered', () => {
				unregisterCommands(atom);
				expect(disposable.dispose).to.have.been.calledOnce;
			});

		});
	});
});
