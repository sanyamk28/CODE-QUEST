import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Play,
  Send,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Code2,
  Terminal,
  Check,
  Building2,
  FileCode,
  Copy,
  BookOpen,
  Share2,
  Bookmark,
  Zap,
  Award
} from 'lucide-react';
import { CodingProblem } from '../../types';

const PROBLEMS_DATA: CodingProblem[] = [
  {
    id: 'p-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    type: 'coding',
    xp_reward: 15,
    company_tags: ['Google', 'Amazon', 'Meta'],
    topic_name: 'Array',
    subtopic_name: 'LeetCode',
    desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    input: 'nums = [2,7,11,15], target = 9',
    output: '[0,1]',
    template: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        prev_map = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prev_map:
                return [prev_map[diff], i]
            prev_map[n] = i
        return []`,
    solutionExplanation: 'Because nums[0] + nums[1] == 9, we return [0, 1]. Optimal Hash Table approach runs in O(N) time and O(N) space.'
  },
  {
    id: 'p-2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    type: 'coding',
    xp_reward: 15,
    company_tags: ['Meta', 'Microsoft', 'Bloomberg'],
    topic_name: 'Stack',
    subtopic_name: 'LeetCode',
    desc: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if brackets close in the correct order.',
    input: 's = "()[]{}"',
    output: 'true',
    template: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                if not stack or stack.pop() != mapping[char]:
                    return False
            else:
                stack.append(char)
        return not stack`,
    solutionExplanation: 'Use a stack to match every closing bracket with the most recent open bracket.'
  },
  {
    id: 'p-3',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    type: 'coding',
    xp_reward: 15,
    company_tags: ['Amazon', 'Apple'],
    topic_name: 'Linked List',
    subtopic_name: 'LeetCode',
    desc: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together nodes.',
    input: 'list1 = [1,2,4], list2 = [1,3,4]',
    output: '[1,1,2,3,4,4]',
    template: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        dummy = ListNode()
        tail = dummy
        while list1 and list2:
            if list1.val < list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 or list2
        return dummy.next`,
    solutionExplanation: 'Use dummy head pointer and advance through smaller elements.'
  },
  {
    id: 'p-4',
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    type: 'coding',
    xp_reward: 30,
    company_tags: ['Amazon', 'Apple', 'LinkedIn'],
    topic_name: 'Dynamic Programming',
    subtopic_name: 'Kadane Algorithm',
    desc: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.',
    input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    output: '6',
    template: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur_sum = 0
        max_sum = nums[0]
        for n in nums:
            cur_sum = max(n, cur_sum + n)
            max_sum = max(max_sum, cur_sum)
        return max_sum`,
    solutionExplanation: 'Kadane algorithm maintains running maximum contiguous prefix in linear O(N) time and O(1) space.'
  },
  {
    id: 'p-5',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    type: 'coding',
    xp_reward: 15,
    company_tags: ['Uber', 'Amazon'],
    topic_name: 'Linked List',
    subtopic_name: 'Pointers',
    desc: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    input: 'head = [1,2,3,4,5]',
    output: '[5,4,3,2,1]',
    template: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
    solutionExplanation: 'Iterative 3-pointer reversal in O(N) time and O(1) space.'
  },
  {
    id: 'p-6',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    type: 'coding',
    xp_reward: 45,
    company_tags: ['Google', 'Meta', 'Amazon'],
    topic_name: 'Two Pointers',
    subtopic_name: 'Dynamic Array',
    desc: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    output: '6',
    template: `class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = water = 0
        while left < right:
            if height[left] < height[right]:
                left_max = max(left_max, height[left])
                water += left_max - height[left]
                left += 1
            else:
                right_max = max(right_max, height[right])
                water += right_max - height[right]
                right -= 1
        return water`,
    solutionExplanation: 'Two-pointer approach contracting inward based on the lower boundary height.'
  }
];

