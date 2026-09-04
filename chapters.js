// Add new notes here. The sidebar and page navigation update automatically.
window.BOOK_CHAPTERS = [
  {
    id: "java-objects",
    number: "01",
    title: "Day 1 — Modeling Immutable Java Data",
    subtitle: "Encapsulation, records, enums, constructors, and assertions",
    day: "Day 1",
    source: "Coding with John · Dev.java · java-katas/day01-job-model",
    topics: [
      {
        id: "private-fields",
        title: "Why private fields and public getters?",
        summary: "Private fields let an object control its own state. A getter grants permission to observe a value without granting permission to replace it.",
        sections: [
          {
            heading: "The tempting version",
            body: [
              "A public field looks simpler: callers can read and write it directly. The cost is that the object loses the ability to protect its rules.",
              "Any caller can assign null, an invalid value, or change the field at the wrong point in the object's lifecycle."
            ],
            code: `public class Job {
    public String status;
}

job.status = null;
job.status = "banana";`
          },
          {
            heading: "Put changes through a doorway",
            body: [
              "With a private field, outside code must use a method. That method becomes a doorway where the class can validate, reject, calculate, log, or coordinate a change.",
              "Even if today's getter is simple, callers depend on the method contract rather than the field's storage details."
            ],
            code: `public class Job {
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status cannot be blank");
        }
        this.status = status;
    }
}`
          },
          {
            heading: "A setter is not always the answer",
            body: [
              "A setter that accepts any value is only a thin improvement over a public field. Often the better design is to expose an action that says what is happening.",
              "Methods such as start() and complete() make valid transitions explicit and keep the workflow inside the Job object."
            ],
            code: `public class Job {
    private JobStatus status = JobStatus.CREATED;

    public JobStatus getStatus() {
        return status;
    }

    public void start() {
        if (status != JobStatus.CREATED) {
            throw new IllegalStateException("Only a created job can start");
        }
        status = JobStatus.RUNNING;
    }
}`
          }
        ],
        takeaway: "Private state is not about secrecy. It gives the object authority over how it stays valid.",
        checklist: [
          "Does outside code need to read this field? Add a getter only if yes.",
          "Should outside code freely replace it? Add a setter only if that is truly valid.",
          "Is it fixed after construction? Make it final and provide no setter.",
          "Does changing it represent an action? Prefer a method such as start(), assignTo(), or complete()."
        ],
        questions: [
          {
            prompt: "Why is a private field with a blind setter only slightly better than a public field?",
            answer: "Both allow callers to replace the value freely. The method adds a place for future rules, but it does not currently protect an invariant."
          },
          {
            prompt: "What is the difference between getStatus() and start()?",
            answer: "getStatus() permits observation. start() represents behaviour and controls a valid state transition."
          }
        ]
      },
      {
        id: "instance-and-static",
        title: "Instance vs static: who owns this member?",
        summary: "Instance members belong to a particular object. Static members belong to the class itself and are shared by all of its objects.",
        sections: [
          {
            heading: "Start with ownership",
            body: [
              "The easiest way to understand instance and static is to ask: who owns this value or behaviour? An instance member belongs to one particular object. A static member belongs to the class as a whole.",
              "Each Job object needs its own title and status, so those are instance fields. A count of how many Job objects have been created describes the whole Job class, so it can be a static field."
            ],
            code: `public class Job {
    private String title;          // one value per Job object
    private JobStatus status;      // one value per Job object

    private static int jobCount;   // one value shared by all Jobs
}`
          },
          {
            heading: "Instance fields: every object gets its own copy",
            body: [
              "Calling new Job(...) creates a new object with its own instance fields. Changing firstJob.title does not change secondJob.title because the fields belong to different objects.",
              "Use instance fields when the value describes the individual object: a job's title, identifier, status, owner, or creation time."
            ],
            code: `Job firstJob = new Job("Import transactions");
Job secondJob = new Job("Generate statement");

System.out.println(firstJob.getTitle());
// Import transactions

System.out.println(secondJob.getTitle());
// Generate statement`
          },
          {
            heading: "Static fields: one value shared by the class",
            body: [
              "A static field is created for the class rather than separately for every object. If one Job changes jobCount, every Job observes the same shared value.",
              "Shared mutable state deserves caution. A simple counter is useful for learning, but concurrent production code would need thread-safety and may be better served by another component responsible for IDs or persistence."
            ],
            code: `public class Job {
    private static int jobCount = 0;
    private final String title;

    public Job(String title) {
        this.title = title;
        jobCount++;
    }

    public static int getJobCount() {
        return jobCount;
    }
}

new Job("Import transactions");
new Job("Generate statement");

System.out.println(Job.getJobCount()); // 2`
          },
          {
            heading: "Instance methods have a this object",
            body: [
              "An instance method is called on an object. Inside it, this means the particular object that received the call. That is why getTitle() can directly read the instance field title.",
              "An instance method can use both instance members and static members: it knows which object it is working with, and it can also see information shared by the class."
            ],
            code: `public String getTitle() {
    return this.title;
}

public String describe() {
    return this.title + " (jobs created: " + jobCount + ")";
}

Job job = new Job("Import transactions");
System.out.println(job.getTitle()); // called on an object`
          },
          {
            heading: "Static methods have no this object",
            body: [
              "A static method is called on the class. No particular Job object is involved, so there is no this. It can directly use static fields and methods, but it cannot directly read title because Java would not know which Job's title you mean.",
              "A static method can still work with an instance when it receives that object as a parameter. The important point is that the object must be made explicit."
            ],
            code: `public static int getJobCount() {
    return jobCount;       // valid: static field
}

public static String titleOf(Job job) {
    return job.getTitle(); // valid: an object was supplied
}

public static String broken() {
    return title;          // compile error: which Job?
}`
          },
          {
            heading: "Why is main static?",
            body: [
              "When a Java program starts, the JVM needs an entry point before your application has created any objects. Because main is static, the JVM can call it on the class itself.",
              "From main, you normally create objects and then call their instance methods. Static does not mean globally better or faster; it means no object instance is required for that member."
            ],
            code: `public class JobApplication {
    public static void main(String[] args) {
        Job job = new Job("Import transactions");
        System.out.println(job.getTitle());
    }
}

// Conceptually, the JVM can start with:
// JobApplication.main(args);`
          },
          {
            heading: "Good uses and common traps",
            body: [
              "Static works well for true class-wide constants and small stateless utility methods. Constants are usually static final because there should be one shared value that cannot be reassigned.",
              "Avoid making a field static merely so it is easy to access. Mutable static fields introduce global state: distant code can affect every object, tests can influence one another, and concurrent changes can collide. Start with instance state unless the concept genuinely belongs to the class."
            ],
            code: `public class Job {
    public static final int MAX_TITLE_LENGTH = 100;

    public static boolean isValidTitle(String title) {
        return title != null
            && !title.isBlank()
            && title.length() <= MAX_TITLE_LENGTH;
    }
}

if (Job.isValidTitle("Import transactions")) {
    // create the Job
}`
          }
        ],
        takeaway: "Instance means one per object; static means one per class. Choose by ownership, not convenience.",
        checklist: [
          "Does this value describe one particular object? Make it an instance field.",
          "Does this behaviour require a particular object's state? Make it an instance method.",
          "Does the value genuinely belong to the class as a whole? Static may be appropriate.",
          "Is a shared value meant to be constant? Prefer static final.",
          "Am I using static only to make access easier? That may be hidden global state.",
          "Inside a static method, which object would this instance field come from? If there is no answer, pass an object or use an instance method."
        ],
        questions: [
          {
            prompt: "If two Job objects have different titles, should title be instance or static? Why?",
            answer: "Instance. Each title describes one particular Job, so every Job needs its own copy."
          },
          {
            prompt: "Why can an instance method read a static field, while a static method cannot directly read an instance field?",
            answer: "An instance method has a specific this object and also knows its class. A static method has the class but no particular object, so Java cannot determine which object's field to read."
          },
          {
            prompt: "What does static mean in public static void main?",
            answer: "The JVM can call main on the class without first constructing an object of that class."
          },
          {
            prompt: "Why can mutable static fields become dangerous?",
            answer: "They create shared global state. Changes affect all objects and can make tests, concurrency, and the origin of a change harder to reason about."
          }
        ]
      },
      {
        id: "java-records",
        title: "Records: data without the boilerplate",
        summary: "A Java record declares the shape of an immutable data carrier and lets the compiler generate the repetitive machinery that shape requires.",
        sections: [
          {
            heading: "The problem records solve",
            body: [
              "A traditional data-holding class needs private fields, a constructor, accessors, toString(), equals(), and hashCode(). Most of that code describes plumbing rather than business meaning.",
              "A record starts from the opposite direction: declare the data that makes up the value, and let Java generate the standard implementation. This makes the important part—the data contract—easy to see."
            ],
            code: `public final class EmployeeClass {
    private final String name;
    private final int employeeNumber;

    // constructor, accessors, equals,
    // hashCode, and toString still needed
}

public record EmployeeRecord(
    String name,
    int employeeNumber
) {}`
          },
          {
            heading: "Components define the record",
            body: [
              "The items inside the record header are called components. For each component, Java creates a private final field and a public accessor with the same name.",
              "Record accessors do not use the JavaBean get prefix. If the component is name, the accessor is name(), not getName()."
            ],
            code: `public record EmployeeRecord(
    String name,
    int employeeNumber
) {}

EmployeeRecord employee =
    new EmployeeRecord("Yash", 3034);

System.out.println(employee.name());
System.out.println(employee.employeeNumber());`
          },
          {
            heading: "Generated value behaviour",
            body: [
              "Java generates a readable toString() containing the record name and components. It also generates equals() and hashCode() from every component.",
              "That gives records value semantics: two records of the same type are equal when all their component values are equal. A traditional class keeps identity-based equality unless you implement those methods yourself."
            ],
            code: `EmployeeRecord first =
    new EmployeeRecord("Yash", 3034);
EmployeeRecord second =
    new EmployeeRecord("Yash", 3034);

assert first.equals(second);
assert first.hashCode() == second.hashCode();

System.out.println(first);
// EmployeeRecord[name=Yash, employeeNumber=3034]`
          },
          {
            heading: "Immutable by default—not magically deep",
            body: [
              "Record component fields are final and records generate no setters, so a component cannot be reassigned after construction. The record class itself is also final.",
              "This is shallow immutability. If a component refers to a mutable list or array, that object can still change unless the record makes a defensive copy. Strings, enums, and primitive values are safe components for the Day 1 Job."
            ],
            code: `public record Job(
    String id,
    String name,
    JobStatus status
) {}

Job job = new Job("ZE3034", "Yash", JobStatus.SUBMITTED);

// There is no job.setStatus(...).
// To represent another state, create another Job value.`
          },
          {
            heading: "Canonical, compact, and additional constructors",
            body: [
              "The canonical constructor accepts every record component in header order. Java generates it unless you define it yourself.",
              "A compact constructor is the record-specific shortcut for validating or normalizing those component values. It omits the parameter list and field assignments because Java supplies them. An additional constructor may accept a different parameter list, but in Java 21 its call to this(...) must be the first statement."
            ],
            code: `public record Job(
    String id,
    String name,
    JobStatus status
) {
    public Job {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("id cannot be blank");
        }
    }

    public Job(String id, String name) {
        this(id, name, JobStatus.SUBMITTED);
    }
}`
          },
          {
            heading: "Records are still classes—with boundaries",
            body: [
              "A record may define instance methods, static methods, and static fields. It may implement interfaces. These capabilities let a data value expose behaviour that genuinely belongs to that value.",
              "A record cannot declare extra instance fields outside its components, cannot extend another class, and cannot be extended because it is implicitly final. Those restrictions keep its declared state honest and complete."
            ],
            code: `public record EmployeeRecord(String name) {
    public String uppercaseName() {
        return name.toUpperCase();
    }

    public static boolean isValidName(String name) {
        return name != null && !name.isBlank();
    }
}`
          }
        ],
        takeaway: "Use a record when the important truth is the data value itself and that value should not be reassigned after construction.",
        checklist: [
          "Are the components the complete state of this value?",
          "Does the type mainly carry data rather than manage a changing identity?",
          "Do I want value-based equals(), hashCode(), and toString()?",
          "Are all components immutable, or do mutable components need defensive copies?",
          "Does validation belong in the compact canonical constructor?",
          "Would an ordinary class communicate the lifecycle or behaviour more honestly?"
        ],
        questions: [
          {
            prompt: "What does Java generate from a record component?",
            answer: "A private final field, a same-named public accessor, and participation in the canonical constructor, toString(), equals(), and hashCode()."
          },
          {
            prompt: "Why is a record accessor name() rather than getName()?",
            answer: "Record accessors use the component name directly; they are not generated as JavaBean-style getters."
          },
          {
            prompt: "Does a record guarantee deep immutability?",
            answer: "No. Its component references cannot be reassigned, but an object referenced by a component may still be mutable unless it is copied or otherwise protected."
          },
          {
            prompt: "What is special about a compact constructor?",
            answer: "It validates or normalizes canonical component values without repeating the parameter list or assigning fields; the compiler completes those assignments."
          }
        ]
      },
      {
        id: "day01-job-kata",
        title: "The Job kata: requirements become invariants and tests",
        summary: "The Day 1 exercise turned record syntax into engineering practice: model legal values, establish a valid starting state, reject invalid construction, and prove each rule.",
        sections: [
          {
            heading: "Translate prose into observable rules",
            body: [
              "The exercise contained several separate requirements: four legal statuses, an immutable Job, non-blank identity fields, a default initial state, and executable assertions.",
              "Separating those requirements prevents one check from accidentally standing in for another. Each rule should have one clear implementation point and at least one observation that could prove it."
            ],
            code: `// Requirements become questions:
// 1. Is Job immutable?
// 2. Are only known statuses representable?
// 3. Does new Job(id, name) start SUBMITTED?
// 4. Are blank id and name rejected?
// 5. Do assertions prove those behaviours?`
          },
          {
            heading: "An enum creates a legal vocabulary",
            body: [
              "JobStatus replaces arbitrary strings with four compiler-checked values. A typo cannot quietly become a fifth status.",
              "The phrase 'new jobs start SUBMITTED' describes the creation path, not a permanent restriction on every Job value. Rejecting RUNNING, SUCCEEDED, and FAILED would make most of the enum unusable. An immutable later snapshot can carry one of those later statuses."
            ],
            code: `public enum JobStatus {
    SUBMITTED,
    RUNNING,
    SUCCEEDED,
    FAILED
}

Job submitted = new Job("ZE3034", "Yash");

Job running = new Job(
    submitted.id(),
    submitted.name(),
    JobStatus.RUNNING
);`
          },
          {
            heading: "Constructor delegation creates one validation doorway",
            body: [
              "The two-argument constructor expresses the normal new-job operation and delegates to the canonical constructor with SUBMITTED.",
              "In Java 21, this(...) must be the first constructor statement. Validation therefore belongs in the compact canonical constructor, which every construction path reaches. This avoids duplicating rules or letting one constructor bypass them."
            ],
            code: `public Job(String id, String name) {
    this(id, name, JobStatus.SUBMITTED);
}

public Job {
    // Every constructor path arrives here.
    // Validate the complete candidate state once.
}`
          },
          {
            heading: "Reject invalid state deliberately",
            body: [
              "Null, empty, and whitespace-only text are different inputs. Checking for null before isBlank() prevents an accidental NullPointerException; isBlank() then covers both empty and whitespace-only strings.",
              "IllegalArgumentException communicates that construction failed because a supplied argument violated the Job contract. Status is checked separately because a Job with no status would not have a meaningful lifecycle state."
            ],
            code: `public Job {
    if (id == null || name == null
            || id.isBlank() || name.isBlank()) {
        throw new IllegalArgumentException(
            "id and name cannot be blank"
        );
    }

    if (status == null) {
        throw new IllegalArgumentException(
            "status cannot be null"
        );
    }
}`
          },
          {
            heading: "Assertions turn expectations into executable checks",
            body: [
              "Printing an object helps a human inspect it, but it does not make the program fail when a value is wrong. An assertion states a condition that must be true and may include a diagnostic message.",
              "Assertions are disabled by default. Running with -ea enables them. A successful run is silent; a false condition throws AssertionError and produces a non-zero exit."
            ],
            code: `Job job = new Job("ZE3034", "Yash");

assert job.id().equals("ZE3034")
    : "Job id is incorrect";
assert job.name().equals("Yash")
    : "Job name is incorrect";
assert job.status() == JobStatus.SUBMITTED
    : "New job must start SUBMITTED";

// Run with: java -ea JobMain`
          },
          {
            heading: "Choose comparisons by meaning",
            body: [
              "For objects, == asks whether two references point to the same object. String literals can be reused by Java, so an incorrect == string test may appear to pass by accident.",
              "String.equals() compares text content. Enum constants are single canonical instances, so == is the intended enum comparison."
            ],
            code: `// Compare String contents.
assert job.name().equals("Yash");

// Compare enum identity.
assert job.status() == JobStatus.SUBMITTED;`
          },
          {
            heading: "An expected exception is a passing test",
            body: [
              "Invalid construction should throw, but leaving the exception uncaught merely crashes main before later checks run. The assertion needs to record that the expected exception occurred.",
              "Begin with a false flag, attempt the invalid operation, set the flag only when the expected exception is caught, then assert the flag. Separate cases for blank ID and blank name prove both requirements independently."
            ],
            code: `boolean rejectedBlankId = false;

try {
    new Job("", "Yash");
} catch (IllegalArgumentException expected) {
    rejectedBlankId = true;
}

assert rejectedBlankId
    : "Blank id should be rejected";`
          },
          {
            heading: "The debugging trail was part of the lesson",
            body: [
              "The constructor error revealed that delegation must happen before other constructor work. The first uncaught validation exception showed the difference between demonstrating a failure and testing an expected failure.",
              "The passing == assertions revealed that green output alone is not enough: a test can pass for the wrong reason. Good testing asks whether the check would fail if the requirement were broken."
            ],
            code: `// A useful review question for every test:
// "What production mistake would make this assertion fail?"

// If the answer is unclear, the test may not prove
// the requirement you think it proves.`
          }
        ],
        takeaway: "Model each requirement as an invariant, route construction through one validation point, and write a test that would fail if that invariant broke.",
        checklist: [
          "List each requirement as a separate observable rule.",
          "Use an enum when only a fixed vocabulary of values is legal.",
          "Distinguish an initial default from a permanent restriction.",
          "Validate null before calling methods on a reference.",
          "Use equals() for String contents and == for enums.",
          "Run assertion-based programs with -ea.",
          "Catch only the expected exception and assert that it occurred.",
          "Test blank ID and blank name independently."
        ],
        questions: [
          {
            prompt: "Why should validation live in the compact canonical constructor?",
            answer: "Every record constructor ultimately reaches the canonical constructor, so one validation point protects every construction path."
          },
          {
            prompt: "Why was rejecting every non-SUBMITTED status too strong?",
            answer: "The requirement described the initial creation state. A permanent restriction would make RUNNING, SUCCEEDED, and FAILED impossible to represent."
          },
          {
            prompt: "Why can a String assertion using == pass incorrectly?",
            answer: "Java may reuse the same literal object, making reference identity accidentally match even though the test should compare text content."
          },
          {
            prompt: "How does main test an operation that should throw?",
            answer: "It records whether the expected exception was caught and then asserts that the record is true, allowing later tests to continue."
          },
          {
            prompt: "What does exit code zero prove when assertions are enabled?",
            answer: "It proves that execution completed without an uncaught exception or failed assertion; it is meaningful only if the assertions themselves test the correct requirements."
          }
        ]
      }
    ]
  }
];
