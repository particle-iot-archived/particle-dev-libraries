# Particle Dev support for Libraries

![Library add command](https://raw.githubusercontent.com/spark/particle-dev-libraries/master/resources/library_add.gif)

[![Build Status](https://travis-ci.org/spark/particle-dev-libraries.svg?branch=master)](https://travis-ci.org/spark/particle-dev-libraries)

This package provides library-related commands to Particle Dev.

# Add library to a project

When working on a project, open command palette (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on macOS and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Windows/Linux) and search for `libraries add`.

Selecting `Particle Dev Libraries: Add` command will open a library search dialog allowing you to search for a library by name, author or description.

After finding the library you want to use, hit <kbd>Enter</kbd> and the library will be added to your project in `project.properties` file.

When compiling using cloud, the server will install all used libraries for you.

# Library development

## Migrating libraries to new format

If your library contains `spark.json` file, it's in legacy format. We introduced a new format, compatible with Arduino libraries and we will no longer support publishing of legacy libraries.

To make the transition easier, we prepared a migration tool which should help with the process.

Open a legacy library in Particle Dev, then select `Particle Dev Libraries: Migrate` command from the palette. This will migrate the metadata file and move files into their new locations.

Verify if everything is ok and bump version in `library.properties` file. Now you're ready to publish your migrated library.

## Contributing a library to Particle community libraries repository

To contribute your library, open it in Particle Dev and select `Particle Dev Libraries: Contribute` command. This will validate its contents/metadata and upload it to our repository. Once this is finished, you can [add it to a project](#add-library-to-a-project) and test if everything works.

Contributed library is only visible to you. Once you want to allow everyone to use it you need to [publish it](#publishing-a-library).

## Publishing a library

Contributed libraries are private by default (only you can use them). To make it available for everyone, open the library in Particle Dev and use `Particle Dev Libraries: Publish` command from the palette.

After publishing, everyone will be able to search for and use your library.

**Warning:** once published, a library can't be unpublished!
