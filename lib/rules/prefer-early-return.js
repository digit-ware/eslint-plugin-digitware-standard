module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "prefer early return pattern inside functions",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        checkFunctionBody(node.body, context);
      },
      FunctionExpression(node) {
        checkFunctionBody(node.body, context);
      },
      ArrowFunctionExpression(node) {
        if (node.body.type === "BlockStatement") {
          checkFunctionBody(node.body, context);
        }
      },
      Program(node) {
        checkFunctionBody(node, context);
      },
    };
  },
};

function checkFunctionBody(body, context) {
  body.body.forEach((node) => {
    checkNestedIfStatements(node, context, 0);
  });
}

function checkNestedIfStatements(node, context, ifsFound, isAlternate = false) {
  if (!node || typeof node !== "object") return;

  if (node.type === "IfStatement" && !isAlternate) {
    ifsFound++;
    if (ifsFound > 1) {
      context.report({
        node,
        message: "Avoid nested if statements",
      });
      return;
    }
  }

  const childNodes = [
    node.body,
    node.consequent,
    node.block,
    node.handler,
    node.finalizer,
    ...(node.cases || []),
  ].filter(Boolean);

  isAlternate = false;

  // Alternate might come with a direct if statement,
  // in that case we don't have to increment ifsFound
  if (node.alternate) {
    childNodes.push(node.alternate);
    isAlternate = true;
  }

  // Recursively check all child nodes
  childNodes.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((n) =>
        checkNestedIfStatements(n, context, ifsFound, isAlternate)
      );
    } else if (typeof child === "object" && child !== null) {
      checkNestedIfStatements(child, context, ifsFound, isAlternate);
    }
  });
}
