/**
 * AST Parser module — performs static analysis on code to detect
 * structural patterns: loops, recursion, divide & conquer, etc.
 *
 * For JavaScript code, uses the Acorn parser for real AST analysis.
 * For other languages, uses robust regex-based pattern matching.
 */

const acorn = require('acorn');
const walk = require('acorn-walk');

// -------------------------------------------------------------------
// JavaScript AST Analysis (precise)
// -------------------------------------------------------------------

function analyzeJavaScriptAST(code) {
  const result = {
    loops: [],
    maxLoopDepth: 0,
    recursion: false,
    recursiveFunctions: [],
    functionCalls: [],
    logarithmicPatterns: false,
    divideAndConquer: false,
    hasHashMap: false,
    hasSorting: false,
    hasArrayAccess: false,
    lineDetails: [],
  };

  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
    });
  } catch {
    // Fall back to regex for unparseable JS
    return analyzeWithRegex(code, 'javascript');
  }

  // Collect declared function names
  const declaredFunctions = new Set();
  walk.simple(ast, {
    FunctionDeclaration(node) {
      if (node.id) declaredFunctions.add(node.id.name);
    },
    VariableDeclarator(node) {
      if (
        node.init &&
        (node.init.type === 'ArrowFunctionExpression' ||
          node.init.type === 'FunctionExpression') &&
        node.id
      ) {
        declaredFunctions.add(node.id.name);
      }
    },
  });

  // Detect loop depth via ancestor tracking (exclude the current node itself)
  function getLoopDepth(node, ancestors) {
    let depth = 0;
    for (const ancestor of ancestors) {
      if (ancestor === node) continue;
      if (
        ancestor.type === 'ForStatement' ||
        ancestor.type === 'ForInStatement' ||
        ancestor.type === 'ForOfStatement' ||
        ancestor.type === 'WhileStatement' ||
        ancestor.type === 'DoWhileStatement'
      ) {
        depth++;
      }
    }
    return depth;
  }

  const loopTypes = [
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'WhileStatement',
    'DoWhileStatement',
  ];

  walk.ancestor(ast, {
    ...Object.fromEntries(
      loopTypes.map((type) => [
        type,
        (node, ancestors) => {
          const depth = getLoopDepth(node, ancestors) + 1;
          result.loops.push({
            type: type.replace('Statement', '').toLowerCase(),
            line: node.loc?.start.line || 0,
            depth,
          });
          result.maxLoopDepth = Math.max(result.maxLoopDepth, depth);

          // Check for logarithmic pattern: i *= 2, i /= 2, i >>= 1
          if (type === 'ForStatement' && node.update) {
            const update = node.update;
            if (update.type === 'AssignmentExpression') {
              if (['*=', '/=', '>>=', '<<='].includes(update.operator)) {
                result.logarithmicPatterns = true;
              }
            }
          }

          // Check while loop body for log patterns
          if (type === 'WhileStatement') {
            const bodyCode = code.slice(node.body.start, node.body.end);
            if (/\/=\s*2|>>=\s*1|\*=\s*2|Math\.floor.*\/\s*2/.test(bodyCode)) {
              result.logarithmicPatterns = true;
            }
          }

          result.lineDetails.push({
            line: node.loc?.start.line || 0,
            type: 'loop',
            depth,
            description: `${type.replace('Statement', '')} loop at depth ${depth}`,
          });
        },
      ])
    ),

    CallExpression(node, ancestors) {
      const callee = node.callee;
      let name = '';
      if (callee.type === 'Identifier') {
        name = callee.name;
      } else if (callee.type === 'MemberExpression' && callee.property) {
        name =
          callee.property.type === 'Identifier' ? callee.property.name : '';
      }

      result.functionCalls.push(name);

      // Check recursion: function calls itself
      const enclosingFn = [...ancestors]
        .reverse()
        .find(
          (a) =>
            a.type === 'FunctionDeclaration' ||
            a.type === 'FunctionExpression' ||
            a.type === 'ArrowFunctionExpression'
        );

      if (enclosingFn) {
        let fnName = '';
        if (enclosingFn.type === 'FunctionDeclaration' && enclosingFn.id) {
          fnName = enclosingFn.id.name;
        }
        if (fnName && name === fnName) {
          result.recursion = true;
          if (!result.recursiveFunctions.includes(fnName)) {
            result.recursiveFunctions.push(fnName);
          }
          result.lineDetails.push({
            line: node.loc?.start.line || 0,
            type: 'recursion',
            depth: 0,
            description: `Recursive call to "${fnName}"`,
          });
        }
      }

      // Check for sorting
      if (['sort', 'toSorted'].includes(name)) {
        result.hasSorting = true;
      }

      // Check for Map/Set usage (hash map)
      if (['Map', 'Set', 'WeakMap', 'WeakSet'].includes(name)) {
        result.hasHashMap = true;
      }
    },

    NewExpression(node) {
      if (node.callee.type === 'Identifier') {
        if (['Map', 'Set', 'WeakMap', 'WeakSet'].includes(node.callee.name)) {
          result.hasHashMap = true;
        }
      }
    },

    MemberExpression(node) {
      if (node.computed) {
        result.hasArrayAccess = true;
      }
    },
  });

  // Detect divide and conquer: recursion with halving
  if (result.recursion && result.logarithmicPatterns) {
    result.divideAndConquer = true;
  }

  return result;
}

