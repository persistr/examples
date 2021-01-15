Output from a sample run:



SINGLE-THREADED EXAMPLE

Generating 10000 event streams (aggregates)
completed in: 10.196s

Replaying all event streams, 4 streams at a time
completed in: 34.597s

Verifying aggregates
done

Replaying all events sequentially
completed in: 31.472s

CLUSTER EXAMPLE

Master 2894 is running
Generating 10000 event streams (aggregates)
completed in: 10.105s

Replaying all streams
Worker 2895 started
Worker 2897 started
Worker 2896 started
Worker 2899 started
completed in: 15.635s

Verifying aggregates
done

worker 2895 died
worker 2896 died
worker 2899 died
worker 2897 died
