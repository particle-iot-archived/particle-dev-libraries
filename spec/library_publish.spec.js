'use babel';

import path from 'path';
import {copySync} from 'fs-extra';
import {expect} from 'chai';
import {expectNotification} from './package.spec';
import {projectSelectedScope} from './project.spec';
import {runCommand} from './commands.spec';
import {libraryDelete} from './library.spec';

projectSelectedScope((context) => {
    function expectValidationErrorNotification(msg) {
        const module = require('../lib/library_contribute');
        const expected = module.notifyValidationError(msg);
        expectNotification(expected);
    }

    function runPublish(then) {
        return runCommand('publish', then);
    }

    describe('and library publish is run in a directory', () => {
        describe('that is a v2 library', () => {
            const libraryName = 'test-library-publish';
            let resourcesDirectory;
            before(() => {
                resourcesDirectory = require('particle-library-manager').resourcesDir;
            });

            it('can delete the existing library', () => {
                return libraryDelete(libraryName);
            });

            it('can publish the library', () => {
                const version = '0.0.1';
                copySync(path.join(resourcesDirectory(), 'libraries', 'contribute', 'valid', version), context.projectDir);
                const module = require('../lib/library_publish');
                return runCommand('contribute', () => {
                    console.log('CONTIRBUTE');
                    return runPublish(() => {
                        console.log('PUBLISH');
                        return expectNotification(module.notifyLibraryPublished({name:libraryName, metadata: {version}}));
                    });
                });
            });

            it('can delete the existing library as cleanup', () => {
                return libraryDelete(libraryName);
            });
        });
    });
});