// -------------------------------------------------------------------
// Regex-based analysis for other languages
// -------------------------------------------------------------------

function analyzeWithRegex(code, language) {
  const result = {
    loops: [],
    maxLoopDepth: 0,
    recursion: false,
    recursiveFunctions: [],
    functionCalls: [],
    logarithmicPatterns: false,
    divideAndConquer: false,
    hasHashMap: false,
    hasSorting: false,
    hasArrayAccess: false,
    lineDetails: [],
  };

  const lines = code.split('\n');

  // Detect functions
  const funcPatterns = {
    cpp: /(?:void|int|bool|float|double|string|auto|long|char)\s+(\w+)\s*\(/g,
    java: /(?:public|private|protected|static|\s)*\s+\w+\s+(\w+)\s*\(/g,
    python: /def\s+(\w+)\s*\(/g,
    javascript: /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\(.*\)\s*\{)/g,
    go: /func\s+(\w+)\s*\(/g,
    rust: /fn\s+(\w+)\s*[<(]/g,
  };

  const declaredFunctions = new Set();
  const pattern = funcPatterns[language] || funcPatterns.javascript;
  let match;
  while ((match = pattern.exec(code)) !== null) {
    const name = match[1] || match[2] || match[3];
    if (name) declaredFunctions.add(name);
  }

  // Loop detection with nesting depth tracking
  const loopRegex = /\b(for|while|do)\b/g;
  let currentDepth = 0;
  let braceDepth = 0;
  const depthStack = [];

  // Python-specific: use indentation for depth tracking
  if (language === 'python') {
    let maxDepth = 0;
    let currentLoopDepthPy = 0;
    const indentStack = [];

    lines.forEach((line, i) => {
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      // Pop indent stack when we move back out
      while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1].indent) {
        indentStack.pop();
        currentLoopDepthPy = indentStack.length;
      }

      const loopMatch = trimmed.match(/^(for|while)\s+/);
      if (loopMatch) {
        currentLoopDepthPy = indentStack.length + 1;
        indentStack.push({ indent, line: i + 1 });

        result.loops.push({
          type: loopMatch[1],
          line: i + 1,
          depth: currentLoopDepthPy,
        });
        maxDepth = Math.max(maxDepth, currentLoopDepthPy);

        result.lineDetails.push({
          line: i + 1,
          type: 'loop',
          depth: currentLoopDepthPy,
          description: `${loopMatch[1]} loop at depth ${currentLoopDepthPy}`,
        });
      }

      // Detect logarithmic patterns in Python
      if (/\/\/=\s*2|>>=\s*1|\*=\s*2/.test(trimmed)) {
        result.logarithmicPatterns = true;
      }
    });
    result.maxLoopDepth = maxDepth;
  } else {
    // Brace-based languages
    let loopDepthStack = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Count braces
      for (const ch of trimmed) {
        if (ch === '{') {
          braceDepth++;
        } else if (ch === '}') {
          braceDepth--;
          // Check if closing a loop
          if (loopDepthStack.length > 0 && braceDepth < loopDepthStack[loopDepthStack.length - 1]) {
            loopDepthStack.pop();
          }
        }
      }

      const loopMatch = trimmed.match(/\b(for|while|do)\s*[\({]/);
      if (loopMatch) {
        const depth = loopDepthStack.length + 1;
        loopDepthStack.push(braceDepth);

        result.loops.push({
          type: loopMatch[1],
          line: i + 1,
          depth,
        });
        result.maxLoopDepth = Math.max(result.maxLoopDepth, depth);

        result.lineDetails.push({
          line: i + 1,
          type: 'loop',
          depth,
          description: `${loopMatch[1]} loop at depth ${depth}`,
        });
      }

      // Detect logarithmic patterns
      if (/\/=\s*2|>>=\s*1|\*=\s*2|<<\s*1/.test(trimmed)) {
        result.logarithmicPatterns = true;
      }
    });
  }

  // Detect recursion: check if any declared function appears inside its own body
  for (const funcName of declaredFunctions) {
    // Build regex to find the function body and recursive calls
    const callRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
    const allCalls = [...code.matchAll(callRegex)];
    // If function is called more than once (definition + call), it might be recursive
    if (allCalls.length >= 2) {
      result.recursion = true;
      result.recursiveFunctions.push(funcName);

      // Find the line of recursive call
      for (const m of allCalls.slice(1)) {
        const lineNum = code.slice(0, m.index).split('\n').length;
        result.lineDetails.push({
          line: lineNum,
          type: 'recursion',
          depth: 0,
          description: `Recursive call to "${funcName}"`,
        });
      }
    }
  }

  // Detect hash maps
  const hashMapPatterns = {
    cpp: /\b(unordered_map|unordered_set|map|set)\s*</,
    java: /\b(HashMap|HashSet|TreeMap|TreeSet|LinkedHashMap)\s*</,
    python: /\b(dict|set)\s*\(|\{\s*\w+\s*:/,
    javascript: /new\s+(Map|Set)|Map\(\)|Set\(\)/,
    go: /\bmap\s*\[/,
    rust: /\b(HashMap|HashSet|BTreeMap|BTreeSet)::/,
  };
  if (hashMapPatterns[language] && hashMapPatterns[language].test(code)) {
    result.hasHashMap = true;
  }

  // Detect sorting
  const sortPatterns = {
    cpp: /\b(sort|stable_sort)\s*\(/,
    java: /\b(Arrays\.sort|Collections\.sort|\.sort\s*\()/,
    python: /\b(sorted\s*\(|\.sort\s*\()/,
    javascript: /\.sort\s*\(/,
    go: /sort\.(Slice|Ints|Float64s|Strings)\s*\(/,
    rust: /\.(sort|sort_by|sort_unstable)\s*\(/,
  };
  if (sortPatterns[language] && sortPatterns[language].test(code)) {
    result.hasSorting = true;
  }

  // Detect divide and conquer
  if (result.recursion && result.logarithmicPatterns) {
    result.divideAndConquer = true;
  }

  // Check for binary search patterns
  if (/\b(mid|middle)\s*=.*(?:\/\s*2|>>\s*1|Math\.floor)/.test(code)) {
    result.logarithmicPatterns = true;
    if (result.recursion) {
      result.divideAndConquer = true;
    }
  }

  return result;
}

// Main export
function parseCode(code, language) {
  if (language === 'javascript') {
    return analyzeJavaScriptAST(code);
  }
  return analyzeWithRegex(code, language);
}

module.exports = { parseCode };
