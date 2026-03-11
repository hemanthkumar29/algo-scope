/**
 * Main Analyzer module — orchestrates AST parsing and complexity analysis.
 */

const { parseCode } = require('../ast_parser');
const {
  determineTimeComplexity,
  determineSpaceComplexity,
  generateGraphPoints,
  generateComparisonData,
  generateSimulationTable,
  generateExplanation,
  generateSuggestions,
  generateStepByStep,
} = require('../complexity_engine');

const SUPPORTED_LANGUAGES = ['cpp', 'java', 'python', 'javascript', 'go', 'rust'];

/**
 * Analyze code and return full complexity report.
 */
async function analyzeCode(language, code) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // 1. Parse the code
  const analysis = parseCode(code, language);

  // 2. Determine complexities
  const timeResult = determineTimeComplexity(analysis, code);
  const spaceResult = determineSpaceComplexity(analysis, code);

  // 3. Generate outputs
  const explanation = generateExplanation(
    analysis,
    timeResult.notation,
    spaceResult.notation
  );

  const graphPoints = generateGraphPoints(timeResult.notation);
  const comparisonData = generateComparisonData();
  const simulationTable = generateSimulationTable(timeResult.notation);
  const suggestions = generateSuggestions(analysis, timeResult.notation);
  const stepByStep = generateStepByStep(analysis);

  // 4. Determine highlighted lines
  const highlightLines = analysis.lineDetails.map((d) => d.line).filter(Boolean);

  // 5. Best/average/worst case heuristics
  const cases = determineCases(timeResult, analysis);

  return {
    time_complexity: timeResult.notation,
    time_label: timeResult.label,
    space_complexity: spaceResult.notation,
    space_label: spaceResult.label,
    loop_depth: analysis.maxLoopDepth,
    recursion: analysis.recursion,
    recursive_functions: analysis.recursiveFunctions,
    logarithmic_patterns: analysis.logarithmicPatterns,
    divide_and_conquer: analysis.divideAndConquer,
    has_sorting: analysis.hasSorting,
    has_hash_map: analysis.hasHashMap,
    explanation,
    graph_points: graphPoints,
    comparison_data: comparisonData,
    simulation_table: simulationTable,
    suggestions,
    step_by_step: stepByStep,
    highlight_lines: highlightLines,
    cases,
  };
}

/**
 * Determine best/average/worst case complexity heuristics.
 */
function determineCases(timeResult, analysis) {
  const worst = timeResult.notation;

  // Simple heuristics for best/average cases
  if (analysis.logarithmicPatterns && !analysis.recursion) {
    // Binary search style: best O(1), avg/worst O(log n)
    return {
      best: { notation: 'O(1)', description: 'Target found at first check' },
      average: { notation: worst, description: 'Target at middle partition' },
      worst: { notation: worst, description: 'Target at deepest partition' },
    };
  }

  if (analysis.hasSorting) {
    return {
      best: { notation: 'O(n)', description: 'Already sorted input (for some sort algorithms)' },
      average: { notation: worst, description: 'Random input' },
      worst: { notation: worst, description: 'Worst-case input for the sort' },
    };
  }

  if (analysis.maxLoopDepth >= 2) {
    return {
      best: { notation: worst, description: 'All iterations execute' },
      average: { notation: worst, description: 'All iterations execute' },
      worst: { notation: worst, description: 'All iterations execute' },
    };
  }

  if (analysis.maxLoopDepth === 1) {
    return {
      best: { notation: 'O(1)', description: 'Early termination on first element' },
      average: { notation: worst, description: 'Element found at middle' },
      worst: { notation: worst, description: 'Element at end or not found' },
    };
  }

  return {
    best: { notation: worst, description: 'Constant across all inputs' },
    average: { notation: worst, description: 'Constant across all inputs' },
    worst: { notation: worst, description: 'Constant across all inputs' },
  };
}

module.exports = { analyzeCode };