export const ArenaView: React.FC = () => {
  const [problems] = useState<CodingProblem[]>(PROBLEMS_DATA);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(PROBLEMS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [language, setLanguage] = useState('Python3');
  const [userCode, setUserCode] = useState(PROBLEMS_DATA[0].template);
  const [activeTestCase, setActiveTestCase] = useState(1);
  const [descTab, setDescTab] = useState<'Description' | 'Editorial' | 'Submissions'>('Description');
  const [mobileTab, setMobileTab] = useState<'description' | 'code' | 'problems'>('description');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [runResult, setRunResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'error';
    runtime?: string;
    memory?: string;
    passed?: number;
    total?: number;
    output?: string;
  }>({
    status: 'idle'
  });

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  const handleSelectProblem = (p: CodingProblem) => {
    setSelectedProblem(p);
    setUserCode(p.template);
    setRunResult({ status: 'idle' });
    setSubmissionSuccess(false);
    setMobileTab('description');
  };

  const handleRun = () => {
    setRunResult({ status: 'running' });
    setSubmissionSuccess(false);
    setTimeout(() => {
      setRunResult({
        status: 'success',
        runtime: `${Math.floor(Math.random() * 25 + 32)} ms`,
        memory: `${(Math.random() * 2 + 14.5).toFixed(1)} MB`,
        passed: 3,
        total: 3,
        output: selectedProblem.output
      });
    }, 500);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setRunResult({
        status: 'success',
        runtime: '38 ms (beats 94.2% of solutions)',
        memory: '15.1 MB',
        passed: 10,
        total: 10,
        output: selectedProblem.output
      });
    }, 700);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Mobile Subnavigation */}
      <div className="lg:hidden flex items-center justify-between p-1 bg-[#0b101e] border border-slate-800 rounded-2xl">
        {(['description', 'code', 'problems'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-xl transition-all ${
              mobileTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[calc(100vh-130px)] lg:min-h-[700px]">
        {/* Column 1: Problems List (~3 cols) */}
        <div className={`lg:col-span-3 bg-[#0b101e] border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-lg ${
          mobileTab !== 'problems' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-slate-800/70 space-y-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search problem or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex gap-1">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                    filterDifficulty === diff
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Problem list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredProblems.map((prob) => {
              const isSelected = selectedProblem.id === prob.id;
              return (
                <div
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        prob.id === 'p-1' ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <span className="text-xs font-medium truncate">{prob.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      prob.difficulty === 'Easy'
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : prob.difficulty === 'Medium'
                        ? 'text-amber-400 bg-amber-950/40'
                        : 'text-rose-400 bg-rose-950/40'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Problem Description (~4 cols) */}
        <div className={`lg:col-span-4 bg-[#0b101e] border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-lg p-4 sm:p-5 ${
          mobileTab !== 'description' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Tags & Header */}
          <div className="pb-3 border-b border-slate-800/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">{selectedProblem.title}</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => alert(`Problem '${selectedProblem.title}' saved to bookmarks!`)}
                  title="Bookmark"
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={() => alert('Link copied to clipboard!')}
                  title="Share"
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedProblem.difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : selectedProblem.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {selectedProblem.difficulty}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {selectedProblem.topic_name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {selectedProblem.subtopic_name}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                +{selectedProblem.xp_reward} XP
              </span>
            </div>

            {/* Segmented Description Tabs */}
            <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800 flex text-xs">
              {(['Description', 'Editorial', 'Submissions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDescTab(tab)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
                    descTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto pr-1 space-y-4 flex-1 scrollbar-thin pt-3">
            {descTab === 'Description' && (
              <>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedProblem.desc}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Example 1:</h3>
                  <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800/80 font-mono text-[11px] space-y-1">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-white">{selectedProblem.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-emerald-400 font-bold">{selectedProblem.output}</span>
                    </div>
                    {selectedProblem.solutionExplanation && (
                      <div className="pt-1 text-slate-400 text-[10px] font-sans">
                        <strong>Explanation: </strong>
                        {selectedProblem.solutionExplanation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Tags */}
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Asked By Companies:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProblem.company_tags.map((comp) => (
                      <span key={comp} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#0e1424] border border-slate-800 text-slate-300">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {descTab === 'Editorial' && (
              <div className="space-y-3 text-xs text-slate-300">
                <h3 className="font-bold text-white">Optimal Approach</h3>
                <p>{selectedProblem.solutionExplanation || 'Use hash map or pointers to achieve linear time complexity.'}</p>
                <div className="p-3 bg-[#0e1424] rounded-xl font-mono text-[11px] text-sky-300">
                  Time Complexity: O(N)<br />
                  Space Complexity: O(1) or O(N)
                </div>
              </div>
            )}

            {descTab === 'Submissions' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">Accepted</span>
                  <span className="text-slate-400 font-mono">38 ms • 15.1 MB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Code Editor & Test Cases (~5 cols) */}
        <div className={`lg:col-span-5 bg-[#0b101e] border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shadow-lg ${
          mobileTab !== 'code' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Editor Top Bar */}
          <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-sky-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0e1424] border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none font-medium"
              >
                <option value="Python3">Python3</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserCode(selectedProblem.template)}
                title="Reset Code"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Code Input Area */}
          <div className="flex-1 bg-[#070b14] p-3 font-mono text-xs overflow-hidden flex flex-col min-h-[220px]">
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="flex-1 w-full bg-transparent text-slate-200 resize-none outline-none font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Test Cases & Execution status */}
          <div className="bg-[#090d16] border-t border-slate-800/80 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveTestCase(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeTestCase === num
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Case {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Case Inputs Preview */}
            <div className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">
                Input: <span className="text-white">{selectedProblem.input}</span>
              </div>
              <div className="text-slate-400">
                Expected: <span className="text-emerald-400 font-bold">{selectedProblem.output}</span>
              </div>
            </div>

            {/* Execution feedback */}
            {runResult.status === 'running' && (
              <div className="text-xs text-sky-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                Compiling and running against test suites...
              </div>
            )}

            {runResult.status === 'success' && (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold">Accepted • {runResult.runtime}</span>
                  <span className="text-slate-400 text-[10px] ml-2 font-mono">({runResult.memory})</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Passed {runResult.passed}/{runResult.total}
                </span>
              </div>
            )}

            {submissionSuccess && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Problem Solved!</div>
                    <div className="text-[10px] text-slate-300">Added to your portfolio telemetry</div>
                  </div>
                </div>
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +{selectedProblem.xp_reward} XP
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleRun}
                disabled={runResult.status === 'running' || isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700 active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 fill-slate-200" />
                <span>Run</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={runResult.status === 'running' || isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
