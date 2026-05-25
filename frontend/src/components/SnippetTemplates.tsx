'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Search, Zap, ArrowRight } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  complexity: string;
  category: string;
  language: string;
  code: string;
}

const TEMPLATES: Template[] = [
  // O(1)
  {
    id: 'array-access',
    name: 'Array Access',
    description: 'Direct index access in an array',
    complexity: 'O(1)',
    category: 'Constant',
    language: 'javascript',
    code: `function getElement(arr, index) {
  return arr[index];
}

const arr = [10, 20, 30, 40, 50];
console.log(getElement(arr, 2)); // 30`,
  },
  // O(log n)
  {
    id: 'binary-search',
    name: 'Binary Search',
    description: 'Efficient search in a sorted array by halving the search space',
    complexity: 'O(log n)',
    category: 'Logarithmic',
    language: 'javascript',
    code: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}

console.log(binarySearch([1,3,5,7,9,11], 7));`,
  },
  // O(n)
  {
    id: 'linear-search',
    name: 'Linear Search',
    description: 'Find an element by scanning every item',
    complexity: 'O(n)',
    category: 'Linear',
    language: 'javascript',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log(linearSearch([4, 2, 7, 1, 9], 7));`,
  },
  {
    id: 'two-sum-hashmap',
    name: 'Two Sum (Hash Map)',
    description: 'Find two numbers that add up to a target using a hash map',
    complexity: 'O(n)',
    category: 'Linear',
    language: 'javascript',
    code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [-1, -1];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window Max Sum',
    description: 'Maximum sum subarray of fixed size k',
    complexity: 'O(n)',
    category: 'Linear',
    language: 'javascript',
    code: `function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

console.log(maxSubarraySum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4));`,
  },
  // O(n log n)
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    description: 'Divide-and-conquer sorting algorithm',
    complexity: 'O(n log n)',
    category: 'Linearithmic',
    language: 'javascript',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));`,
  },
  {
    id: 'sort-and-search',
    name: 'Sort & Binary Search',
    description: 'Sort array then perform binary search',
    complexity: 'O(n log n)',
    category: 'Linearithmic',
    language: 'javascript',
    code: `function sortAndFind(arr, target) {
  arr.sort((a, b) => a - b);
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}

console.log(sortAndFind([5, 2, 8, 1, 9], 8));`,
  },
  // O(n²)
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    description: 'Simple sorting with nested loops',
    complexity: 'O(n²)',
    category: 'Quadratic',
    language: 'javascript',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));`,
  },
  {
    id: 'two-sum-brute',
    name: 'Two Sum (Brute Force)',
    description: 'Find two numbers with nested loops',
    complexity: 'O(n²)',
    category: 'Quadratic',
    language: 'javascript',
    code: `function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [-1, -1];
}

console.log(twoSumBrute([2, 7, 11, 15], 9));`,
  },
  // O(2^n)
  {
    id: 'fibonacci-recursive',
    name: 'Fibonacci (Recursive)',
    description: 'Classic exponential recursive Fibonacci',
    complexity: 'O(2ⁿ)',
    category: 'Exponential',
    language: 'javascript',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
  },
  {
    id: 'subsets',
    name: 'Generate All Subsets',
    description: 'Generate all 2^n subsets of an array',
    complexity: 'O(2ⁿ)',
    category: 'Exponential',
    language: 'javascript',
    code: `function subsets(nums) {
  const result = [];
  function backtrack(start, current) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));`,
  },
  // O(n!)
  {
    id: 'permutations',
    name: 'Permutations',
    description: 'Generate all n! permutations of an array',
    complexity: 'O(n!)',
    category: 'Factorial',
    language: 'javascript',
    code: `function permutations(arr) {
  const result = [];
  function backtrack(current, remaining) {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      const next = remaining.filter((_, j) => j !== i);
      backtrack(current, next);
      current.pop();
    }
  }
  backtrack([], arr);
  return result;
}

console.log(permutations([1, 2, 3]));`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Constant: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Logarithmic: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Linear: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Linearithmic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Quadratic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Exponential: 'bg-red-500/10 text-red-400 border-red-500/20',
  Factorial: 'bg-red-500/10 text-red-500 border-red-500/20',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export default function SnippetTemplates({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  const filtered = TEMPLATES.filter((t) => {
    if (selectedCategory && t.category !== selectedCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.complexity.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            className="fixed inset-0 z-50 m-auto flex h-fit max-h-[80vh] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-0 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Code2 size={16} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Algorithm Templates
                  </h2>
                  <p className="text-[11px] text-text-tertiary">
                    {TEMPLATES.length} curated examples
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search & Filters */}
            <div className="border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2">
                <Search size={14} className="text-text-tertiary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
              </div>
              {/* Category pills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-tertiary hover:bg-surface-2 hover:text-text-secondary'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(cat === selectedCategory ? null : cat)
                    }
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      selectedCategory === cat
                        ? CATEGORY_COLORS[cat]
                        : 'border-transparent text-text-tertiary hover:bg-surface-2 hover:text-text-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-text-tertiary">No templates found</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.map((template, i) => (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        onSelect(template);
                        onClose();
                      }}
                      className="group rounded-xl border border-border bg-surface-1 p-4 text-left transition-all hover:border-accent/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent">
                            {template.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-text-tertiary">
                            {template.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="mt-0.5 text-text-tertiary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100"
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[template.category]}`}
                        >
                          {template.complexity}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {template.category}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { TEMPLATES };
