/**
 * Complexity Engine — determines time and space complexity
 * based on static analysis results from the AST parser.
 *
 * Uses pattern matching and heuristics to classify algorithmic complexity.
 */

// Complexity class definitions
const COMPLEXITIES = {
  O_1: { notation: 'O(1)', label: 'Constant', rank: 0 },
  O_LOG_N: { notation: 'O(log n)', label: 'Logarithmic', rank: 1 },
  O_N: { notation: 'O(n)', label: 'Linear', rank: 2 },
  O_N_LOG_N: { notation: 'O(n log n)', label: 'Linearithmic', rank: 3 },
  O_N2: { notation: 'O(n²)', label: 'Quadratic', rank: 4 },
  O_N3: { notation: 'O(n³)', label: 'Cubic', rank: 5 },
  O_2N: { notation: 'O(2ⁿ)', label: 'Exponential', rank: 6 },
  O_N_FACT: { notation: 'O(n!)', label: 'Factorial', rank: 7 },
};

// Growth functions for graph data
const GROWTH_FUNCTIONS = {
  'O(1)': (n) => 1,
  'O(log n)': (n) => Math.max(1, Math.log2(n)),
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * Math.max(1, Math.log2(n)),
  'O(n²)': (n) => n * n,
  'O(n³)': (n) => n * n * n,
  'O(2ⁿ)': (n) => Math.pow(2, n),
  'O(n!)': (n) => {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
};

/**
 * Determine time complexity from parsed analysis results
 */
function determineTimeComplexity(analysis, code) {
  const { maxLoopDepth, recursion, recursiveFunctions, logarithmicPatterns, divideAndConquer, hasSorting } = analysis;

  // Check for factorial patterns
  if (recursion && /permut|factorial|n\s*\*\s*factorial|swap.*backtrack|backtrack/i.test(code)) {
    return COMPLEXITIES.O_N_FACT;
  }

  // Check for exponential patterns (fibonacci-like double recursion)
  if (recursion) {
    // Count recursive calls per function
    for (const fn of recursiveFunctions) {
      const regex = new RegExp(`\\b${fn}\\s*\\(`, 'g');
      const matches = code.match(regex);
      // Two or more recursive calls without loop halving → exponential
      if (matches && matches.length >= 3 && !logarithmicPatterns) {
        return COMPLEXITIES.O_2N;
      }
    }
  }

  // Divide and conquer: recursion + halving = O(n log n) or O(log n)
  if (divideAndConquer) {
    if (maxLoopDepth >= 1) {
      return COMPLEXITIES.O_N_LOG_N;
    }
    return COMPLEXITIES.O_LOG_N;
  }

  // Pure logarithmic: loop with halving and no nesting
  if (logarithmicPatterns && maxLoopDepth <= 1 && !recursion) {
    return COMPLEXITIES.O_LOG_N;
  }

  // Sorting detected
  if (hasSorting) {
    // Sorting with additional nested loops
    if (maxLoopDepth >= 2) {
      return COMPLEXITIES.O_N2;
    }
    return COMPLEXITIES.O_N_LOG_N;
  }

  // Loop depth-based classification
  if (maxLoopDepth >= 3) return COMPLEXITIES.O_N3;
  if (maxLoopDepth === 2) return COMPLEXITIES.O_N2;

  // Single loop with log pattern inside
  if (maxLoopDepth === 1 && logarithmicPatterns) {
    return COMPLEXITIES.O_N_LOG_N;
  }

  if (maxLoopDepth === 1) return COMPLEXITIES.O_N;

  // Recursion without clear patterns
  if (recursion && maxLoopDepth === 0) {
    return COMPLEXITIES.O_N;
  }

  return COMPLEXITIES.O_1;
}

/**
 * Determine space complexity from parsed analysis results
 */
function determineSpaceComplexity(analysis, code) {
  const { recursion, hasHashMap, maxLoopDepth } = analysis;

  // Check for explicit array/matrix allocation
  const allocatesArray = /new\s+(Array|int|float|double|String)\s*\[|new\s+ArrayList|\.fill\(|Array\.from|malloc|calloc|\[\s*0\s*\]\s*\*\s*n|np\.zeros|vec!\[/.test(code);
  const allocatesMatrix = /\[\s*\]\s*\[\s*\]|Array\.from.*Array\.from|new\s+\w+\s*\[.*\]\s*\[|matrix|grid|dp\s*\[/.test(code);

  if (allocatesMatrix) {
    return COMPLEXITIES.O_N2;
  }

  if (allocatesArray || hasHashMap) {
    return COMPLEXITIES.O_N;
  }

  // Recursive functions use stack space
  if (recursion) {
    // Deep recursion without tail-call optimization
    return COMPLEXITIES.O_N;
  }

  return COMPLEXITIES.O_1;
}

/**
 * Generate growth data points for graphing
 */
function generateGraphPoints(timeComplexity) {
  const fn = GROWTH_FUNCTIONS[timeComplexity];
  if (!fn) return [];

  const inputSizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  return inputSizes.map((n) => ({
    n,
    operations: Math.min(fn(n), 1e9),
  }));
}

/**
 * Generate comparison data: all complexity classes together
 */
function generateComparisonData() {
  const inputSizes = [1, 2, 5, 10, 20, 50, 100];
  return inputSizes.map((n) => {
    const point = { n };
    for (const [label, fn] of Object.entries(GROWTH_FUNCTIONS)) {
      point[label] = Math.min(fn(n), 1e8);
    }
    return point;
  });
}

/**
 * Generate the growth simulation table
 */
function generateSimulationTable(timeComplexity) {
  const fn = GROWTH_FUNCTIONS[timeComplexity];
  if (!fn) return [];

  const sizes = [10, 50, 100, 500, 1000, 5000, 10000];
  return sizes.map((n) => ({
    n,
    operations: Math.round(fn(n)),
    formatted: formatNumber(Math.round(fn(n))),
  }));
}

function formatNumber(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generate natural language explanation
 */
function generateExplanation(analysis, timeComplexity, spaceComplexity) {
  const parts = [];

  // Time complexity explanation
  if (analysis.maxLoopDepth === 0 && !analysis.recursion) {
    parts.push(
      'This code runs in constant time — there are no loops or recursive calls that scale with input size.'
    );
  } else if (analysis.maxLoopDepth === 1 && !analysis.logarithmicPatterns) {
    parts.push(
      `This algorithm contains a single loop that iterates proportional to the input size, resulting in linear ${timeComplexity} time complexity.`
    );
  } else if (analysis.maxLoopDepth === 2) {
    parts.push(
      `This algorithm contains two nested loops, each iterating up to n times. The total number of operations grows quadratically as n increases, giving ${timeComplexity} time complexity.`
    );
  } else if (analysis.maxLoopDepth >= 3) {
    parts.push(
      `This algorithm has ${analysis.maxLoopDepth} levels of nested loops, resulting in ${timeComplexity} time complexity. The operations grow polynomially with input size.`
    );
  } else if (analysis.divideAndConquer) {
    parts.push(
      `This algorithm uses a divide-and-conquer approach, recursively halving the problem size. This results in ${timeComplexity} time complexity.`
    );
  } else if (analysis.logarithmicPatterns && !analysis.recursion) {
    parts.push(
      `This algorithm halves the search space in each iteration (e.g., binary search pattern), resulting in ${timeComplexity} time complexity.`
    );
  } else if (analysis.recursion) {
    parts.push(
      `This algorithm uses recursion${analysis.recursiveFunctions.length > 0 ? ` (function: ${analysis.recursiveFunctions.join(', ')})` : ''}. Based on the recursion pattern, the time complexity is ${timeComplexity}.`
    );
  }

  if (analysis.hasSorting) {
    parts.push(
      'A sorting operation was detected, which typically contributes O(n log n) to the overall complexity.'
    );
  }

  // Space complexity explanation
  if (spaceComplexity === 'O(1)') {
    parts.push(
      'The space complexity is O(1) — only a constant amount of extra memory is used regardless of input size.'
    );
  } else if (spaceComplexity === 'O(n)') {
    if (analysis.recursion) {
      parts.push(
        'The space complexity is O(n) due to the recursion call stack, which can grow proportional to the input size.'
      );
    } else {
      parts.push(
        'The space complexity is O(n) because the algorithm allocates data structures that grow linearly with input size.'
      );
    }
  } else if (spaceComplexity === 'O(n²)') {
    parts.push(
      'The space complexity is O(n²) due to a 2D data structure (matrix/grid) that scales quadratically.'
    );
  }

  return parts.join(' ');
}

/**
 * Generate code optimization suggestions
 */
function generateSuggestions(analysis, timeComplexity) {
  const suggestions = [];

  if (timeComplexity === 'O(n²)' && !analysis.hasHashMap) {
    suggestions.push({
      title: 'Use a Hash Map',
      description:
        'Consider using a hash map (dictionary/object) to reduce the nested loop to a single pass, potentially achieving O(n) time.',
      impact: 'O(n²) → O(n)',
    });
  }

  if (timeComplexity === 'O(n²)' && analysis.maxLoopDepth >= 2) {
    suggestions.push({
      title: 'Two-Pointer Technique',
      description:
        'If the data is sorted or can be sorted, a two-pointer approach can often eliminate the inner loop.',
      impact: 'O(n²) → O(n) or O(n log n)',
    });
  }

  if (analysis.hasSorting && analysis.maxLoopDepth >= 1) {
    suggestions.push({
      title: 'Avoid Sorting if Possible',
      description:
        'Consider if sorting is truly necessary. A hash-based approach might solve the problem without the O(n log n) sort overhead.',
      impact: 'Reduces constant factor or overall complexity',
    });
  }

  if (timeComplexity === 'O(2ⁿ)') {
    suggestions.push({
      title: 'Apply Memoization',
      description:
        'This exponential recursion likely has overlapping subproblems. Adding memoization (dynamic programming) can dramatically reduce time.',
      impact: 'O(2ⁿ) → O(n) or O(n²)',
    });
  }

  if (analysis.recursion && !analysis.logarithmicPatterns) {
    suggestions.push({
      title: 'Convert to Iteration',
      description:
        'This recursive solution could be converted to an iterative approach using an explicit stack, reducing stack overflow risk and potentially improving performance.',
      impact: 'Reduces stack space usage',
    });
  }

  if (analysis.maxLoopDepth >= 3) {
    suggestions.push({
      title: 'Reduce Loop Nesting',
      description:
        'Three or more nested loops indicate high complexity. Consider breaking the problem into subproblems or using more efficient data structures.',
      impact: `O(n^${analysis.maxLoopDepth}) → potentially lower`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Looks Efficient',
      description:
        'The current algorithm appears to be reasonably optimized for its approach.',
      impact: 'No immediate improvements identified',
    });
  }

  return suggestions;
}

/**
 * Generate step-by-step algorithm breakdown
 */
function generateStepByStep(analysis) {
  const steps = [];

  // Group line details by type
  const loops = analysis.lineDetails.filter((d) => d.type === 'loop');
  const recursions = analysis.lineDetails.filter((d) => d.type === 'recursion');

  if (loops.length > 0) {
    loops.forEach((loop, i) => {
      steps.push({
        step: steps.length + 1,
        line: loop.line,
        description: loop.description,
        complexity: loop.depth === 1 ? 'O(n)' : `O(n^${loop.depth})`,
      });
    });
  }

  if (recursions.length > 0) {
    recursions.forEach((rec) => {
      steps.push({
        step: steps.length + 1,
        line: rec.line,
        description: rec.description,
        complexity: 'Varies',
      });
    });
  }

  if (steps.length === 0) {
    steps.push({
      step: 1,
      line: 1,
      description: 'No significant iterative or recursive structures detected',
      complexity: 'O(1)',
    });
  }

  return steps;
}

module.exports = {
  COMPLEXITIES,
  GROWTH_FUNCTIONS,
  determineTimeComplexity,
  determineSpaceComplexity,
  generateGraphPoints,
  generateComparisonData,
  generateSimulationTable,
  generateExplanation,
  generateSuggestions,
  generateStepByStep,
};
