# harbormaster-timestamp

Log a timestamp.

Sometimes you just need to track the time an event occurred, so that you can parse it and deal with it later.  This harbor very simply records a timestamp with the manifest data passed.

The timestamp is implemented using a worker, which allows it to release the call stack.

In this way, any Charter which includes a timestamp can be made recursive (lane A -> lane B -> lane A, etc.).

This harbor has nothing to configure, since it's literally just a timestamp.
