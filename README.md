# template-directory

copy a template directory with variables injected

implemented using [pull streams](https://pull-stream.github.io/) for every async operation, so is very fast and usess minimal memory. :horse_racing:

```shell
npm install --save template-directory
```

## usage

### `templateDirectory = require('template-directory')`

### `templateDirectory(options, (err) => {})`

`options` is an object of the following:

- `source`: **required** source directory path
- `target`: **required** target directory path
- `vars`: object of variables to inject into templates _(default: `{}`)_
- `cwd`: current working directory to resolve relative file paths _(default: `process.cwd()`)_
- `open`: string to denote opening of variable injection _(default: `"{{"`)_
- `close`: string to denote closing of variable injection _(default: `"}}"`)_
- `parallel`: how many async operations to [run in parallel](https://github.com/pull-stream/pull-paramap) _(default: 10)_

callback is called when operation is done, either complete or has errored.

## license

The Apache License

Copyright &copy; 2017 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
