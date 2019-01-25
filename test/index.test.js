const { transformFileSync } = require('@babel/core')
const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

const plugin = require('../lib')

const formatOption = { parser: 'babel' }
const format = code => prettier.format(code, formatOption)

const fixturesDir = path.join(__dirname, 'fixtures')
const fixtures = fs.readdirSync(fixturesDir)

describe('default', () => {
  fixtures.map(caseName => {
    it(caseName.split('-').join(' '), () => {
      const fixtureDir = path.join(fixturesDir, caseName)
      const actualPath = path.join(fixtureDir, 'actual.js')

      const resultCode = transformFileSync(actualPath, { plugins: [plugin] }).code

      const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js')).toString()
      expect(format(resultCode)).toEqual(format(expected))
    })
  })
})
