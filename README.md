
Monocular
=========

Monocular is a simple command line interface to submit test images to
[Applitools Eyes](https://applitools.com/). It allows for submitting
images captured in any test environment, as long as the evironment is
able to start a process and feed it Line Delimited JSON over STDIN or
a file.

Using STDIN is preferred, as it allows Monocular to start uploading
images as soon as possible.

Usage
-----

```
Usage: node monocular.js [file] [options]

file     File to read

Options:
   -d, --delete     Delete images after processing
   -n, --simulate   Simulate submission to Applitools
```

JSON data
---------

Each object should contain a `cmd` key that defines the command.

Commands:

* `init`:
    Set basic parameters. Expects:
    * `apiKey`: Your Applitools Eyes API key.
    * `os`: The OS running the test.
    * `browser`: The browser tests are being run on (or "hosting app").

* `open`:
    Opens a test session. Expects:
    * `appName`: Name of the application.
    * `testName`: Name of the test.

* `image`:
    Submit an image. Expects:
    * `file`: PNG file to read. Will be deleted if the -d switch is
            provided.
    * `tag`: Image tag.

* `end`:
    Ends the session, no arguments expected.


Output and return code
----------------------

On successful submission, Monocular prints the result of the test to
STDOUT like this:

`Result: NEW https://eyes.applitools.com/app/sessions/251978230806379`

`Result: OK https://eyes.applitools.com/app/sessions/251978348342540`

`Result: FAIL https://eyes.applitools.com/app/sessions/251978347866624`

The URL is the URL of the test session for inspection at Applitools
site. The exit code of Monocular is 0 for passing tests and 20 for
failing and new tests (to not collide with internal nodejs codes). All
other exit codes denote an error.
