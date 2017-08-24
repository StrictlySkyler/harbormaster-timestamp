# harbormaster-timestamp

Log a timestamp.

The timestamp is implemented using a worker, which allows it to release the call stack.  In this way, Lanes can reference each other cyclically without overflowing the call stack.  For example, if two lanes, A and B, are both timestamps, B can followup A, and A can followup B (A -> B -> A, etc.).
