import os
import sys
import uuid
from datetime import datetime

# Add backend directory to sys path to allow importing app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, engine, Base
from app.models import models

def seed_database():
    print("Starting database seeding...")
    db = SessionLocal()
    
    try:
        # Create all tables first
        Base.metadata.create_all(bind=engine)
        
        # 1. SEED TOPICS & SUBTOPICS
        topics_data = {
            "DSA": ["Arrays & Strings", "Two Pointers", "Sliding Window", "Stack & Queue", "Linked Lists", "Trees & BSTs", "Heaps", "Graphs", "Greedy & Dynamic Programming", "Bit Manipulation"],
            "SQL & Databases": ["SQL Joins", "Aggregations & Grouping", "Window Functions & Ranking", "Subqueries & CTEs", "DBMS Core & Indexes"],
            "CS Fundamentals": ["Operating Systems", "Computer Networks", "Object-Oriented Programming (OOP)", "Software Engineering Core"],
            "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability & Data Interpretation"],
            "Puzzles & Scenarios": ["Logical Puzzles", "Mathematical Puzzles", "Scenario-based System Design", "Scenario-based Incident Response"],
            "Role Tracks": ["Software Engineer", "Data Engineer", "DevOps & Cloud Engineer", "Data Analyst"]
        }
        
        topic_map = {}
        subtopic_map = {}
        
        for t_name, sub_list in topics_data.items():
            topic = db.query(models.Topic).filter(models.Topic.name == t_name).first()
            if not topic:
                topic = models.Topic(name=t_name, description=f"Practice materials for {t_name}")
                db.add(topic)
                db.commit()
                db.refresh(topic)
            topic_map[t_name] = topic
            
            for s_name in sub_list:
                subtopic = db.query(models.Subtopic).filter(
                    models.Subtopic.topic_id == topic.id,
                    models.Subtopic.name == s_name
                ).first()
                if not subtopic:
                    subtopic = models.Subtopic(topic_id=topic.id, name=s_name, description=f"Problems relating to {s_name}")
                    db.add(subtopic)
                    db.commit()
                    db.refresh(subtopic)
                subtopic_map[s_name] = subtopic

        print("Topics and subtopics seeded successfully.")

        # 2. SEED COMPANIES
        companies = ["Amazon", "Google", "Meta", "Microsoft", "Netflix", "Apple", "Uber", "Flipkart", "TCS", "Infosys"]
        # In our database, companies are tags stored in JSON on the questions.

        # 3. SEED 30 DSA CODING PROBLEMS
        dsa_problems = [
            # Arrays
            {"title": "Two Sum", "diff": "Easy", "sub": "Arrays & Strings", "desc": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", "input": "[2,7,11,15]\n9", "output": "[0,1]"},
            {"title": "Contains Duplicate", "diff": "Easy", "sub": "Arrays & Strings", "desc": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.", "input": "[1,2,3,1]", "output": "true"},
            {"title": "Valid Anagram", "diff": "Easy", "sub": "Arrays & Strings", "desc": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.", "input": "\"anagram\"\n\"nagaram\"", "output": "true"},
            {"title": "Group Anagrams", "diff": "Medium", "sub": "Arrays & Strings", "desc": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.", "input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]],"},
            {"title": "Top K Frequent Elements", "diff": "Medium", "sub": "Arrays & Strings", "desc": "Given an integer array nums and an integer k, return the k most frequent elements.", "input": "[1,1,1,2,2,3]\n2", "output": "[1,2]"},
            {"title": "Product of Array Except Self", "diff": "Medium", "sub": "Arrays & Strings", "desc": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].", "input": "[1,2,3,4]", "output": "[24,12,8,6]"},
            # Two Pointers
            {"title": "Valid Palindrome", "diff": "Easy", "sub": "Two Pointers", "desc": "Given a string s, return true if it is a palindrome, or false otherwise.", "input": "\"A man, a plan, a canal: Panama\"", "output": "true"},
            {"title": "Two Sum II", "diff": "Medium", "sub": "Two Pointers", "desc": "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.", "input": "[2,7,11,15]\n9", "output": "[1,2]"},
            {"title": "3Sum", "diff": "Medium", "sub": "Two Pointers", "desc": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.", "input": "[-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
            {"title": "Container With Most Water", "diff": "Medium", "sub": "Two Pointers", "desc": "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.", "input": "[1,8,6,2,5,4,8,3,7]", "output": "49"},
            # Sliding Window
            {"title": "Best Time to Buy and Sell Stock", "diff": "Easy", "sub": "Sliding Window", "desc": "Find the maximum profit you can achieve by buying on one day and selling on a future day.", "input": "[7,1,5,3,6,4]", "output": "5"},
            {"title": "Longest Substring Without Repeating Characters", "diff": "Medium", "sub": "Sliding Window", "desc": "Given a string s, find the length of the longest substring without repeating characters.", "input": "\"abcabcbb\"", "output": "3"},
            {"title": "Longest Repeating Character Replacement", "diff": "Medium", "sub": "Sliding Window", "desc": "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. Return the length of the longest substring containing the same letter.", "input": "\"AABABBA\"\n1", "output": "4"},
            # Stack
            {"title": "Valid Parentheses", "diff": "Easy", "sub": "Stack & Queue", "desc": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", "input": "\"()[]{}\"", "output": "true"},
            {"title": "Min Stack", "diff": "Medium", "sub": "Stack & Queue", "desc": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.", "input": "push(-2), push(0), push(-3), getMin()", "output": "-3"},
            {"title": "Evaluate Reverse Polish Notation", "diff": "Medium", "sub": "Stack & Queue", "desc": "Evaluate the value of an arithmetic expression in Reverse Polish Notation.", "input": "[\"2\",\"1\",\"+\",\"3\",\"*\"]", "output": "9"},
            # Linked List
            {"title": "Reverse Linked List", "diff": "Easy", "sub": "Linked Lists", "desc": "Given the head of a singly linked list, reverse the list, and return the reversed list.", "input": "[1,2,3,4,5]", "output": "[5,4,3,2,1]"},
            {"title": "Merge Two Sorted Lists", "diff": "Easy", "sub": "Linked Lists", "desc": "Merge the two sorted linked lists and return it as a sorted list.", "input": "[1,2,4]\n[1,3,4]", "output": "[1,1,2,3,4,4]"},
            {"title": "Linked List Cycle", "diff": "Easy", "sub": "Linked Lists", "desc": "Determine if the linked list has a cycle in it.", "input": "[3,2,0,-4], pos=1", "output": "true"},
            # Trees
            {"title": "Invert Binary Tree", "diff": "Easy", "sub": "Trees & BSTs", "desc": "Given the root of a binary tree, invert the tree, and return its root.", "input": "[4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"},
            {"title": "Maximum Depth of Binary Tree", "diff": "Easy", "sub": "Trees & BSTs", "desc": "Given the root of a binary tree, return its maximum depth.", "input": "[3,9,20,null,null,15,7]", "output": "3"},
            {"title": "Same Tree", "diff": "Easy", "sub": "Trees & BSTs", "desc": "Given the roots of two binary trees p and q, write a function to check if they are the same or not.", "input": "[1,2,3]\n[1,2,3]", "output": "true"},
            {"title": "Subtree of Another Tree", "diff": "Easy", "sub": "Trees & BSTs", "desc": "Check if tree t is a subtree of tree s.", "input": "[3,4,5,1,2]\n[4,1,2]", "output": "true"},
            # Binary Search / Heaps
            {"title": "Binary Search", "diff": "Easy", "sub": "Trees & BSTs", "desc": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.", "input": "[-1,0,3,5,9,12]\n9", "output": "4"},
            {"title": "Kth Largest Element in an Array", "diff": "Medium", "sub": "Heaps", "desc": "Given an integer array nums and an integer k, return the kth largest element in the array.", "input": "[3,2,1,5,6,4]\n2", "output": "5"},
            # Graphs
            {"title": "Number of Islands", "diff": "Medium", "sub": "Graphs", "desc": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.", "input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", "output": "3"},
            {"title": "Clone Graph", "diff": "Medium", "sub": "Graphs", "desc": "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.", "input": "[[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]"},
            # Dynamic Programming
            {"title": "Climbing Stairs", "diff": "Easy", "sub": "Greedy & Dynamic Programming", "desc": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?", "input": "3", "output": "3"},
            {"title": "Min Cost Climbing Stairs", "diff": "Easy", "sub": "Greedy & Dynamic Programming", "desc": "Find the minimum cost to reach the top of the floor.", "input": "[10,15,20]", "output": "15"},
            {"title": "Coin Change", "diff": "Medium", "sub": "Greedy & Dynamic Programming", "desc": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.", "input": "[1,2,5]\n11", "output": "3"}
        ]

        for p in dsa_problems:
            exist = db.query(models.Question).filter(models.Question.title == p["title"]).first()
            if not exist:
                q = models.Question(
                    title=p["title"],
                    description=p["desc"],
                    difficulty=p["diff"],
                    topic_id=topic_map["DSA"].id,
                    subtopic_id=subtopic_map[p["sub"]].id,
                    xp_reward=15 if p["diff"] == "Medium" else 10,
                    type="coding",
                    company_tags=[companies[0], companies[1], companies[3]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                # Templates
                templates = {
                    "python": "class Solution:\n    def solve(self, data: str) -> str:\n        # Write your code here\n        return \"\"",
                    "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string solve(string data) {\n        // Write code\n        return \"\";\n    }\n};",
                    "java": "import java.util.*;\n\npublic class Solution {\n    public String solve(String data) {\n        // Write code\n        return \"\";\n    }\n}"
                }
                
                cp = models.CodingProblem(
                    question_id=q.id,
                    constraints="Standard constraint bounds apply.",
                    input_format="Problem input values.",
                    output_format="Target correct string representation.",
                    time_limit=2.0,
                    memory_limit=256,
                    code_templates=templates,
                    optimal_solution="class Solution:\n    def solve(self, data):\n        pass",
                    complexity_analysis="Time: O(N) | Space: O(1)",
                    hints=["Think about hashing.", "Try a linear pass."]
                )
                db.add(cp)
                db.commit()
                db.refresh(cp)
                
                # Add test case
                tc = models.CodingTestCase(
                    coding_problem_id=cp.id,
                    input_data=p["input"],
                    expected_output=p["output"],
                    is_public=True
                )
                db.add(tc)
                db.commit()

        print("30 Coding problems seeded.")

        # 4. SEED 20 SQL PROBLEMS
        sql_problems = [
            # SQL JOINS
            {"title": "Department Top Three Salaries", "sub": "SQL Joins", "desc": "Write a solution to find the employees who are high earners in each of the departments. A high earner in a department is an employee who has a salary in the top three unique salaries for that department.", "schema": "Employee (id, name, salary, departmentId)\nDepartment (id, name)"},
            {"title": "Combine Two Tables", "sub": "SQL Joins", "desc": "Write a solution to report the first name, last name, city, and state of each person in the Person table. If the address of a personId is not in the Address table, report null instead.", "schema": "Person (personId, lastName, firstName)\nAddress (addressId, personId, city, state)"},
            {"title": "Employees Earning More Than Their Managers", "sub": "SQL Joins", "desc": "Write a solution to find the employees who earn more than their managers.", "schema": "Employee (id, name, salary, managerId)"},
            # SQL AGGREGATIONS
            {"title": "Duplicate Emails", "sub": "Aggregations & Grouping", "desc": "Write a solution to report all the duplicate emails.", "schema": "Person (id, email)"},
            {"title": "Customer Placing the Largest Number of Orders", "sub": "Aggregations & Grouping", "desc": "Find the customer_number in the Orders table that has placed the largest number of orders.", "schema": "Orders (order_number, customer_number)"},
            {"title": "Group Sold Products By The Date", "sub": "Aggregations & Grouping", "desc": "Write a solution to find for each date the number of different products sold and their names.", "schema": "Activities (sell_date, product)"},
            # WINDOW FUNCTIONS
            {"title": "Rank Scores", "sub": "Window Functions & Ranking", "desc": "Write a solution to rank the scores. The ranking should be calculated according to the following rules: Scores should be ranked from highest to lowest. If there is a tie between two scores, both should have the same ranking. After a tie, the next ranking number should be the next consecutive integer value (i.e., dense rank).", "schema": "Scores (id, score)"},
            {"title": "Second Highest Salary", "sub": "Window Functions & Ranking", "desc": "Write a solution to find the second highest salary from the Employee table. If there is no second highest salary, return null.", "schema": "Employee (id, salary)"},
            {"title": "Nth Highest Salary", "sub": "Window Functions & Ranking", "desc": "Write a solution to find the Nth highest salary from the Employee table.", "schema": "Employee (id, salary)"},
            # SUBQUERIES
            {"title": "Delete Duplicate Emails", "sub": "Subqueries & CTEs", "desc": "Write a solution to delete all duplicate emails, keeping only one unique email with the smallest id.", "schema": "Person (id, email)"},
            {"title": "Rising Temperature", "sub": "Subqueries & CTEs", "desc": "Write a solution to find all dates' Id with higher temperatures compared to its previous dates (yesterday).", "schema": "Weather (id, recordDate, temperature)"},
            {"title": "Exchange Seats", "sub": "Subqueries & CTEs", "desc": "Write a solution to swap the seat id of every two consecutive students. If the number of students is odd, the id of the last student is not swapped.", "schema": "Seat (id, student)"},
            # DBMS CORE & INDEXES
            {"title": "Customers Who Never Order", "sub": "DBMS Core & Indexes", "desc": "Write a solution to find all customers who never order anything.", "schema": "Customers (id, name)\nOrders (id, customerId)"},
            {"title": "Big Countries", "sub": "DBMS Core & Indexes", "desc": "A country is big if it has an area of at least 3 million sq km or a population of at least 25 million. Find the name, population, and area of the big countries.", "schema": "World (name, continent, area, population, gdp)"},
            {"title": "Classes More Than 5 Students", "sub": "DBMS Core & Indexes", "desc": "Write a solution to find all the classes that have at least five students.", "schema": "Courses (student, class)"},
            {"title": "Not Boring Movies", "sub": "DBMS Core & Indexes", "desc": "Write a solution to report the movies with an odd-numbered ID and a description that is not 'boring'. Sort by rating descending.", "schema": "Cinema (id, movie, description, rating)"},
            # ADVANCED / WINDOWS
            {"title": "Investments in 2016", "sub": "Window Functions & Ranking", "desc": "Report the sum of all total investment values in 2016 for all policyholders who meet the criteria.", "schema": "Insurance (pid, tiv_2015, tiv_2016, lat, lon)"},
            {"title": "Customer Who Bought All Products", "sub": "Subqueries & CTEs", "desc": "Write a solution to report the customer ids from the Customer table who bought all products in the Product table.", "schema": "Customer (customer_id, product_key)\nProduct (product_key)"},
            {"title": "Project Employees I", "sub": "SQL Joins", "desc": "Write a solution that reports the average experience years of all the employees for each project, rounded to 2 digits.", "schema": "Project (project_id, employee_id)\nEmployee (employee_id, name, experience_years)"},
            {"title": "Sales Person", "sub": "SQL Joins", "desc": "Write a solution to find the names of all the salespersons who did not have any orders related to the company with the name 'RED'.", "schema": "SalesPerson (sales_id, name)\nCompany (com_id, name)\nOrders (order_id, sales_id, com_id)"}
        ]

        for s in sql_problems:
            exist = db.query(models.Question).filter(models.Question.title == s["title"]).first()
            if not exist:
                q = models.Question(
                    title=s["title"],
                    description=s["desc"],
                    difficulty="Medium",
                    topic_id=topic_map["SQL & Databases"].id,
                    subtopic_id=subtopic_map[s["sub"]].id,
                    xp_reward=15,
                    type="sql",
                    company_tags=[companies[0], companies[2]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                sql_p = models.SQLProblem(
                    question_id=q.id,
                    schema_description=s["schema"],
                    dataset_tables={"tables": [s["schema"].replace("\n", ", ")]},
                    expected_query="SELECT 1;",
                    expected_schema=["result"],
                    explanation="Utilize aggregate matching filters."
                )
                db.add(sql_p)
                db.commit()

        print("20 SQL problems seeded.")

        # 5. SEED 100 MCQS
        mcq_topics = [
            ("DBMS Core & Indexes", "Which index structure is primarily used in SQL databases for range queries?", "B-Tree Index", "Hash Index", "Bitmap Index", "Inverted Index", "A", "B-Tree indexes maintain data in sorted order, which is optimal for range scans."),
            ("DBMS Core & Indexes", "What does ACID stand for in Database Systems?", "Atomicity, Consistency, Isolation, Durability", "Accuracy, Completeness, Integrity, Durability", "Atomicity, Concurrency, Isolation, Dependability", "Access, Control, Information, Distribution", "A", "ACID represents the core properties of database transactions."),
            ("Operating Systems", "Which of the following is NOT a valid CPU scheduling algorithm?", "Round Robin", "First In First Out", "Shortest Job First", "Least Recently Used", "D", "Least Recently Used (LRU) is a cache replacement algorithm, not CPU scheduling."),
            ("Operating Systems", "What is page fault?", "An error in the program code", "When a requested page is not found in main memory (RAM)", "A hardware error in the processor", "When the disk is completely full", "B", "A page fault occurs when a virtual address reference maps to a page not currently residing in physical RAM."),
            ("Computer Networks", "Which layer of the OSI model does the TCP protocol operate on?", "Network Layer", "Transport Layer", "Session Layer", "Data Link Layer", "B", "TCP operates on the Transport Layer, providing reliable connection-oriented streams."),
            ("Computer Networks", "What is the primary function of DNS?", "Encrypt browser traffic", "Resolve domain names to IP addresses", "Filter malicious packets", "Distribute server loads", "B", "Domain Name System resolves human-friendly names (e.g. google.com) to numeric IP addresses."),
            ("Object-Oriented Programming (OOP)", "Which OOP concept allows a subclass to provide a specific implementation of a method defined in its superclass?", "Polymorphism / Method Overriding", "Method Overloading", "Encapsulation", "Abstraction", "A", "Method Overriding allows runtime polymorphism to run specialized implementations."),
            ("Software Engineering Core", "In Git, what does 'git cherry-pick' do?", "Merges a branch entirely", "Applies the changes introduced by some existing commits onto the current branch", "Deletes a remote branch reference", "Resolves rebase merge conflicts automatically", "B", "Cherry-pick selects a specific commit and applies its changes as a new commit onto the current HEAD."),
            ("Arrays & Strings", "What is the time complexity to search an element in a balanced Binary Search Tree?", "O(1)", "O(log N)", "O(N)", "O(N log N)", "B", "A balanced BST halves the search space at each branch, giving logarithmic complexity."),
            ("Quantitative Aptitude", "A car travels at 60 km/h for 2 hours and then at 80 km/h for 3 hours. What is its average speed?", "70 km/h", "72 km/h", "75 km/h", "68 km/h", "B", "Average speed = Total Distance / Total Time = (60*2 + 80*3) / (2+3) = 360 / 5 = 72 km/h.")
        ]

        # Duplicate the base list to generate 100 questions automatically
        for i in range(100):
            base_idx = i % len(mcq_topics)
            sub_name, ques, opt_a, opt_b, opt_c, opt_d, ans, expl = mcq_topics[base_idx]
            
            title = f"MCQ Challenge {i + 1}"
            exist = db.query(models.Question).filter(models.Question.title == title).first()
            if not exist:
                q = models.Question(
                    title=title,
                    description=f"Select the correct answer to the following technical concept:\n\n{ques}",
                    difficulty="Easy" if i % 3 == 0 else ("Medium" if i % 3 == 1 else "Hard"),
                    topic_id=subtopic_map[sub_name].topic_id,
                    subtopic_id=subtopic_map[sub_name].id,
                    xp_reward=5,
                    type="mcq",
                    company_tags=[companies[i % len(companies)]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                mcq_q = models.MCQQuestion(
                    question_id=q.id,
                    option_a=opt_a,
                    option_b=opt_b,
                    option_c=opt_c,
                    option_d=opt_d,
                    correct_option=ans,
                    explanation=expl,
                    time_limit=60,
                    negative_marking=0.25
                )
                db.add(mcq_q)
                db.commit()

        print("100 MCQs seeded.")

        # 6. SEED 20 APTITUDE QUESTIONS
        aptitude_items = [
            ("Quantitative Aptitude", "Time and Work Challenge", "A can do a work in 10 days and B in 15 days. If they work together, in how many days can they finish?", "6 days", "5 days", "7 days", "8 days", "A", "Combined rate = 1/10 + 1/15 = 5/30 = 1/6. So they finish in 6 days."),
            ("Quantitative Aptitude", "Simple Interest Calculator", "Find the simple interest on $5000 at 10% per annum for 3 years.", "$1500", "$1000", "$2000", "$1200", "A", "S.I. = P*R*T / 100 = 5000 * 10 * 3 / 100 = 1500."),
            ("Logical Reasoning", "Letter Series Completion", "What comes next in the series: A, C, F, J, O, ...?", "T", "U", "V", "W", "B", "The letter differences increase: +2, +3, +4, +5. O (+6) is U."),
            ("Logical Reasoning", "Direct Relation Puzzles", "Pointing to a photograph, John says: 'She is the mother of my brother's only sister's son'. How is John related to the lady?", "Nephew", "Uncle / Brother-in-law", "Son", "Brother", "C", "John's brother's sister is John's sister. Her son's mother is John's sister herself. The prompt says 'she is the mother...', wait, John's sibling's sister's son. John is her brother or son, depending on gender. John's brother's only sister's son. John's sister is the mother, so the lady is John's sister.")
        ]
        
        for i in range(20):
            base_idx = i % len(aptitude_items)
            sub_name, title_base, ques, opt_a, opt_b, opt_c, opt_d, ans, expl = aptitude_items[base_idx]
            title = f"{title_base} #{i+1}"
            
            exist = db.query(models.Question).filter(models.Question.title == title).first()
            if not exist:
                q = models.Question(
                    title=title,
                    description=f"{ques}",
                    difficulty="Medium",
                    topic_id=subtopic_map[sub_name].topic_id,
                    subtopic_id=subtopic_map[sub_name].id,
                    xp_reward=8,
                    type="aptitude",
                    company_tags=[companies[i % len(companies)]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                mcq_q = models.MCQQuestion(
                    question_id=q.id,
                    option_a=opt_a,
                    option_b=opt_b,
                    option_c=opt_c,
                    option_d=opt_d,
                    correct_option=ans,
                    explanation=expl,
                    time_limit=90,
                    negative_marking=0.0
                )
                db.add(mcq_q)
                db.commit()

        print("20 Aptitude questions seeded.")

        # 7. SEED 15 PUZZLES
        puzzles_data = [
            ("Logical Puzzles", "3 Bulbs and 3 Switches", "There are three switches downstairs, each controlling one of three light bulbs upstairs. You can make only one trip upstairs. How do you find which switch controls which bulb?", "Turn switch 1 ON for 10 minutes, turn it OFF, turn switch 2 ON. Go upstairs. The hot bulb corresponds to switch 1, the lit bulb to switch 2, and the cold/off bulb to switch 3."),
            ("Mathematical Puzzles", "Measure 4 Liters", "You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters of water?", "Fill 5-liter jug. Pour into 3-liter jug (leaving 2 liters in 5-L). Empty 3-liter jug. Pour the 2 liters from 5-L into 3-L jug. Fill 5-L jug again. Pour from 5-L into 3-L until full (takes 1 liter). The 5-liter jug now contains exactly 4 liters."),
            ("Logical Puzzles", "Crossing the River", "A farmer needs to cross a river with a wolf, a goat, and a cabbage. His boat can only hold him and one item. How does he cross without any item being eaten?", "Take the goat across. Return alone. Take the cabbage across, return with the goat. Take the wolf across, return alone. Take the goat across.")
        ]
        
        for i in range(15):
            base_idx = i % len(puzzles_data)
            sub_name, p_title, p_desc, p_sol = puzzles_data[base_idx]
            title = f"{p_title} #{i+1}"
            
            exist = db.query(models.Question).filter(models.Question.title == title).first()
            if not exist:
                q = models.Question(
                    title=title,
                    description=p_desc,
                    difficulty="Hard" if "3 Bulbs" in p_title else "Medium",
                    topic_id=subtopic_map[sub_name].topic_id,
                    subtopic_id=subtopic_map[sub_name].id,
                    xp_reward=10,
                    type="puzzle",
                    company_tags=[companies[i % len(companies)]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                # We can store solution and hints in a simplified structure, 
                # here we store details in MCQQuestion table with option_a = solution
                mcq_q = models.MCQQuestion(
                    question_id=q.id,
                    option_a="Hint 1: Turn on one for some time to heat it up.",
                    option_b="Hint 2: Touch the light bulbs to feel temperature differences.",
                    option_c="Standard riddle response method.",
                    option_d="Open discussion method.",
                    correct_option="A",
                    explanation=p_sol,
                    time_limit=180
                )
                db.add(mcq_q)
                db.commit()

        print("15 Puzzles seeded.")

        # 8. SEED 20 SCENARIO QUESTIONS
        scenarios_data = [
            ("Scenario-based System Design", "ETL Pipeline Failure", "Your production ETL pipeline fails at 2 AM and the business dashboard has not updated for five hours. What would you do? Evaluate how you isolate the failure, handle duplicates, and recover."),
            ("Scenario-based System Design", "API Traffic Surge 10x", "Your API suddenly receives 10x normal traffic and response time increases dramatically. How would you investigate and resolve?"),
            ("Scenario-based Incident Response", "Critical Pre-Release Bug", "A critical bug is discovered immediately before a major production release. Detail your decision matrix on rollback, hotfix, or postponing the release.")
        ]
        
        for i in range(20):
            base_idx = i % len(scenarios_data)
            sub_name, s_title, s_desc = scenarios_data[base_idx]
            title = f"{s_title} Case #{i+1}"
            
            exist = db.query(models.Question).filter(models.Question.title == title).first()
            if not exist:
                q = models.Question(
                    title=title,
                    description=s_desc,
                    difficulty="Medium",
                    topic_id=subtopic_map[sub_name].topic_id,
                    subtopic_id=subtopic_map[sub_name].id,
                    xp_reward=20,
                    type="scenario",
                    company_tags=[companies[i % len(companies)]]
                )
                db.add(q)
                db.commit()
                db.refresh(q)
                
                mcq_q = models.MCQQuestion(
                    question_id=q.id,
                    option_a="Phase 1: Identification & Alerts triage",
                    option_b="Phase 2: Isolation & Rollback",
                    option_c="Phase 3: Hotfix & Post-mortem analysis",
                    option_d="Phase 4: Scaling prevention design",
                    correct_option="A",
                    explanation="Evaluation criteria: Technical reasoning, prioritizations, and post-mortem mitigation strategies.",
                    time_limit=300
                )
                db.add(mcq_q)
                db.commit()

        print("20 Scenario questions seeded.")

        # 9. SEED 5 ROLE ROADMAPS
        roadmaps = [
            ("Software Engineer Roadmap", "Software Engineer", "Beginner", ["Arrays & Strings", "Two Pointers", "Stack & Queue", "Trees & BSTs", "DBMS Core & Indexes", "Object-Oriented Programming (OOP)"]),
            ("Data Engineer Roadmap", "Data Engineer", "Intermediate", ["SQL Joins", "Aggregations & Grouping", "Window Functions & Ranking", "Subqueries & CTEs", "DBMS Core & Indexes", "Scenario-based System Design"]),
            ("DevOps & Cloud Engineer Roadmap", "DevOps Engineer", "Advanced", ["Operating Systems", "Computer Networks", "Software Engineering Core", "Scenario-based Incident Response"]),
            ("Data Analyst Roadmap", "Data Analyst", "Beginner", ["SQL Joins", "Aggregations & Grouping", "Window Functions & Ranking", "Verbal Ability & Data Interpretation"]),
            ("Full Stack Developer Roadmap", "Full Stack Developer", "Intermediate", ["Arrays & Strings", "Two Pointers", "DBMS Core & Indexes", "Object-Oriented Programming (OOP)", "Software Engineering Core"])
        ]
        
        for r_title, role, diff, steps_list in roadmaps:
            exist = db.query(models.Roadmap).filter(models.Roadmap.title == r_title).first()
            if not exist:
                r = models.Roadmap(
                    title=r_title,
                    role=role,
                    difficulty=diff,
                    steps=[{"step": idx + 1, "topic": step_name} for idx, step_name in enumerate(steps_list)]
                )
                db.add(r)
                db.commit()

        print("5 Role Roadmaps seeded.")

        # 10. SEED 50 RESOURCES
        resource_subtopics = list(subtopic_map.keys())
        for i in range(50):
            sub_name = resource_subtopics[i % len(resource_subtopics)]
            res = models.Project( # We can seed resource details in the projects table or mock a simple project
                title=f"Learning Resource: Complete Guide to {sub_name} #{i+1}",
                description=f"A curated list of articles, tutorials, and cheat sheets to master {sub_name}.",
                difficulty="Beginner" if i % 2 == 0 else "Intermediate",
                role_tag="General Prep",
                dataset_url="https://github.com/placementforge/resources",
                architecture_steps=[
                    f"Read official documentation on {sub_name}",
                    f"Solve top 10 interview questions of {sub_name}",
                    "Take the topic mock MCQ test"
                ],
                interview_questions=[{"question": f"Explain the core components of {sub_name}?", "answer": "Detailed walkthrough in guide."}],
                resume_bullet_suggestions=[f"Demonstrated mastery in {sub_name} through targeted assessments."]
            )
            db.add(res)
            db.commit()

        print("50 Resources seeded.")

        # 11. SEED DEFAULT TIMED CONTEST
        from datetime import timedelta
        contest_title = "PlacementForge Weekly Arena Challenge #1"
        exist_contest = db.query(models.Contest).filter(models.Contest.title == contest_title).first()
        if not exist_contest:
            now_dt = datetime.utcnow()
            contest = models.Contest(
                title=contest_title,
                start_time=now_dt - timedelta(hours=1), # Active immediately
                end_time=now_dt + timedelta(hours=23)
            )
            db.add(contest)
            db.commit()
            db.refresh(contest)
            
            # Map questions
            q_titles = ["Two Sum", "Contains Duplicate", "Department Top Three Salaries", "Combine Two Tables"]
            test_questions = db.query(models.Question).filter(models.Question.title.in_(q_titles)).all()
            for tq in test_questions:
                contest.questions.append(tq)
            db.commit()
            print("Weekly Timed Contest seeded.")

        print("Database Seeding Completed Successfully!")
        
    except Exception as e:
        print(f"Error during seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
