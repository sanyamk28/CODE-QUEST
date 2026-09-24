import { McqQuestion } from '../types';

export interface LanguageTrackInfo {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
}

export const LANGUAGE_TRACKS: LanguageTrackInfo[] = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    badge: 'Python Developer',
    description: 'Core syntax, GIL, generators, OOP, decorators, and asynchronous programming in Python.'
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    badge: 'Java Enterprise',
    description: 'JVM internals, memory management, garbage collection, collections, multithreading, and OOP.'
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚡',
    badge: 'C++ Systems',
    description: 'Pointers, RAII, memory management, STL containers, move semantics, and templates.'
  },
  {
    id: 'javascript',
    name: 'JavaScript / TypeScript',
    icon: '🌐',
    badge: 'Full-Stack Web',
    description: 'Event Loop, microtasks, closures, prototypes, Promises, async/await, and TypeScript types.'
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    icon: '🗄️',
    badge: 'Data & Database',
    description: 'Complex joins, window functions, indexing, ACID transactions, and query optimization.'
  },
  {
    id: 'general',
    name: 'Core CS & Placement',
    icon: '💻',
    badge: 'CS Fundamentals',
    description: 'Operating systems, computer networks, data structures, and distributed system design.'
  }
];

export const MCQ_BANK: Record<string, McqQuestion[]> = {
  python: [
    {
      id: "py-1",
      topic: "Python Core & Mutability",
      question: "What will be the output of calling a function def append_to(item, target=[]): target.append(item); return target twice with append_to(1) then append_to(2)?",
      options: [
        "[1] and then [2]",
        "[1] and then [1, 2]",
        "[1, 2] and then [1, 2]",
        "TypeError: mutable default argument not permitted"
      ],
      answer: "B",
      explanation: "In Python, default parameter expressions are evaluated only once when the function is defined, not each time it is invoked. Therefore, a single mutable list is shared across subsequent calls that omit the second argument, producing [1] followed by [1, 2]."
    },
    {
      id: "py-2",
      topic: "Python Concurrency & GIL",
      question: "What is the Global Interpreter Lock (GIL) in CPython, and how does it influence multithreaded CPU-bound tasks?",
      options: [
        "A mechanism that prevents multi-core processors from booting CPython",
        "A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously",
        "A compiler flag that turns dynamic Python variables into static C types",
        "A memory management thread that automatically deletes cyclic dependencies in RAM"
      ],
      answer: "B",
      explanation: "CPython's GIL is a mutual-exclusion lock that restricts execution of Python bytecode to one thread at a time inside a single process. CPU-bound tasks do not achieve true parallelism using threading and require the multiprocessing module instead."
    },
    {
      id: "py-3",
      topic: "Python Memory & Identity",
      question: "In Python, what is the fundamental difference between the 'is' keyword and the '==' operator?",
      options: [
        "'is' compares object contents/values, while '==' compares identity/memory addresses",
        "'is' checks identity by comparing memory addresses (id), while '==' tests for equality of values",
        "'is' can only be used with numbers, while '==' is for strings and lists",
        "There is no difference; 'is' is simply an alias for '=='"
      ],
      answer: "B",
      explanation: "'is' checks whether two variables point to the exact same object in memory (id(a) == id(b)), whereas '==' invokes the __eq__ method to compare equality of value/content."
    },
    {
      id: "py-4",
      topic: "Python Iterators & Generators",
      question: "Which keyword transforms a standard Python function into a Generator function?",
      options: [
        "generate",
        "return",
        "yield",
        "stream"
      ],
      answer: "C",
      explanation: "The 'yield' keyword suspends function execution and yields a value back to the caller while saving the execution state. It allows lazy generation of sequences on-demand with minimal memory overhead."
    },
    {
      id: "py-5",
      topic: "Python Decorators",
      question: "What does the @functools.wraps decorator do when placed inside a custom Python decorator?",
      options: [
        "Compiles the wrapped function into C bytecode for faster execution",
        "Preserves the original function's metadata, such as its __name__, __doc__, and signature",
        "Automatically retries the decorated function if an exception is thrown",
        "Limits the wrapped function to execute inside a background thread"
      ],
      answer: "B",
      explanation: "@functools.wraps updates the wrapper function to reflect the original decorated function's attributes, preventing the loss of __name__, __doc__, annotations, and introspection metadata."
    },
    {
      id: "py-6",
      topic: "Python OOP & Slots",
      question: "What is the primary benefit of declaring '__slots__' in a Python class definition?",
      options: [
        "It makes all attributes private and inaccessible from outside the class",
        "It prevents creation of dynamic '__dict__' for each instance, drastically reducing memory usage",
        "It enables automatic multithreaded locking on all instance methods",
        "It compiles the class into a Cython extension automatically"
      ],
      answer: "B",
      explanation: "By defining '__slots__', instances do not allocate a dictionary (__dict__) for attributes, saving significant memory when creating millions of small objects and restricting arbitrary attribute creation."
    },
    {
      id: "py-7",
      topic: "Python Garbage Collection",
      question: "How does CPython primarily perform memory management and garbage collection?",
      options: [
        "Strictly mark-and-sweep performed at program termination",
        "Reference counting supplemented by a cyclic garbage collector to detect reference cycles",
        "Generational compaction without any reference counting",
        "Manual malloc and free managed through the Python runtime"
      ],
      answer: "B",
      explanation: "CPython uses reference counting as its main memory cleanup mechanism. When a reference count reaches 0, the object is immediately deallocated. A cyclic garbage collector periodically detects circular references across generations 0, 1, and 2."
    },
    {
      id: "py-8",
      topic: "Python Data Structures",
      question: "What is the average time complexity for key lookup and insertion in a Python dictionary?",
      options: [
        "O(log N)",
        "O(N)",
        "O(1)",
        "O(N log N)"
      ],
      answer: "C",
      explanation: "Python dictionaries are implemented as hash tables with open addressing and perturbation strategies, providing O(1) average time complexity for lookups, insertions, and deletions."
    },
    {
      id: "py-9",
      topic: "Python Copying",
      question: "What is the key difference between copy.copy() and copy.deepcopy() in Python?",
      options: [
        "copy() copies both objects and references; deepcopy() only copies primitive types",
        "copy() performs a shallow copy without duplicating nested mutable objects; deepcopy() recursively duplicates all nested objects",
        "copy() is asynchronous, while deepcopy() is synchronous",
        "There is no difference; deepcopy() is an obsolete deprecated method"
      ],
      answer: "B",
      explanation: "A shallow copy creates a new object but inserts references into it to the objects found in the original. A deep copy recursively duplicates every object found within the structure, avoiding shared references to child objects."
    },
    {
      id: "py-10",
      topic: "Python Scoping & Closures",
      question: "What will funcs = [lambda: i for i in range(3)]; [f() for f in funcs] evaluate to in Python?",
      options: [
        "[0, 1, 2]",
        "[2, 2, 2]",
        "[0, 0, 0]",
        "IndexError: variable i out of scope"
      ],
      answer: "B",
      explanation: "Python closures exhibit late binding: the variable 'i' is looked up when the lambda is called, not when defined. At evaluation time, the loop has completed and i is 2, so all lambdas return 2. (Fix: lambda i=i: i)."
    },
    {
      id: "py-11",
      topic: "Python Context Managers",
      question: "Which two magic methods must an object implement to be utilized inside a 'with' statement?",
      options: [
        "__open__ and __close__",
        "__init__ and __del__",
        "__enter__ and __exit__",
        "__start__ and __stop__"
      ],
      answer: "C",
      explanation: "The Context Management protocol requires implementing '__enter__' (which returns the resource) and '__exit__' (which handles cleanup and exception suppression)."
    },
    {
      id: "py-12",
      topic: "Python List Comprehensions",
      question: "What is the difference between [x for x in range(10)] and (x for x in range(10))?",
      options: [
        "The first generates a list in memory; the second creates a generator expression evaluated lazily",
        "The first is a tuple; the second is a set",
        "Both create identical lists, with the second being a faster syntax",
        "The second causes a SyntaxError in modern Python 3"
      ],
      answer: "A",
      explanation: "Square brackets create a list comprehension that allocates memory for all elements immediately. Parentheses create a generator expression that yields items one at a time on demand."
    },
    {
      id: "py-13",
      topic: "Python Object Construction",
      question: "In Python class instantiation, what is the role of __new__ compared to __init__?",
      options: [
        "__new__ initializes attributes; __init__ creates the instance in memory",
        "__new__ is the actual constructor that returns a new instance; __init__ initializes the newly created instance",
        "__new__ is only called for subclasses; __init__ is called for root classes",
        "__new__ is deprecated and replaced entirely by __post_init__"
      ],
      answer: "B",
      explanation: "__new__ is a static method that constructs and returns a new instance of the class. Once created, __init__ receives this instance as 'self' to set up initial state and attributes."
    },
    {
      id: "py-14",
      topic: "Python Packing & Unpacking",
      question: "In a function signature def foo(*args, **kwargs): what types are 'args' and 'kwargs' respectively inside foo?",
      options: [
        "args is a list, kwargs is a dict",
        "args is a tuple, kwargs is a dict",
        "args is a tuple, kwargs is a list",
        "Both are sets"
      ],
      answer: "B",
      explanation: "*args packs positional arguments into an immutable tuple, whereas **kwargs packs named keyword arguments into a mutable dictionary."
    },
    {
      id: "py-15",
      topic: "Python Asynchronous Programming",
      question: "In Python's asyncio module, which statement is required to pause execution until a coroutine completes without blocking the main event loop?",
      options: [
        "yield from coroutine()",
        "await coroutine()",
        "pause coroutine()",
        "defer coroutine()"
      ],
      answer: "B",
      explanation: "'await' yields control back to the asyncio event loop while waiting for the awaitable (coroutine, Task, Future) to complete, allowing other tasks to run concurrently."
    },
    {
      id: "py-16",
      topic: "Python String Formatting",
      question: "Which string formatting mechanism introduced in Python 3.6 offers the fastest runtime performance and cleanest syntax?",
      options: [
        "% operator formatting (printf style)",
        "str.format() method",
        "f-strings (Formatted string literals)",
        "string.Template"
      ],
      answer: "C",
      explanation: "f-strings (e.g. f'Value: {val}') are evaluated at runtime directly as optimized bytecode, making them significantly faster than str.format() and % formatting."
    },
    {
      id: "py-17",
      topic: "Python Type Hinting",
      question: "In Python type annotations, what does typing.Optional[str] signify?",
      options: [
        "The parameter cannot be passed at all",
        "The value can be either str or None (equivalent to Union[str, None])",
        "The string is converted to uppercase optionally",
        "The variable must be an empty string"
      ],
      answer: "B",
      explanation: "Optional[T] indicates that a value can either be of type T or None. In Python 3.10+, this can also be expressed concisely as str | None."
    },
    {
      id: "py-18",
      topic: "Python Exception Handling",
      question: "What is the execution order of try-except-else-finally blocks when NO exception occurs?",
      options: [
        "try -> except -> finally",
        "try -> else -> finally",
        "try -> finally -> else",
        "try only"
      ],
      answer: "B",
      explanation: "When no exception is raised inside the 'try' block, Python skips the 'except' block, executes the 'else' block, and finishes by executing the 'finally' cleanup block."
    },
    {
      id: "py-19",
      topic: "Python Built-in Sorting",
      question: "What algorithm is used by Python's built-in sorted() and list.sort() methods?",
      options: [
        "Quicksort",
        "Mergesort",
        "Timsort",
        "Heapsort"
      ],
      answer: "C",
      explanation: "Python uses Timsort, a hybrid stable sorting algorithm derived from merge sort and insertion sort designed to perform exceptionally well on real-world partially ordered data with O(N log N) worst-case and O(N) best-case complexity."
    },
    {
      id: "py-20",
      topic: "Python Modularity & Imports",
      question: "What is the purpose of the '__all__' variable inside a Python module's '__init__.py'?",
      options: [
        "It defines which variables are strictly read-only",
        "It specifies the public export list imported when someone runs 'from module import *'",
        "It deletes all unlisted symbols from RAM after execution",
        "It tells pip which dependencies to install automatically"
      ],
      answer: "B",
      explanation: "__all__ is a list of strings that specifies what symbols are exported when wild-card import ('from module import *') is invoked, preventing internal helper functions from polluting the namespace."
    }
  ],

  java: [
    {
      id: "java-1",
      topic: "Java Memory & JVM",
      question: "Where are objects allocated in Java memory, and where are local primitive variables stored?",
      options: [
        "Objects are stored on the Stack; local variables are stored on the Heap",
        "Objects are stored on the Heap; local primitive variables are stored on the Stack",
        "Both are stored exclusively in the Metaspace",
        "Both are stored directly in CPU registers"
      ],
      answer: "B",
      explanation: "In Java, all objects and their instance fields are allocated on the Heap memory. Method execution frames and local primitive variables/references reside on the thread's Stack memory."
    },
    {
      id: "java-2",
      topic: "Java String Pool",
      question: "What is the result of String s1 = \"Code\"; String s2 = new String(\"Code\"); System.out.println(s1 == s2);?",
      options: [
        "true, because both strings have identical characters",
        "false, because s1 refers to the String Constant Pool while s2 allocates a distinct object on the Heap",
        "Compilation error: cannot compare strings with ==",
        "NullPointerException at runtime"
      ],
      answer: "B",
      explanation: "Literal strings like s1 are interned into the String Constant Pool. Using 'new String(...)' explicitly forces the creation of a new object on the heap with a distinct memory address, so reference comparison (==) evaluates to false."
    },
    {
      id: "java-3",
      topic: "Java Collections Internals",
      question: "In Java 8+, what happens to a HashMap bucket when the number of colliding entries exceeds the TREEIFY_THRESHOLD (default 8)?",
      options: [
        "The bucket throws an OutOfMemoryError",
        "The linked list in the bucket is converted into a Red-Black Tree, reducing lookup from O(N) to O(log N)",
        "The HashMap immediately doubles its array size without modifying the bucket",
        "All colliding entries are hashed into a secondary database"
      ],
      answer: "B",
      explanation: "When a single bucket's collision chain reaches 8 entries (and total capacity >= 64), Java 8 transforms the linked list into a balanced Red-Black Tree (TreeNode), lowering worst-case lookup from O(N) to O(log N)."
    },
    {
      id: "java-4",
      topic: "Java Concurrency & Volatile",
      question: "What guarantee does the 'volatile' keyword provide in Java multi-threading?",
      options: [
        "Atomic increments on non-primitive objects",
        "Visibility guarantee: reads and writes go directly to main memory, preventing thread-local CPU caching, plus instruction reordering prevention",
        "Reentrant locking on the enclosing method",
        "Makes the variable immutable like final"
      ],
      answer: "B",
      explanation: "Volatile ensures memory visibility across threads: any write to a volatile variable is immediately flushed to main memory, and reads always fetch the latest value. It also establishes happens-before relationships preventing instruction reordering."
    },
    {
      id: "java-5",
      topic: "Java Garbage Collection",
      question: "Which Java Garbage Collector divides the heap into equal-sized virtual regions and targets regions with the most reclaimable space first?",
      options: [
        "Serial GC",
        "Parallel GC",
        "G1 (Garbage-First) GC",
        "CMS (Concurrent Mark Sweep)"
      ],
      answer: "C",
      explanation: "The G1 GC splits the heap into numerous uniform regions (Eden, Survivor, Tenured). It prioritizes collecting regions filled mostly with dead objects ('garbage-first'), maintaining predictable low pause times."
    },
    {
      id: "java-6",
      topic: "Java Interfaces & Default Methods",
      question: "Since Java 8, can an interface contain method implementations?",
      options: [
        "No, interfaces can only have abstract methods without bodies",
        "Yes, using 'default' methods and 'static' methods",
        "Yes, but only if the interface is marked @Final",
        "Only through bytecode injection"
      ],
      answer: "B",
      explanation: "Java 8 introduced default methods (using the 'default' keyword) and static methods in interfaces, enabling developers to add new capabilities to existing interfaces while maintaining backwards compatibility."
    },
    {
      id: "java-7",
      topic: "Java Equals & HashCode",
      question: "What is the crucial contract between equals() and hashCode() in Java?",
      options: [
        "If two objects have the same hashCode(), they MUST be equal via equals()",
        "If two objects are equal according to equals(), they MUST have the same hashCode()",
        "hashCode() must always return a positive prime number",
        "equals() must never be overridden without implementing Comparable"
      ],
      answer: "B",
      explanation: "The contract states that if a.equals(b) is true, then a.hashCode() must equal b.hashCode(). Failure to follow this breaks hash-based collections like HashMap and HashSet, causing duplicate keys or lookup failures."
    },
    {
      id: "java-8",
      topic: "Java Exception Hierarchy",
      question: "Which of the following is an UNCHECKED exception in Java?",
      options: [
        "java.io.IOException",
        "java.sql.SQLException",
        "java.lang.NullPointerException",
        "java.lang.ClassNotFoundException"
      ],
      answer: "C",
      explanation: "Exceptions extending RuntimeException (and Error) are unchecked exceptions and do not require explicit try-catch or throws clauses. NullPointerException extends RuntimeException."
    },
    {
      id: "java-9",
      topic: "Java Generics & Type Erasure",
      question: "What is Type Erasure in Java Generics?",
      options: [
        "A feature that deletes compiled .class files after execution",
        "The compiler replaces generic type parameters with their bounds (or Object) during compilation, so runtime bytecode carries no generic type parameters",
        "An algorithm that erases unused classes to conserve heap space",
        "A mechanism preventing inheritance across generic classes"
      ],
      answer: "B",
      explanation: "Java implements generics through Type Erasure for backwards compatibility: compile-time type checks are performed, but at runtime, generic type info is erased, making List<String> and List<Integer> the same raw List at runtime."
    },
    {
      id: "java-10",
      topic: "Java Thread Synchronization",
      question: "What happens when a thread enters a 'synchronized(this)' block on an instance method?",
      options: [
        "It locks the entire operating system process",
        "It acquires the intrinsic monitor lock associated with that specific instance ('this')",
        "It halts all other threads in the JVM immediately",
        "It creates a new operating system core allocation"
      ],
      answer: "B",
      explanation: "A synchronized block synchronizes on the object's intrinsic monitor lock. Only one thread can hold this lock at any time; other threads trying to enter synchronized blocks on the same instance are blocked until it releases."
    },
    {
      id: "java-11",
      topic: "Java Immutability",
      question: "Why is the String class made final and immutable in Java?",
      options: [
        "Security, thread safety, and enabling the String Constant Pool cache without concurrency hazards",
        "To prevent developers from using it inside loops",
        "Because the JVM cannot store mutable characters on the heap",
        "To enforce UTF-16 encoding only"
      ],
      answer: "A",
      explanation: "Immutability allows safe sharing across multiple threads without synchronization, secures network/database connection strings against unauthorized mutations, and ensures hashcodes never change after insertion into hash tables."
    },
    {
      id: "java-12",
      topic: "Java Transient Keyword",
      question: "What is the purpose of the 'transient' modifier in a Java class implementing Serializable?",
      options: [
        "Marks the field as volatile for multithreading",
        "Indicates that the field should NOT be serialized during object serialization",
        "Prevents the field from being modified after creation",
        "Specifies that the field expires after a set timeout"
      ],
      answer: "B",
      explanation: "Fields marked with 'transient' are excluded from the Java object serialization process. Upon deserialization, transient fields are assigned default values (null, 0, false)."
    },
    {
      id: "java-13",
      topic: "Java Stream API",
      question: "In the Java Streams API, what does it mean that intermediate operations are 'lazy'?",
      options: [
        "They execute slowly on a single background core",
        "They are not executed until a terminal operation (like collect, count, forEach) is invoked",
        "They discard every second element in the stream",
        "They require manual invocation of thread.sleep()"
      ],
      answer: "B",
      explanation: "Intermediate operations (e.g. filter, map) build a query pipeline without processing elements until a terminal operation is called, allowing the stream engine to optimize data traversal and perform short-circuiting."
    },
    {
      id: "java-14",
      topic: "Java Final Keyword",
      question: "What effect does declaring a method 'final' have in Java?",
      options: [
        "The method cannot be called more than once",
        "The method cannot be overridden by subclasses",
        "The method runs only when garbage collection finishes",
        "The method returns an immutable collection"
      ],
      answer: "B",
      explanation: "Marking a method 'final' prevents subclasses from overriding its implementation, guaranteeing that the original logic remains intact across the class hierarchy."
    },
    {
      id: "java-15",
      topic: "Java ConcurrentHashMap",
      question: "How does ConcurrentHashMap achieve thread safety without synchronizing entire operations like Hashtable?",
      options: [
        "By disabling writes in multi-threaded mode",
        "By utilizing fine-grained bucket-level lock striping and lock-free CAS (Compare-And-Swap) operations",
        "By converting all data into an immutable array",
        "By queuing all thread requests into an external Redis broker"
      ],
      answer: "B",
      explanation: "Instead of locking the entire table with a single lock, ConcurrentHashMap uses CAS operations for empty bucket insertions and synchronizes only on the head node of the specific colliding bucket, enabling massive concurrent throughput."
    },
    {
      id: "java-16",
      topic: "Java Reflection",
      question: "Which Java package contains classes like Field, Method, and Constructor for inspecting classes at runtime?",
      options: [
        "java.util.concurrent",
        "java.lang.reflect",
        "java.io.introspection",
        "javax.annotation.meta"
      ],
      answer: "B",
      explanation: "The java.lang.reflect package provides classes and interfaces to obtain reflective information about classes, examine fields/methods, and invoke methods dynamically at runtime."
    },
    {
      id: "java-17",
      topic: "Java ClassLoader",
      question: "What is the standard hierarchy of ClassLoaders in the Java Virtual Machine?",
      options: [
        "Bootstrap -> Extension/Platform -> Application/System ClassLoader",
        "System -> Operating System -> Kernel ClassLoader",
        "User -> Interface -> Native ClassLoader",
        "Main -> Sub -> Thread ClassLoader"
      ],
      answer: "A",
      explanation: "The delegation model starts with the Bootstrap ClassLoader (loads core Java runtime), followed by Platform/Extension ClassLoader, and finally Application/System ClassLoader (loads user classpath classes)."
    },
    {
      id: "java-18",
      topic: "Java Autoboxing",
      question: "What is autoboxing in Java?",
      options: [
        "The automatic packaging of Java applications into JAR files",
        "The automatic conversion that the Java compiler makes between primitive types and their corresponding wrapper object classes",
        "Dynamic memory defragmentation inside the heap",
        "Automatic generation of getter and setter methods"
      ],
      answer: "B",
      explanation: "Autoboxing is the automatic conversion by the Java compiler of primitive types (like int, double, boolean) to their wrapper object equivalents (Integer, Double, Boolean), and unboxing is the reverse."
    },
    {
      id: "java-19",
      topic: "Java Try-with-Resources",
      question: "What interface must a resource class implement to be used within Java's try-with-resources statement?",
      options: [
        "java.lang.Runnable",
        "java.lang.AutoCloseable",
        "java.io.Serializable",
        "java.util.Disposable"
      ],
      answer: "B",
      explanation: "Any object that implements java.lang.AutoCloseable (which includes java.io.Closeable) can be used in a try-with-resources block, ensuring its close() method is automatically called upon block exit."
    },
    {
      id: "java-20",
      topic: "Java Method Overloading vs Overriding",
      question: "What distinguishes method overloading from method overriding in Java?",
      options: [
        "Overloading is resolved at compile time with differing parameter lists; Overriding is resolved at runtime based on the actual object type",
        "Overloading requires the @Override tag; Overriding does not",
        "Overriding can only change the return type; Overloading cannot",
        "Both occur strictly within the same class without inheritance"
      ],
      answer: "A",
      explanation: "Overloading occurs within the same class with identical method names but differing parameter signatures (compile-time polymorphism). Overriding occurs in a subclass providing a specific implementation of a superclass method (runtime polymorphism)."
    }
  ],

  cpp: [
    {
      id: "cpp-1",
      topic: "C++ Smart Pointers",
      question: "What is the primary difference between std::unique_ptr and std::shared_ptr in modern C++?",
      options: [
        "std::unique_ptr represents exclusive ownership with zero runtime overhead; std::shared_ptr uses reference counting for shared ownership",
        "std::unique_ptr allocates on the stack; std::shared_ptr allocates on the heap",
        "std::unique_ptr can be copied anywhere; std::shared_ptr cannot be moved",
        "std::unique_ptr requires manual invocation of delete"
      ],
      answer: "A",
      explanation: "std::unique_ptr enforces strict sole ownership (it can be moved, not copied) and introduces no overhead compared to a raw pointer. std::shared_ptr maintains an atomic reference-counted control block to manage shared lifetime."
    },
    {
      id: "cpp-2",
      topic: "C++ RAII & Destructors",
      question: "Why should a base class destructor always be declared 'virtual' when polymorphism is intended?",
      options: [
        "To allow private fields to be deleted by child classes",
        "To prevent undefined behavior and ensure the derived class destructor is invoked when deleting via a base class pointer",
        "Because C++ compilers will not compile non-virtual destructors",
        "To speed up object construction on multi-threaded CPUs"
      ],
      answer: "B",
      explanation: "Deleting a derived object through a pointer to a base class that lacks a virtual destructor causes undefined behavior, typically leaking derived class resources because only the base destructor is called."
    },
    {
      id: "cpp-3",
      topic: "C++ Move Semantics",
      question: "What does std::move(x) actually do in C++11 and beyond?",
      options: [
        "Physically moves bytes to a different memory address in RAM",
        "Unconditionally casts an expression to an rvalue reference (T&&), enabling move constructors to steal its resources",
        "Deletes the object immediately after casting",
        "Spawns an asynchronous thread to transfer ownership"
      ],
      answer: "B",
      explanation: "std::move does not move anything by itself; it is a static_cast to an rvalue reference (T&&). This signals to functions and constructors that the resource can be safely moved/stolen from."
    },
    {
      id: "cpp-4",
      topic: "C++ STL Vector Internals",
      question: "When std::vector exceeds its current capacity during push_back(), how does it reallocate memory?",
      options: [
        "It allocates 1 additional element at the end of the existing contiguous block",
        "It allocates a new larger contiguous block (usually 1.5x or 2x), moves/copies existing elements, and destroys the old block, invalidating existing iterators",
        "It converts into a linked list structure",
        "It throws a std::bad_alloc exception immediately"
      ],
      answer: "B",
      explanation: "std::vector requires contiguous memory. When full, it allocates a new buffer (typically double or 1.5x capacity), relocates elements, frees old memory, and invalidates all existing iterators, pointers, and references."
    },
    {
      id: "cpp-5",
      topic: "C++ Virtual Table (vtable)",
      question: "How does C++ implement dynamic dispatch / runtime polymorphism under the hood?",
      options: [
        "Through reflection and string lookups at runtime",
        "Using a compiler-generated virtual method table (vtable) and an implicit virtual pointer (vptr) per object instance",
        "By duplicating the entire class bytecode inside every thread",
        "Through dynamic system interrupts"
      ],
      answer: "B",
      explanation: "Classes with virtual functions contain an invisible vptr pointing to the class's vtable (table of function pointers). At runtime, virtual calls look up the corresponding function address in the vtable based on the actual object type."
    },
    {
      id: "cpp-6",
      topic: "C++ Const Correctness",
      question: "In the declaration 'const int* const ptr = &val;', what is constant?",
      options: [
        "Only the integer value being pointed to",
        "Only the pointer address itself",
        "Both the integer value (cannot modify *ptr) AND the pointer address (cannot reassign ptr)",
        "Neither; const is ignored by modern compilers"
      ],
      answer: "C",
      explanation: "Reading right-to-left: 'const ptr' means the pointer itself is constant (cannot point to another address), and 'const int*' means the integer being pointed to is constant (cannot modify the target value through this pointer)."
    },
    {
      id: "cpp-7",
      topic: "C++ Pass by Value vs Reference",
      question: "What is the recommended idiom in C++ for passing large objects read-only into a function?",
      options: [
        "Pass by raw value (T obj)",
        "Pass by const reference (const T& obj)",
        "Pass by void pointer (void* obj)",
        "Pass by volatile pointer (volatile T* obj)"
      ],
      answer: "B",
      explanation: "Passing by const reference avoids expensive copy constructor calls for large objects while guaranteeing to the caller that the function will not mutate the passed argument."
    },
    {
      id: "cpp-8",
      topic: "C++ Memory Management",
      question: "What is the difference between malloc/free and new/delete in C++?",
      options: [
        "malloc/free only allocates/deallocates raw bytes; new/delete allocates memory AND automatically calls constructors and destructors",
        "malloc calls constructors; new does not",
        "malloc is type-safe; new returns void*",
        "There is no difference; new is just a C++ macro for malloc"
      ],
      answer: "A",
      explanation: "malloc/free are C standard library functions dealing strictly with raw byte allocation without type awareness. new/delete are C++ operators that calculate size automatically, allocate memory, and execute constructors/destructors."
    },
    {
      id: "cpp-9",
      topic: "C++ Struct vs Class",
      question: "In C++, what is the only technical difference between a 'struct' and a 'class'?",
      options: [
        "A struct cannot have methods or constructors",
        "A struct defaults to public member access and inheritance; a class defaults to private member access and inheritance",
        "A class is allocated on the heap; a struct is allocated on the stack",
        "A struct does not support templates"
      ],
      answer: "B",
      explanation: "In C++, structs and classes have identical capabilities. The only difference is default access specifier: struct members and base classes are 'public' by default, whereas in a class they are 'private' by default."
    },
    {
      id: "cpp-10",
      topic: "C++ Weak Pointer",
      question: "What problem does std::weak_ptr solve when working with std::shared_ptr?",
      options: [
        "Memory fragmentation on SSDs",
        "Breaking cyclic reference dependencies that prevent shared_ptr reference counts from reaching zero, causing memory leaks",
        "Allowing multi-threaded access without locks",
        "Allocating memory on GPU registers"
      ],
      answer: "B",
      explanation: "If two objects hold std::shared_ptr references to each other, their reference counts never drop to 0, leaking memory. std::weak_ptr provides a non-owning reference that observes the object without incrementing the strong reference count."
    },
    {
      id: "cpp-11",
      topic: "C++ Copy Elision & RVO",
      question: "What is Return Value Optimization (RVO) in C++ compilers?",
      options: [
        "A technique that omits copy and move constructors when returning objects from functions by constructing the return value directly in the caller's memory",
        "Compressing the return value using gzip",
        "Converting integer returns into float registers",
        "Inlining all recursive calls automatically"
      ],
      answer: "A",
      explanation: "RVO is a compiler optimization (guaranteed in C++17) that constructs the function's return object directly in the memory location allocated for the caller's target variable, eliminating copy and move overhead."
    },
    {
      id: "cpp-12",
      topic: "C++ Casting Operators",
      question: "Which C++ casting operator is used for safely downcasting a base class pointer to a derived class pointer with runtime type checking?",
      options: [
        "static_cast",
        "dynamic_cast",
        "const_cast",
        "reinterpret_cast"
      ],
      answer: "B",
      explanation: "dynamic_cast checks RTTI (Run-Time Type Information) to verify whether the object is indeed of the target derived type. If invalid, it returns nullptr for pointers or throws std::bad_cast for references."
    },
    {
      id: "cpp-13",
      topic: "C++ Memory Alignment & Padding",
      question: "Why might sizeof(struct { char a; int b; }) be 8 bytes instead of 5 on a 32/64-bit architecture?",
      options: [
        "Memory corruption bug in the compiler",
        "Data structure alignment and padding added so the int aligns to a 4-byte boundary for efficient CPU memory access",
        "char always takes 4 bytes in C++",
        "Because structs automatically append 3 virtual pointers"
      ],
      answer: "B",
      explanation: "Modern CPUs fetch data from memory aligned to boundaries (e.g. 4 or 8 bytes). Compilers add 3 bytes of padding between the char and int so that 'int' resides at an address divisible by 4, avoiding CPU bus penalties."
    },
    {
      id: "cpp-14",
      topic: "C++ Templates",
      question: "When are C++ templates compiled and instantiated by the compiler?",
      options: [
        "During runtime via JIT (Just-In-Time)",
        "At compile time, generating separate specialized code for each concrete type used with the template",
        "During link time inside dynamic DLL libraries only",
        "Only when the user provides explicit template arguments via CLI"
      ],
      answer: "B",
      explanation: "C++ templates are a compile-time mechanism. The compiler instantiates a distinct class or function for each unique combination of template arguments used, providing zero-overhead abstractions without runtime boxing."
    },
    {
      id: "cpp-15",
      topic: "C++ Undefined Behavior",
      question: "Which of the following operations results in Undefined Behavior (UB) in C++?",
      options: [
        "Dividing by zero or dereferencing a nullptr",
        "Using dynamic_cast on an incompatible type",
        "Throwing an exception from within a catch block",
        "Passing a const reference to a pure virtual function"
      ],
      answer: "A",
      explanation: "Dereferencing a nullptr, dividing by zero, accessing out-of-bounds array indices, or signed integer overflow are classic undefined behaviors in C++, allowing compilers to make optimizations that may lead to crashes or silent bugs."
    },
    {
      id: "cpp-16",
      topic: "C++ Maps: Ordered vs Unordered",
      question: "What underlying data structures power std::map and std::unordered_map respectively?",
      options: [
        "std::map uses a Red-Black Tree (Self-balancing BST); std::unordered_map uses a Hash Table with collision buckets",
        "std::map uses an Array; std::unordered_map uses a Binary Search Tree",
        "Both use hash tables with differing hash functions",
        "Both use skip lists"
      ],
      answer: "A",
      explanation: "std::map keeps keys sorted using a Red-Black Tree with O(log N) search/insert/delete. std::unordered_map uses a hash table with O(1) average time complexity, sacrificing key ordering."
    },
    {
      id: "cpp-17",
      topic: "C++ Lambda Expressions",
      question: "In a C++ lambda expression '[&, x](int val) { ... }', what do the capture brackets specify?",
      options: [
        "val is captured by reference",
        "All outer variables are captured by reference, EXCEPT 'x' which is captured by value (copy)",
        "The lambda cannot be executed concurrently",
        "Only variables named '&' and 'x' are captured"
      ],
      answer: "B",
      explanation: "The default capture [&] captures all enclosing variables by reference, while the explicit override 'x' captures variable x by value (creating a copy for the lambda)."
    },
    {
      id: "cpp-18",
      topic: "C++ Atomics & Concurrency",
      question: "What is the primary advantage of std::atomic over using std::mutex for basic counters?",
      options: [
        "Atomics use lock-free CPU hardware instructions (e.g. CAS, fetch_add), avoiding OS thread context switching and lock contention",
        "Atomics can hold up to 10GB of data in a single variable",
        "Atomics prevent all compiler optimizations entirely",
        "Atomics run strictly on the GPU"
      ],
      answer: "A",
      explanation: "std::atomic leverages CPU instruction-level atomic operations (like LOCK XADD on x86), eliminating the need for heavyweight OS mutexes, thread blocking, and context switches for simple shared state."
    },
    {
      id: "cpp-19",
      topic: "C++ Placement New",
      question: "What does 'placement new' syntax (new (address) Type()) do in C++?",
      options: [
        "Allocates memory on a specific network node",
        "Constructs an object at an already allocated specific memory address without allocating new memory",
        "Swaps two objects in place in an array",
        "Deletes an object and immediately zeroes its memory"
      ],
      answer: "B",
      explanation: "Placement new allows developers to construct an object in a pre-allocated memory buffer (e.g. memory pools, custom allocators) without performing a dynamic heap allocation."
    },
    {
      id: "cpp-20",
      topic: "C++ Constexpr",
      question: "What is the key benefit of marking a function or variable 'constexpr' in C++11/14/17?",
      options: [
        "It forces the compiler to evaluate the expression or function at compile time whenever possible, embedding constants directly into the binary",
        "It protects against buffer overflows at runtime",
        "It restricts the function to execute on a single core",
        "It converts float operations into integer math"
      ],
      answer: "A",
      explanation: "constexpr indicates that the function or value can be evaluated at compile time if given constant arguments, shifting computational work from runtime to compile time with zero runtime penalty."
    }
  ],

  javascript: [
    {
      id: "js-1",
      topic: "JS Event Loop & Microtasks",
      question: "In what order will the following code log to the console?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
      options: [
        "1, 2, 3, 4",
        "1, 4, 3, 2",
        "1, 4, 2, 3",
        "1, 3, 4, 2"
      ],
      answer: "B",
      explanation: "Synchronous code runs first (logs 1 and 4). Then the Microtask queue (Promise.then callbacks) is completely drained before processing Macrotasks (setTimeout callbacks). So 3 is logged before 2."
    },
    {
      id: "js-2",
      topic: "JS Closures & Lexical Scope",
      question: "What is a closure in JavaScript?",
      options: [
        "A function that closes the browser window after execution",
        "A function bundled together with references to its surrounding lexical environment, allowing it to access outer variables even after the outer function has returned",
        "A syntax error caused by unmatched curly brackets",
        "A method that converts synchronous code into asynchronous workers"
      ],
      answer: "B",
      explanation: "A closure is formed when an inner function retains access to variables from its outer (enclosing) lexical scope, even after the parent function has finished execution and popped off the call stack."
    },
    {
      id: "js-3",
      topic: "JS Variables & Temporal Dead Zone",
      question: "What will happen when trying to access a 'let' variable before its declaration line?",
      options: [
        "It returns 'undefined' like var",
        "It throws a ReferenceError due to the Temporal Dead Zone (TDZ)",
        "It returns null",
        "It creates a global window property"
      ],
      answer: "B",
      explanation: "Both let and const are hoisted, but unlike var (which is initialized to undefined), they remain uninitialized in the Temporal Dead Zone (TDZ) from the start of the block until the declaration line, throwing a ReferenceError if accessed."
    },
    {
      id: "js-4",
      topic: "JS Arrow Functions vs Standard Functions",
      question: "How does the 'this' keyword behave differently inside an ES6 arrow function compared to a standard function?",
      options: [
        "Arrow functions have their own dynamic 'this' bound at invocation",
        "Arrow functions do not have their own 'this'; they lexically capture 'this' from the enclosing execution context",
        "Arrow functions bind 'this' to the global window object in all cases",
        "Arrow functions cannot access 'this' at all and throw a syntax error"
      ],
      answer: "B",
      explanation: "Arrow functions do not define their own 'this', 'arguments', or 'super'. They retain the 'this' value of the enclosing lexical scope from where they were created."
    },
    {
      id: "js-5",
      topic: "JS Prototypal Inheritance",
      question: "In JavaScript, what does an object's '__proto__' property point to?",
      options: [
        "Its constructor function's 'prototype' object",
        "The parent HTML DOM element",
        "The compiled V8 bytecode",
        "A copy of the global window object"
      ],
      answer: "A",
      explanation: "Every JavaScript object has an internal prototype link (__proto__) that points to the 'prototype' property of the constructor function used to instantiate it, forming the prototype chain."
    },
    {
      id: "js-6",
      topic: "JS Type Coercion & Equality",
      question: "What will '[] == false' evaluate to in JavaScript, and why?",
      options: [
        "true, because [] is coerced to an empty string \"\", which coerces to numeric 0, and false coerces to numeric 0",
        "false, because an array is a truthy object",
        "TypeError: cannot compare object to boolean",
        "undefined"
      ],
      answer: "A",
      explanation: "The abstract equality operator (==) uses complex type coercion: false converts to 0, [] invokes ToPrimitive resulting in \"\", and \"\" converts to 0. Since 0 == 0, the result is true. (Strict equality '=== ' avoids this)."
    },
    {
      id: "js-7",
      topic: "JS Promises & Async/Await",
      question: "What does an 'async' function in JavaScript always return?",
      options: [
        "The raw synchronous return value directly",
        "A Promise (which resolves with the returned value, or rejects if an error is thrown)",
        "An Observable",
        "A generator object"
      ],
      answer: "B",
      explanation: "An async function always wraps its return value in a Promise. Even if you return a non-promise primitive like 42, the caller receives Promise.resolve(42)."
    },
    {
      id: "js-8",
      topic: "JS Debounce vs Throttle",
      question: "What is the practical difference between Debouncing and Throttling a search input handler?",
      options: [
        "Debounce delays execution until a certain amount of idle time has passed since the last event; Throttle limits execution to at most once per specified time interval",
        "Debounce runs on every keystroke; Throttle runs only once per page load",
        "Throttle is for CSS animations; Debounce is for database queries",
        "There is no difference; both are interchangeable terms"
      ],
      answer: "A",
      explanation: "Debounce resets its timer with each new event, executing only when the user stops typing for N ms. Throttle guarantees execution at regulated intervals (e.g. once every 300ms) regardless of how frequently events fire."
    },
    {
      id: "js-9",
      topic: "JS Deep Copying",
      question: "Which modern built-in browser API performs a true deep clone of objects, including circular references and typed arrays?",
      options: [
        "JSON.parse(JSON.stringify(obj))",
        "Object.assign({}, obj)",
        "structuredClone(obj)",
        "{ ...obj }"
      ],
      answer: "C",
      explanation: "structuredClone() is the standardized modern deep copy algorithm. Unlike JSON.stringify, it properly handles circular references, Dates, RegExp, Maps, Sets, and binary TypedArrays without losing types or failing on undefined."
    },
    {
      id: "js-10",
      topic: "TypeScript Type System",
      question: "In TypeScript, what is the difference between the 'any' and 'unknown' types?",
      options: [
        "'any' bypasses all type checking; 'unknown' is type-safe because you cannot perform operations on it without first narrowing its type via typeof or instanceof",
        "'unknown' can only hold strings, while 'any' holds anything",
        "'any' is for variables; 'unknown' is only for functions",
        "They are identical aliases"
      ],
      answer: "A",
      explanation: "With 'any', TypeScript completely turns off type checking. With 'unknown' (the top type), you can assign any value to it, but you are not allowed to access properties or call it without explicit type narrowing or casting."
    },
    {
      id: "js-11",
      topic: "TypeScript Never Type",
      question: "What does the 'never' type represent in TypeScript?",
      options: [
        "A variable that is always null",
        "A type for values that never occur, such as a function that always throws an error or never returns (infinite loop), and for exhaustive type checking",
        "An optional parameter in an interface",
        "A deprecated alias for void"
      ],
      answer: "B",
      explanation: "The 'never' type represents the bottom type: no value can ever be assigned to it (except another never). It is used for functions that throw or have infinite loops, and in switch statements to ensure exhaustive union checks."
    },
    {
      id: "js-12",
      topic: "JS Event Bubbling & Capturing",
      question: "In DOM event propagation, which phase executes first when a child button inside a parent container is clicked?",
      options: [
        "Bubbling phase (from target up to window)",
        "Capturing phase (trickling down from window to target)",
        "Target phase only",
        "Dispatch phase"
      ],
      answer: "B",
      explanation: "DOM event dispatch occurs in three phases: 1. Capturing Phase (event travels down from window to target), 2. Target Phase (fires at the target element), 3. Bubbling Phase (bubbles up from target back to window)."
    },
    {
      id: "js-13",
      topic: "JS Map vs Object",
      question: "What is an advantage of JavaScript's 'Map' over a standard plain Object for key-value storage?",
      options: [
        "Map keys can be of ANY type (including objects and functions), maintains insertion order, and has an efficient .size property",
        "Map converts all keys to JSON strings automatically",
        "Map cannot be iterated over",
        "Map is stored directly in browser local storage"
      ],
      answer: "A",
      explanation: "Objects only support string and symbol keys. A Map allows keys of any data type (objects, functions, numbers), retains exact key insertion order during iteration, and provides an O(1) .size property."
    },
    {
      id: "js-14",
      topic: "JS Currying",
      question: "What is Currying in JavaScript functional programming?",
      options: [
        "A technique of evaluating a function with multiple arguments into a sequence of nested unary functions that each take a single argument",
        "Passing a function as a callback into setTimeout",
        "Converting an array of objects into a single string",
        "Compressing code before sending to production"
      ],
      answer: "A",
      explanation: "Currying transforms a function f(a, b, c) into f(a)(b)(c). Each step returns a new function taking the next argument until all arguments are provided, enabling partial function application."
    },
    {
      id: "js-15",
      topic: "JS WeakMap and Memory",
      question: "Why does a WeakMap in JavaScript not cause memory leaks when storing object keys?",
      options: [
        "It stores objects on the client's hard disk",
        "Keys in a WeakMap are weakly held, meaning if there are no other references to the key object, it can be garbage collected even if present in the WeakMap",
        "It deletes all stored items every 60 seconds",
        "WeakMap only stores primitive strings"
      ],
      answer: "B",
      explanation: "WeakMap holds 'weak' references to its keys (which must be objects). If no other variable references the key object, it is collected by the garbage collector, making it ideal for caching private data without memory leaks."
    },
    {
      id: "js-16",
      topic: "TypeScript Interfaces vs Type Aliases",
      question: "What feature do TypeScript 'interfaces' support that 'type' aliases do NOT?",
      options: [
        "Declaration Merging (multiple interface definitions with the same name automatically combine)",
        "Union types and primitive aliases",
        "Generic parameters",
        "Export and import statements"
      ],
      answer: "A",
      explanation: "TypeScript interfaces support declaration merging: if you declare 'interface User' twice in the same scope, TS merges their members together. Type aliases do not support merging and will throw a duplicate identifier error."
    },
    {
      id: "js-17",
      topic: "JS Generator Functions",
      question: "How do you define a Generator function in JavaScript, and what method is called to advance it?",
      options: [
        "function* generator() and next()",
        "async function generator() and step()",
        "generator function() and advance()",
        "function& generator() and resume()"
      ],
      answer: "A",
      explanation: "Generator functions are declared using the 'function*' syntax. Invoking the generator returns an iterator object, whose '.next()' method executes code until the next 'yield' expression."
    },
    {
      id: "js-18",
      topic: "JS Mutation & Object.freeze",
      question: "What is the limitation of Object.freeze() in JavaScript?",
      options: [
        "It does not work on arrays",
        "It only performs a shallow freeze; nested objects inside the frozen object can still be mutated",
        "It crashes older browsers",
        "It converts numbers to strings"
      ],
      answer: "B",
      explanation: "Object.freeze() is shallow: it prevents adding, removing, or modifying properties on the root object, but any nested objects remain completely mutable unless explicitly frozen recursively ('deep freeze')."
    },
    {
      id: "js-19",
      topic: "JS Strict Mode",
      question: "What does 'use strict' enforce in JavaScript?",
      options: [
        "Prevents creation of accidental global variables, prohibits duplicate parameter names, and makes assigning to non-writable properties throw errors",
        "Forces TypeScript compilation",
        "Restricts code execution to secure HTTPS domains only",
        "Encrypts all source code strings in memory"
      ],
      answer: "A",
      explanation: "'use strict' enables Strict Mode, which converts silent errors into throwing exceptions, eliminates accidental global variables (e.g. assigning to undeclared variables), and prevents insecure features like 'with'."
    },
    {
      id: "js-20",
      topic: "JS Promise.all vs Promise.allSettled",
      question: "What is the key difference between Promise.all() and Promise.allSettled()?",
      options: [
        "Promise.all() rejects immediately if ANY promise rejects (fail-fast); Promise.allSettled() waits for ALL promises to complete regardless of rejections",
        "Promise.all() only takes 2 promises; allSettled takes unlimited",
        "Promise.allSettled() is synchronous",
        "There is no difference; allSettled is an alias for all"
      ],
      answer: "A",
      explanation: "Promise.all() short-circuits and rejects as soon as any input promise rejects. Promise.allSettled() waits for every promise to resolve or reject, returning an array of outcome objects with status ('fulfilled' or 'rejected')."
    }
  ],

  sql: [
    {
      id: "sql-1",
      topic: "SQL Joins",
      question: "What is the primary difference between a LEFT JOIN and an INNER JOIN?",
      options: [
        "LEFT JOIN only works on primary keys; INNER JOIN works on all columns",
        "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table (with NULLs for non-matches)",
        "LEFT JOIN deletes unlinked records",
        "INNER JOIN sorts the output in ascending order automatically"
      ],
      answer: "B",
      explanation: "INNER JOIN preserves only rows where the join condition matches in both tables. LEFT OUTER JOIN retains every record from the left table, filling in NULL values for columns from the right table whenever no match exists."
    },
    {
      id: "sql-2",
      topic: "SQL Indexing",
      question: "Why does a B-Tree index significantly speed up range queries (e.g. WHERE salary BETWEEN 50000 AND 80000)?",
      options: [
        "Because it stores all table data into RAM cache",
        "Because leaf nodes contain keys in sorted order and are interconnected via doubly linked lists, allowing efficient sequential range traversal after locating the lower bound",
        "Because it hashes every possible range query at database startup",
        "Because it drops table constraints during execution"
      ],
      answer: "B",
      explanation: "B+Tree leaf nodes are maintained in sorted order and chained together with doubly linked pointers. Once the starting key is located via logarithmic descent, the engine simply scans sequentially along the leaf nodes."
    },
    {
      id: "sql-3",
      topic: "SQL Window Functions",
      question: "What is the difference between RANK() and DENSE_RANK() in SQL when handling tied values?",
      options: [
        "RANK() skips subsequent rank numbers after ties (e.g., 1, 2, 2, 4); DENSE_RANK() does not skip numbers (e.g., 1, 2, 2, 3)",
        "DENSE_RANK() only works on unique values",
        "RANK() is an aggregate function; DENSE_RANK() is a scalar function",
        "DENSE_RANK() sorts descending, while RANK() sorts ascending"
      ],
      answer: "A",
      explanation: "When duplicates occur, RANK() introduces gaps in the ranking sequence corresponding to the number of ties (1, 2, 2, 4). DENSE_RANK() maintains unbroken consecutive rank integers without any gaps (1, 2, 2, 3)."
    },
    {
      id: "sql-4",
      topic: "SQL ACID Properties",
      question: "What does the 'I' (Isolation) in ACID transaction properties ensure?",
      options: [
        "The database runs isolated on a standalone physical server",
        "Concurrent transactions execute without interfering with one another, preventing dirty reads or inconsistent intermediate states",
        "Transactions cannot be rolled back once initialized",
        "Disk input/output is isolated from CPU processing"
      ],
      answer: "B",
      explanation: "Isolation guarantees that concurrently executing transactions are isolated from each other's uncommitted intermediate modifications, controlled by isolation levels (e.g., Read Committed, Repeatable Read, Serializable)."
    },
    {
      id: "sql-5",
      topic: "SQL Grouping & Filtering",
      question: "What is the fundamental difference between WHERE and HAVING clauses in an SQL query?",
      options: [
        "WHERE filters rows BEFORE aggregation; HAVING filters aggregated group results AFTER the GROUP BY clause",
        "WHERE only filters numbers; HAVING only filters text",
        "HAVING is executed before joins; WHERE is executed after joins",
        "There is no difference; HAVING is an alias for WHERE"
      ],
      answer: "A",
      explanation: "The WHERE clause filters individual records before grouping occurs (it cannot evaluate aggregate functions like SUM or COUNT). HAVING filters the aggregated summary groups created by GROUP BY."
    },
    {
      id: "sql-6",
      topic: "SQL Transaction Isolation",
      question: "What is a 'Dirty Read' in database concurrency?",
      options: [
        "Reading data that has been corrupted by disk sectors",
        "A transaction reading uncommitted data written by another concurrent transaction that might later be rolled back",
        "Reading from an outdated secondary replica",
        "A query scanning rows without an index"
      ],
      answer: "B",
      explanation: "A dirty read occurs at the Read Uncommitted isolation level when Transaction A reads modifications made by Transaction B before B has committed. If B rolls back, Transaction A operated on invalid data that never existed."
    },
    {
      id: "sql-7",
      topic: "SQL Normalization",
      question: "What condition must a database table satisfy to be in Third Normal Form (3NF)?",
      options: [
        "It must be in 2NF and have no transitive functional dependencies (non-key attributes must depend only on the primary key)",
        "It must contain no foreign keys",
        "All columns must have unique indexes",
        "Tables must not exceed 10 columns"
      ],
      answer: "A",
      explanation: "3NF requires that a relation is in 2NF and that no non-prime attribute is transitively dependent on the primary key. In simple terms: every non-key attribute must depend on the key, the whole key, and nothing but the key."
    },
    {
      id: "sql-8",
      topic: "SQL Query Execution Plans",
      question: "What does the SQL command 'EXPLAIN ANALYZE SELECT ...' do in PostgreSQL/MySQL?",
      options: [
        "Formats the SQL code with pretty indentation",
        "Executes the query, displays the query planner's execution steps (index scans, seq scans, joins), and outputs actual runtime execution timings",
        "Creates a backup of the affected tables",
        "Translates the SQL statement into C++ code"
      ],
      answer: "B",
      explanation: "EXPLAIN displays the optimizer's estimated execution plan. EXPLAIN ANALYZE actually executes the query to measure exact node timings, rows processed, and buffer usage, exposing bottlenecks like sequential scans."
    },
    {
      id: "sql-9",
      topic: "SQL Clustered vs Non-Clustered Indexes",
      question: "How does a Clustered Index differ from a Non-Clustered Index?",
      options: [
        "A clustered index physically dictates the on-disk storage order of the actual table rows (hence only one per table); non-clustered indexes store sorted pointers to rows",
        "Non-clustered indexes store table rows; clustered indexes store views",
        "A table can have up to 10 clustered indexes but only 1 non-clustered index",
        "Clustered indexes only work with string columns"
      ],
      answer: "A",
      explanation: "Because physical rows can only be sorted in one order on disk, a table can possess only ONE clustered index (usually the primary key). Non-clustered indexes are auxiliary structures containing indexed values and row pointers."
    },
    {
      id: "sql-10",
      topic: "SQL Delete vs Truncate",
      question: "What is the primary difference between DELETE FROM table and TRUNCATE TABLE?",
      options: [
        "DELETE is a DML statement that removes rows one by one and logs each deletion (supporting rollback); TRUNCATE is a DDL statement that deallocates data pages rapidly with minimal logging",
        "DELETE drops the table schema; TRUNCATE preserves the schema",
        "TRUNCATE allows WHERE clauses; DELETE does not",
        "DELETE is faster than TRUNCATE on large tables"
      ],
      answer: "A",
      explanation: "DELETE scans and logs every deleted row individually, invoking triggers and consuming transaction logs. TRUNCATE is a DDL operation that deallocates entire data pages instantly, resets identity counters, and cannot use a WHERE clause."
    },
    {
      id: "sql-11",
      topic: "SQL Common Table Expressions (CTEs)",
      question: "What is a Common Table Expression (CTE) defined with the 'WITH' keyword in SQL?",
      options: [
        "A temporary named result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE query",
        "A permanent stored procedure saved in the system catalog",
        "A database trigger executing before writes",
        "A foreign key constraint spanning multiple schemas"
      ],
      answer: "A",
      explanation: "A CTE (WITH cte_name AS (...)) creates a readable temporary result set that exists only for the duration of the query. Recursive CTEs also allow traversing hierarchical or graph data (like org charts)."
    },
    {
      id: "sql-12",
      topic: "SQL Constraints",
      question: "What is the difference between a PRIMARY KEY and a UNIQUE constraint in SQL?",
      options: [
        "A table can have multiple PRIMARY KEYs but only one UNIQUE constraint",
        "A table can have only one PRIMARY KEY (which cannot accept NULLs), but can have multiple UNIQUE constraints (which allow NULL values)",
        "UNIQUE constraints encrypt data; PRIMARY KEYs do not",
        "PRIMARY KEY only applies to integer types"
      ],
      answer: "B",
      explanation: "A table has at most one PRIMARY KEY, which strictly forbids NULLs and automatically creates a clustered index in many engines. A table can have multiple UNIQUE constraints, which enforce uniqueness while permitting NULLs."
    },
    {
      id: "sql-13",
      topic: "SQL Deadlocks",
      question: "How does a relational database management system (RDBMS) typically resolve a deadlock between two transactions?",
      options: [
        "It crashes the server",
        "It detects the cyclic wait-for dependency, selects one transaction as a victim, rolls it back, and allows the other transaction to proceed",
        "It pauses both transactions forever",
        "It combines both transactions into a single thread"
      ],
      answer: "B",
      explanation: "The RDBMS deadlock detector maintains a wait-for graph. When a cycle is found (Tx A waits on Tx B while Tx B waits on Tx A), it chooses the transaction with lower cost as the victim, rolls it back, and throws a deadlock error to the client."
    },
    {
      id: "sql-14",
      topic: "SQL Union vs Union All",
      question: "What is the performance difference between UNION and UNION ALL?",
      options: [
        "UNION ALL is faster because it concatenates result sets without running a distinct sort operation to eliminate duplicates; UNION removes duplicates",
        "UNION is faster because it indexes both queries",
        "UNION ALL only works on numerical columns",
        "There is no difference in execution speed"
      ],
      answer: "A",
      explanation: "UNION combines results and performs a distinct sort/hash operation to filter out duplicate rows. UNION ALL simply appends results without checking for duplicates, making it substantially faster for large datasets."
    },
    {
      id: "sql-15",
      topic: "SQL Views vs Materialized Views",
      question: "How does a Materialized View differ from a standard SQL View?",
      options: [
        "A standard view is a saved virtual query re-executed on every read; a materialized view physically stores query results on disk and must be refreshed",
        "A materialized view cannot be queried with SELECT",
        "A standard view is stored on disk; a materialized view is strictly in RAM",
        "Materialized views cannot use joins"
      ],
      answer: "A",
      explanation: "A standard VIEW is virtual: the underlying SQL runs each time you query it. A MATERIALIZED VIEW caches the physical query results on disk, delivering instant reads at the cost of requiring periodic REFRESH MATERIALIZED VIEW."
    },
    {
      id: "sql-16",
      topic: "SQL Partitioning",
      question: "What is Table Partitioning in high-volume SQL databases?",
      options: [
        "Splitting a single logical table into smaller physical underlying storage segments (by range, list, or hash) to optimize query pruning and maintenance",
        "Dividing columns between different microservices",
        "Running the database across multiple CPU sockets",
        "Encrypting database backups into distinct zip files"
      ],
      answer: "A",
      explanation: "Table partitioning splits a large table into distinct physical partitions (e.g. by date ranges). When queries filter on the partition key, partition pruning skips reading unneeded partitions, boosting query performance."
    },
    {
      id: "sql-17",
      topic: "SQL NULL Handling",
      question: "What does the expression 'SELECT NULL = NULL;' evaluate to in standard SQL?",
      options: [
        "TRUE",
        "FALSE",
        "UNKNOWN / NULL",
        "Syntax error"
      ],
      answer: "C",
      explanation: "In SQL three-valued logic (TRUE, FALSE, UNKNOWN), NULL represents an unknown value. You cannot compare unknown values with '='. To test for NULL, you must use 'IS NULL' or 'IS NOT NULL'."
    },
    {
      id: "sql-18",
      topic: "SQL Phantom Reads",
      question: "Which SQL transaction isolation level prevents Phantom Reads?",
      options: [
        "Read Uncommitted",
        "Read Committed",
        "Repeatable Read",
        "Serializable"
      ],
      answer: "D",
      explanation: "A phantom read occurs when a transaction queries a range of rows twice, and a concurrent transaction inserts new matching rows in between. The strict Serializable isolation level (or range locks) prevents phantom reads."
    },
    {
      id: "sql-19",
      topic: "SQL Write-Ahead Logging (WAL)",
      question: "What is the primary role of Write-Ahead Logging (WAL) in database durability and crash recovery?",
      options: [
        "Logging all user passwords for auditing",
        "Ensuring changes are written to append-only sequential log storage on disk BEFORE they are applied to data pages, allowing recovery after crashes",
        "Compressing query text to save network bandwidth",
        "Blocking read traffic during updates"
      ],
      answer: "B",
      explanation: "WAL ensures that transaction log records describing changes are flushed to durable storage before dirty data pages are flushed. If the system crashes, the database replays the WAL to reconstruct consistent state."
    },
    {
      id: "sql-20",
      topic: "SQL Correlated Subqueries",
      question: "What characterizes a Correlated Subquery in SQL?",
      options: [
        "A subquery that can run entirely independent of the outer query",
        "A subquery that references columns from the outer query, evaluating once for each row processed by the outer query",
        "A subquery that only returns boolean true/false",
        "A query running inside a separate database engine"
      ],
      answer: "B",
      explanation: "A correlated subquery references values from the outer query's current row. Because it depends on the outer row for each step, it must be evaluated repeatedly for each candidate row (unless optimized into a join)."
    }
  ],

  general: [
    {
      id: "cs-1",
      topic: "Operating Systems",
      question: "Which of the following is NOT a valid CPU scheduling algorithm?",
      options: [
        "Round Robin",
        "First In First Out",
        "Shortest Job First",
        "Least Recently Used (LRU)"
      ],
      answer: "D",
      explanation: "Least Recently Used (LRU) is a cache and virtual memory page replacement algorithm, not a CPU scheduling policy."
    },
    {
      id: "cs-2",
      topic: "Operating Systems & Deadlocks",
      question: "Which of the following is NOT one of the four necessary Coffman conditions for a Deadlock to occur?",
      options: [
        "Mutual Exclusion",
        "Hold and Wait",
        "Preemption Allowed",
        "Circular Wait"
      ],
      answer: "C",
      explanation: "The four conditions for deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly taken), and 4. Circular Wait. If preemption is allowed, deadlocks cannot persist."
    },
    {
      id: "cs-3",
      topic: "Computer Networks & OSI Model",
      question: "At which layer of the OSI model does the TCP protocol operate?",
      options: [
        "Network Layer",
        "Transport Layer",
        "Session Layer",
        "Data Link Layer"
      ],
      answer: "B",
      explanation: "TCP operates at Layer 4 (Transport Layer), providing reliable, ordered, error-checked, flow-controlled delivery of streams of bytes between applications."
    },
    {
      id: "cs-4",
      topic: "Computer Networks & TCP Handshake",
      question: "What packets are exchanged during the standard TCP 3-way handshake to establish a connection?",
      options: [
        "SYN -> SYN-ACK -> ACK",
        "ACK -> SYN -> FIN",
        "HELLO -> READY -> CONNECT",
        "SYN -> ACK -> DATA"
      ],
      answer: "A",
      explanation: "Client sends SYN (synchronize sequence number). Server responds with SYN-ACK (synchronize and acknowledge client's SYN). Client sends ACK back to the server, establishing the connection."
    },
    {
      id: "cs-5",
      topic: "Virtual Memory & Paging",
      question: "What is 'Thrashing' in an Operating System?",
      options: [
        "When the CPU temperature exceeds safe limits",
        "A state where the system spends significantly more time swapping pages in and out of secondary storage than executing actual application instructions",
        "When two processes try to write to the same sector simultaneously",
        "A network card dropping packets due to bandwidth limits"
      ],
      answer: "B",
      explanation: "Thrashing occurs when the active working set of memory pages across processes exceeds available physical RAM. The OS continuously faults and swaps pages to and from disk, causing system performance to collapse."
    },
    {
      id: "cs-6",
      topic: "Data Structures & Big-O",
      question: "What is the worst-case time complexity of finding an element in a binary search tree (BST) that is completely unbalanced (skewed)?",
      options: [
        "O(1)",
        "O(log N)",
        "O(N)",
        "O(N log N)"
      ],
      answer: "C",
      explanation: "In an unbalanced BST, every node has only one child, degrading the tree into a linear linked list where searching requires scanning all N elements: O(N)."
    },
    {
      id: "cs-7",
      topic: "System Design & CAP Theorem",
      question: "According to Eric Brewer's CAP Theorem, what can a distributed data store guarantee in the presence of a network partition (P)?",
      options: [
        "Both Consistency (C) and Availability (A) simultaneously",
        "Either Consistency (CP system) OR Availability (AP system), but NOT both",
        "Neither Consistency nor Availability",
        "Infinite horizontal scalability"
      ],
      answer: "B",
      explanation: "When network communication between nodes fails (a partition P occurs), the system must choose between remaining available to writes while serving stale data (Availability - AP) or rejecting writes to maintain strict accuracy (Consistency - CP)."
    },
    {
      id: "cs-8",
      topic: "Web Protocols & HTTP/2",
      question: "What major performance advancement did HTTP/2 introduce over HTTP/1.1?",
      options: [
        "Eliminated the need for SSL/TLS certificates",
        "Multiplexing multiple bidirectional requests/responses over a single TCP connection, eliminating head-of-line blocking at the application layer",
        "Replacing JSON with XML formatting",
        "Disabling cookies across all browsers"
      ],
      answer: "B",
      explanation: "HTTP/2 introduces binary framing and multiplexing, allowing multiple concurrent requests and responses over a single TCP connection without waiting for prior requests to finish, resolving HTTP/1.1 head-of-line blocking."
    },
    {
      id: "cs-9",
      topic: "DNS Resolution Flow",
      question: "What type of DNS record maps a domain name directly to an IPv4 address?",
      options: [
        "CNAME Record",
        "A Record",
        "MX Record",
        "TXT Record"
      ],
      answer: "B",
      explanation: "An 'A' (Address) record maps a hostname directly to its corresponding 32-bit IPv4 address (e.g. example.com -> 93.184.216.34). A 'AAAA' record maps to an IPv6 address."
    },
    {
      id: "cs-10",
      topic: "System Design & Caching",
      question: "In caching strategies, what is the 'Cache-Aside' (Lazy Loading) pattern?",
      options: [
        "The application reads directly from cache; on a cache miss, it fetches data from database, writes it to cache, and returns it to the client",
        "The database updates the cache synchronously before committing",
        "The cache permanently stores all data without expiry",
        "Data is only cached during server shutdowns"
      ],
      answer: "A",
      explanation: "Under Cache-Aside, the application first requests the key from the cache. On a miss, the application loads the data from the datastore, stores it in the cache for future requests, and returns it."
    },
    {
      id: "cs-11",
      topic: "Operating Systems: Process vs Thread",
      question: "What is the primary difference in resource sharing between processes and threads?",
      options: [
        "Processes share the same virtual address space; threads have independent memory",
        "Processes have independent virtual address spaces and memory protection; threads in the same process share code, heap, and open files, but have private stacks",
        "Threads cannot run on multi-core processors",
        "A process cannot contain more than one thread"
      ],
      answer: "B",
      explanation: "Processes run in isolated address spaces. Threads within the same process share heap memory, global variables, and file descriptors, while maintaining their own private stack and program counter."
    },
    {
      id: "cs-12",
      topic: "System Design: Load Balancing",
      question: "Which load balancing algorithm selects servers based on maintaining a hash of the client's IP address to ensure a user repeatedly reaches the same backend?",
      options: [
        "Round Robin",
        "Least Connection",
        "IP Hash / Consistent Hashing",
        "Random Weighted"
      ],
      answer: "C",
      explanation: "IP Hash uses the client's IP address to compute a hash that maps to a specific server. This maintains session affinity (sticky sessions) without storing server-side session mappings."
    },
    {
      id: "cs-13",
      topic: "Computer Networks: HTTPS & TLS",
      question: "How does the TLS/SSL handshake establish secure communication between a client and server?",
      options: [
        "It uses asymmetric encryption to securely negotiate and exchange a shared symmetric session key, which is then used for fast symmetric data encryption",
        "It uses symmetric encryption exclusively from start to finish",
        "It sends plaintext keys through an unencrypted UDP channel",
        "It encrypts only HTTP headers while leaving the body public"
      ],
      answer: "A",
      explanation: "Asymmetric public-key cryptography (RSA or Elliptic Curves) authenticates the server and securely negotiates a shared symmetric key. Faster symmetric encryption (like AES-GCM) is then used to encrypt the actual payload data."
    },
    {
      id: "cs-14",
      topic: "Algorithms: Graph Traversal",
      question: "Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) in a graph?",
      options: [
        "Stack",
        "Queue (FIFO)",
        "Priority Queue",
        "Hash Map only"
      ],
      answer: "B",
      explanation: "Breadth-First Search traverses level by level, utilizing a FIFO Queue to process vertices in the exact order they are discovered. Depth-First Search (DFS) uses a Stack (or function recursion)."
    },
    {
      id: "cs-15",
      topic: "Security: Cross-Origin Resource Sharing (CORS)",
      question: "What causes a browser to issue a CORS 'preflight' (OPTIONS) request?",
      options: [
        "Whenever a cross-origin request uses HTTP methods other than GET/POST/HEAD, or includes custom headers or non-standard Content-Types",
        "Whenever the browser is running in Incognito mode",
        "Whenever an image tag loads a PNG",
        "Only when the server is down"
      ],
      answer: "A",
      explanation: "For non-simple cross-origin HTTP requests (e.g. PUT, DELETE, PATCH, or headers like Authorization or application/json), browsers send an automatic HTTP OPTIONS preflight request to confirm whether the server permits the operation."
    },
    {
      id: "cs-16",
      topic: "System Design: Database Sharding",
      question: "What is Database Sharding in high-scale architectures?",
      options: [
        "Horizontally partitioning data rows across multiple independent physical database instances according to a shard key",
        "Duplicating tables into separate columns",
        "Running read replicas without writes",
        "Creating database backups onto external tapes"
      ],
      answer: "A",
      explanation: "Sharding is a horizontal scaling technique where a large database is divided into smaller subsets (shards) distributed across distinct servers. Queries route to the appropriate shard using a shard key hash."
    },
    {
      id: "cs-17",
      topic: "Algorithms: Sorting",
      question: "Which of the following sorting algorithms is guaranteed to run in O(N log N) time even in the WORST case?",
      options: [
        "Quicksort",
        "Mergesort",
        "Bubble Sort",
        "Selection Sort"
      ],
      answer: "B",
      explanation: "Mergesort consistently divides the array in half and merges sorted halves, guaranteeing O(N log N) time complexity in worst, average, and best cases (unlike standard Quicksort which degrades to O(N^2) if the pivot is poor)."
    },
    {
      id: "cs-18",
      topic: "Operating Systems: Semaphores vs Mutex",
      question: "What is the key difference between a Binary Semaphore and a Mutex?",
      options: [
        "A Mutex has the concept of ownership (only the thread that locked it can unlock it); a Semaphore can be signaled/unlocked by any thread",
        "A semaphore only works on 64-bit systems",
        "A Mutex can take any integer value; a semaphore can only be 0",
        "There is no difference"
      ],
      answer: "A",
      explanation: "A Mutex is a locking mechanism with strict ownership: only the thread that acquired the lock may release it. A Semaphore is a signaling mechanism (e.g., counting semaphore); another thread can signal/post to wake up a waiting thread."
    },
    {
      id: "cs-19",
      topic: "System Design: Rate Limiting",
      question: "Which rate limiting algorithm allows bursts of requests up to a maximum capacity while refilling capacity at a steady constant rate?",
      options: [
        "Token Bucket Algorithm",
        "Fixed Window Counter",
        "Random Drop Algorithm",
        "Linear Search Limiter"
      ],
      answer: "A",
      explanation: "The Token Bucket algorithm adds tokens to a bucket at a fixed rate. When requests arrive, they consume a token. If the bucket has accumulated tokens, it comfortably accommodates sudden bursts without rejecting traffic."
    },
    {
      id: "cs-20",
      topic: "System Design: Microservices Communication",
      question: "What is the key architectural advantage of using an Asynchronous Message Queue (like Apache Kafka or RabbitMQ) between microservices?",
      options: [
        "Decoupling producer and consumer services, absorbing traffic spikes (backpressure), and ensuring message delivery even if consumers are temporarily down",
        "Eliminating the need for a database",
        "Encrypting all hard drives automatically",
        "Preventing duplicate HTTP GET requests"
      ],
      answer: "A",
      explanation: "Message queues decouple distributed services in both space and time. Producers publish messages without waiting for consumers to process them, leveling load spikes and providing reliable retry mechanisms."
    }
  ]
};

// Flattened initial list containing all questions for global search / default
export const INITIAL_MCQS: McqQuestion[] = [
  ...MCQ_BANK.general,
  ...MCQ_BANK.python,
  ...MCQ_BANK.java,
  ...MCQ_BANK.cpp,
  ...MCQ_BANK.javascript,
  ...MCQ_BANK.sql
];
