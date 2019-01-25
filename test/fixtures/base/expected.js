import { types, flow } from 'mobx-state-tree'
const api = {
  getCount(...args) {
    return Promise.resolve(1)
  }
}
const store = types.model({
  count: 0
}).actions(self => ({
  getCount1: flow(function*() {
    self.count = yield api.getCount()
  }),
  getCount2: flow(function*() {
    self.count = yield api.getCount()
  }),
  getCount3: flow(function*() {
    self.count = yield api.getCount()
  }),
  getCount4: flow(function*(info) {
    self.count = yield api.getCount(info)
  })
}))
export default store.create()
