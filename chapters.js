// Add new notes here. The sidebar and page navigation update automatically.
window.BOOK_CHAPTERS = [
  {
    id: "java-objects",
    number: "01",
    title: "Java Objects That Protect Themselves",
    subtitle: "Encapsulation, private fields, and meaningful behaviour",
    day: "Day 1",
    source: "java-katas/day01-job-model",
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
      }
    ]
  }
];
