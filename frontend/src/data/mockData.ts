export const INITIAL_CODING_PROBLEMS = [
  {
    id: "p-1",
    title: "Two Sum",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 15,
    company_tags: ["Google", "Amazon", "Meta"],
    topic_name: "Arrays & Strings",
    subtopic_name: "Two Pointers",
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    template: `import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test execution:
print(two_sum([2, 7, 11, 15], 9))`
  },
  {
    id: "p-2",
    title: "Contains Duplicate",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 10,
    company_tags: ["Apple", "Microsoft"],
    topic_name: "Arrays & Strings",
    subtopic_name: "Hashing",
    desc: "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.",
    input: "nums = [1,2,3,1]",
    output: "true",
    template: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))

print(str(contains_duplicate([1, 2, 3, 1])).lower())`
  },
  {
    id: "p-3",
    title: "Reverse Linked List",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 15,
    company_tags: ["Amazon", "Uber"],
    topic_name: "Linked Lists",
    subtopic_name: "Pointers",
    desc: "Given the head of a singly linked list, reverse the list, and return the reversed list head.",
    input: "head = [1,2,3,4,5]",
    output: "[5,4,3,2,1]",
    template: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

print("[5,4,3,2,1]")`
  }
];

export const INITIAL_SQL_PROBLEMS = [
  {
    id: "sql-1",
    title: "Department Top Three Salaries",
    difficulty: "Medium",
    company_tags: ["Google", "Meta"],
    schema: "Employee (id, name, salary, departmentId)\nDepartment (id, name)",
    desc: "Find the employees who are high earners in each department. A high earner earns a salary in the top three unique salaries for that department.",
    defaultQuery: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e JOIN Department d ON e.departmentId = d.id
WHERE 3 > (
  SELECT COUNT(DISTINCT e2.salary) 
  FROM Employee e2 
  WHERE e2.salary > e.salary AND e2.departmentId = e.departmentId
);`
  },
  {
    id: "sql-2",
    title: "Combine Two Tables",
    difficulty: "Easy",
    company_tags: ["Amazon", "Microsoft"],
    schema: "Person (personId, lastName, firstName)\nAddress (addressId, personId, city, state)",
    desc: "Report the first name, last name, city, and state of each person in the Person table. If no address exists, report null.",
    defaultQuery: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p LEFT JOIN Address a ON p.personId = a.personId;`
  }
];

export { INITIAL_MCQS, MCQ_BANK, LANGUAGE_TRACKS } from './mcqBank';


export const INITIAL_PUZZLES = [
  {
    id: "puz-1",
    title: "3 Bulbs and 3 Switches",
    difficulty: "Medium",
    category: "Logical Deduction",
    desc: "There are three switches downstairs, each controlling one of three light bulbs upstairs. You can make only one trip upstairs. How do you find which switch controls which bulb?",
    hints: [
      "Light bulbs generate both light AND thermal heat over time.",
      "Turn one switch ON for 10 minutes, turn it OFF, and turn the second switch ON before going upstairs."
    ],
    solution: "Turn Switch 1 ON for 10 minutes, then turn it OFF. Turn Switch 2 ON and immediately walk upstairs. The LIT bulb is Switch 2. The WARM/OFF bulb is Switch 1. The COLD/OFF bulb is Switch 3."
  },
  {
    id: "puz-2",
    title: "Measure Exactly 4 Liters",
    difficulty: "Medium",
    category: "Mathematical Reasoning",
    desc: "You have an unmarked 3-liter jug and an unmarked 5-liter jug with unlimited water. How can you measure exactly 4 liters?",
    hints: [
      "Fill the 5L jug and pour into the 3L jug to leave 2L.",
      "Transfer the 2L into the empty 3L jug, fill the 5L jug, and top off the 3L jug."
    ],
    solution: "Fill 5L jug. Pour into 3L jug until full (2L remains in 5L). Empty 3L jug. Transfer 2L into 3L jug. Fill 5L jug completely. Pour from 5L into 3L until full (transfers exactly 1L). Exactly 4L remains in the 5L jug!"
  }
];

export const AVAILABLE_SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", "SQL",
  "PostgreSQL", "React", "Node.js", "Docker", "Kubernetes", "AWS",
  "Git & GitHub", "System Design", "Data Structures (DSA)", "Linux / Bash"
];

export const TARGET_COMPANIES_LIST = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "TCS", "Infosys", "Uber", "Netflix", "Startup"
];

export const INITIAL_STUDENTS_LIST = [
  {
    id: "s-101",
    email: "alex.chen@codequest.dev",
    name: "Alex Chen",
    college: "National Institute of Technology",
    degree: "B.Tech Computer Science",
    target_role: "Software Engineer",
    xp: 540,
    readiness_score: 78.5,
    is_active: true,
    created_at: "2026-08-28T10:15:00Z",
    dsa_level: 75.0,
    sql_level: 80.0,
    cs_fundamentals_level: 70.0,
    aptitude_level: 85.0,
    submissions: [
      { id: "sub-1", question_title: "Two Sum", type: "coding", score: 25, is_correct: true, created_at: "2026-08-31T14:20:00Z" },
      { id: "sub-2", question_title: "Department Top Three Salaries", type: "sql", score: 20, is_correct: true, created_at: "2026-08-31T15:10:00Z" }
    ],
    logins: [
      { id: "l-1", login_time: "2026-08-31T19:00:00Z", ip_address: "127.0.0.1", auth_provider: "local", device_info: "Chrome 128 (Windows 11)" }
    ]
  },
  {
    id: "s-102",
    email: "priya.patel@iitb.ac.in",
    name: "Priya Patel",
    college: "IIT Bombay",
    degree: "B.Tech CSE",
    target_role: "Data Engineer",
    xp: 890,
    readiness_score: 88.0,
    is_active: true,
    created_at: "2026-08-27T09:30:00Z",
    dsa_level: 85.0,
    sql_level: 95.0,
    cs_fundamentals_level: 80.0,
    aptitude_level: 90.0,
    submissions: [
      { id: "sub-3", question_title: "Combine Two Tables", type: "sql", score: 20, is_correct: true, created_at: "2026-08-31T11:05:00Z" }
    ],
    logins: [
      { id: "l-2", login_time: "2026-08-31T18:45:00Z", ip_address: "192.168.1.45", auth_provider: "local", device_info: "Mac Safari" }
    ]
  },
  {
    id: "s-103",
    email: "rohan.sharma@bits.edu",
    name: "Rohan Sharma",
    college: "BITS Pilani",
    degree: "B.E. Electronics",
    target_role: "DevOps & Cloud Engineer",
    xp: 420,
    readiness_score: 64.0,
    is_active: false,
    created_at: "2026-08-25T14:10:00Z",
    dsa_level: 55.0,
    sql_level: 60.0,
    cs_fundamentals_level: 75.0,
    aptitude_level: 65.0,
    submissions: [],
    logins: [
      { id: "l-3", login_time: "2026-08-30T12:00:00Z", ip_address: "10.0.0.12", auth_provider: "local", device_info: "Linux Firefox" }
    ]
  }
];
