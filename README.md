# babel-plugin-mst-async-action

[![npm](https://img.shields.io/npm/v/babel-plugin-mst-async-action.svg)](https://www.npmjs.com/package/babel-plugin-mst-async-action)
[![travis-ci](https://travis-ci.com/newraina/babel-plugin-mst-async-action.svg?branch=master)](https://travis-ci.com/newraina/babel-plugin-mst-async-action)

Converts mobx-state-tree async actions to flows

[TypeScript Transformer Plugin Version](https://github.com/newraina/ts-plugin-mst-async-action)

## Example

### In

```ts
import { types } from 'mobx-state-tree'

const store = types.model({ count: 0 }).actions(self => ({
  async getCount() {
    self.count = await api.getCount()
  }
}))
```

### Out

```ts
import { types, flow } from 'mobx-state-tree'

const store = types.model({ count: 0 }).actions(self => ({
  getCount: flow(function*() {
    self.count = yield api.getCount()
  })
}))
```

## Usage

### .babelrc

```json5
{
  "plugins": ["babel-plugin-mst-async-action"]
}
```
