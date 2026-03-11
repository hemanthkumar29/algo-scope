export interface AnalysisResult {
  time_complexity: string;
  time_label: string;
  space_complexity: string;
  space_label: string;
  loop_depth: number;
  recursion: boolean;
  recursive_functions: string[];
  logarithmic_patterns: boolean;
  divide_and_conquer: boolean;
  has_sorting: boolean;
  has_hash_map: boolean;
  explanation: string;
  graph_points: GraphPoint[];
  comparison_data: ComparisonPoint[];
  simulation_table: SimulationRow[];
  suggestions: Suggestion[];
  step_by_step: StepByStep[];
  highlight_lines: number[];
  cases: CaseAnalysis;
}

export interface GraphPoint {
  n: number;
  operations: number;
}

export interface ComparisonPoint {
  n: number;
  [key: string]: number;
}

export interface SimulationRow {
  n: number;
  operations: number;
  formatted: string;
}

export interface Suggestion {
  title: string;
  description: string;
  impact: string;
}

export interface StepByStep {
  step: number;
  line: number;
  description: string;
  complexity: string;
}

export interface CaseAnalysis {
  best: { notation: string; description: string };
  average: { notation: string; description: string };
  worst: { notation: string; description: string };
}
