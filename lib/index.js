const { default: traverse } = require('@babel/traverse')

const flowFuncName = 'flow'

module.exports = function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (
          'StringLiteral' === path.node.source.type &&
          'mobx-state-tree' === path.node.source.value &&
          path.node.specifiers &&
          !path.node.specifiers.find(o => o.name === flowFuncName)
        ) {
          path.node.specifiers.push(t.importSpecifier(t.identifier(flowFuncName), t.identifier(flowFuncName)))
        }
      },
      CallExpression(path, state) {
        const { node } = path
        if (
          'MemberExpression' === node.callee.type &&
          'Identifier' === node.callee.property.type &&
          'actions' === node.callee.property.name &&
          'CallExpression' === node.callee.object.type &&
          'MemberExpression' === node.callee.object.callee.type &&
          'Identifier' === node.callee.object.callee.property.type &&
          'model' === node.callee.object.callee.property.name &&
          'Identifier' === node.callee.object.callee.object.type &&
          'types' === node.callee.object.callee.object.name &&
          node.arguments.length === 1
        ) {
          const actionFuncNode = node.arguments[0]
          let actionsObjectNode = actionFuncNode.body

          if (t.isAssignmentExpression(actionFuncNode)) {
            actionsObjectNode = actionFuncNode.right.body
          }

          actionsObjectNode.properties = actionsObjectNode.properties.map(p => {
            if ('ObjectMethod' === p.type && p.async) {
              traverse(
                p,
                {
                  AwaitExpression(path) {
                    const argument = path.get('argument')

                    if (path.parentPath.isYieldExpression()) {
                      path.replaceWith(argument.node)
                      return
                    }

                    path.replaceWith(t.yieldExpression(argument.node))
                  }
                },
                this,
                state,
                path
              )

              return t.objectProperty(
                p.key,
                t.callExpression(t.identifier(flowFuncName), [
                  t.functionExpression(null, p.params, p.body, true)
                ])
              )
            }

            if (
              p.type === 'ObjectProperty' &&
              isAsyncFunctionExpression(p.value)
            ) {
              const funcNode = p.value
              traverse(
                funcNode,
                {
                  AwaitExpression(path) {
                    const argument = path.get('argument')

                    if (path.parentPath.isYieldExpression()) {
                      path.replaceWith(argument.node)
                      return
                    }

                    path.replaceWith(t.yieldExpression(argument.node))
                  }
                },
                this,
                state,
                path
              )

              return t.objectProperty(
                p.key,
                t.callExpression(t.identifier(flowFuncName), [
                  t.functionExpression(
                    null,
                    funcNode.params,
                    funcNode.body,
                    true
                  )
                ])
              )
            }

            return p
          })
        }
      }
    }
  }
}

function isAsyncFunctionExpression(node) {
  return (
    (node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression') &&
    node.async
  )
}
