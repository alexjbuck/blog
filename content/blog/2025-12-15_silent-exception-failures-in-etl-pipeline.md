+++
title = "Silent Exception Failures in ETL"
date = 2025-12-15
description = "A production ETL run lost 198 rows (0.0013% of 15.2M total) when asyncpg connection errors caused worker processes to crash silently without retry logic or exit code checking. Python's exception-based error handling made this vulnerability invisible—unlike Rust's Result<T, E> which forces explicit error handling at compile time, Python function signatures don't indicate what exceptions can be raised, making defensive programming entirely optional and prone to being overlooked."

[taxonomies]
tags = ["data","etl","python","rust","error handling","exception","result"]
+++

## Summary

When 198 rows vanished from a production ETL run without a trace, the investigation revealed something far more troubling than a simple bug: Python's exception-based error handling had allowed worker processes to crash silently, with no logs, no alerts, and no way to know how many times this had happened before. This is the story of how invisible failures hide in plain sight—and why Rust's type system won't let that happen.

## The Discovery

I was reviewing the production logs from our latest Dagster run when something caught my eye. The final stats showed a discrepancy—a small one, but a discrepancy nonetheless. Out of 15,193,596 rows that we'd enqueued for writing, only 15,193,398 had actually made it to the database.

```
8:07:59.234 AM  (Written / Enqueued) rows: (15186526 / 15193558) (lag: 7032)
8:08:01.190 AM  End of main loop -- signaling end of run (72 entries per queue)
8:08:03.598 AM  End of main loop -- joining writer pool (12)
8:08:04.483 AM  (Written / Enqueued) rows: (15193398 / 15193596) (lag: 198)
8:08:04.491 AM  End of run!
```

198 rows had vanished. That's only 0.0013% of the data—easily dismissed as a rounding error or acceptable loss. But here's the thing: this happened AFTER all worker processes had been joined. This wasn't data sitting in-flight somewhere. This was data that should have been written but simply... wasn't.

## Root Cause: Exception-Based Error Handling

### The Problem with Python Exceptions

**Python does not make it obvious when a function can raise an exception.** Unlike Rust's `Result<T, E>` which forces you to handle errors at compile time, Python exceptions are invisible in function signatures:

```python
# Python - no indication this can fail!
async def write_batch(pool: asyncpg.Pool, batch: Iterable[tuple[Any, ...]]) -> None:
    async with pool.acquire() as connection:
        await connection.copy_records_to_table(...)
    # Looks like it always succeeds, but can raise:
    # - asyncpg.PostgresConnectionError
    # - asyncpg.InterfaceError
    # - asyncpg.QueryCanceledError
    # - asyncpg.TooManyConnectionsError
    # ... and more
```

**Contrast with Rust:**

```rust
// Rust - error handling is MANDATORY and VISIBLE
async fn write_batch(pool: &Pool, batch: Vec<DataRow>) -> Result<(), WriteError> {
    let conn = pool.acquire().await?;
    conn.copy_records_to_table(...).await?;
    Ok(())
    // Compiler FORCES you to handle Result at call site
}
```

In Rust, you cannot ignore errors. In Python, you can accidentally ignore them by simply not wrapping calls in try/except.

### The Specific Failure Path

Let me walk through what's actually happening in the code. In our worker task, we have something that looks innocent enough:

```python
async def worker_task(task_id: int) -> None:
    while len(queues) > 0:
        batch = get_next_batch(queues, queue_index, batch_size)
        if len(batch) > 0:
            serialized_batch = (tuple(item.model_dump().values()) for item in batch)
            await write_batch(pool, serialized_batch)  # ← Can raise, no try/except!
            write_count_queue.put(len(batch))          # ← Never reached if exception
```

Here's the insidious part: when `write_batch()` encounters a connection error—maybe the database hiccupped, maybe there was a network blip—it raises an exception. That exception propagates up through the worker task, then through the async gather call, then through the asyncio runner, and finally... the worker process just dies. Exits with code 1. Gone.

The batch that was being written? Lost from the queue. The call to `write_count_queue.put()` that would have updated our tracking? Never reached. The main process, happily calling `p.join()` on all its workers? It never checks the exit code. It just sees that the worker finished (because dead processes are technically "finished") and moves on with its life.

### Why This Was Invisible

The really troubling part is how completely invisible this failure mode is. Worker process crashes are hidden behind multiple layers of isolation. There's no try/except in the worker code, so exceptions just propagate uncaught. The main process doesn't check exit codes, so it has no idea a worker crashed. And because we're using multiprocessing, the worker's logs don't even make it back to the orchestrator's logging system. No retry logic, no error messages, no alerts. Just silence.

The ONLY evidence is that final row count mismatch in the logs: `(Written / Enqueued) rows: (15193398 / 15193596) (lag: 198)`

## Why This Wasn't Caught

### Python's Lack of Compile-Time Error Checking

This is where the fundamental difference between Python and Rust becomes stark. In Rust, the compiler literally won't let you ignore errors:

```rust
// Won't compile until you handle the Result!
let result = write_batch(pool, batch).await;
match result {
    Ok(_) => { /* success */ }
    Err(e) => { /* must handle */ }
}
```

But Python? Python is perfectly happy to let you write this:

```python
# Compiles fine, runs fine until it doesn't
await write_batch(pool, batch)
```

There's no equivalent to Rust's exhaustive match checking or `?` operator that makes error propagation explicit. You have to manually read documentation to figure out what exceptions can be raised, remember to add try/except blocks, and hope you caught all the error cases. We didn't realize `copy_records_to_table` could fail because nothing in the type signature indicated it could raise exceptions, no compiler gave us a warning about unhandled exceptions, and there was no obvious indication in the code that this was a fallible operation.

### Testing Doesn't Catch Rare Network Failures

Here's another uncomfortable truth: our unit tests and integration tests run against local databases with reliable connections. Connection errors—the network blips, database restarts, and resource exhaustion that happen in production—are rare and hard to simulate in tests.

The code worked perfectly for weeks. Then one day, the exact conditions aligned for an asyncpg connection failure, and we lost data.

## The Scope of the Problem

### What We Know

We lost 198 rows from one production run. That's approximately 0.0013% of the data—small enough to miss, big enough to matter.

### What We Don't Know

Here's what keeps me up at night: we have no way to know how many times this has happened before. There's no error logging from inside these multi-process async tasks. No monitoring of written vs. enqueued discrepancies beyond the basic logs. The workers crash silently, leaving no trace except that final row count mismatch.

We got lucky this time. We happened to be re-running all our data, which meant we could audit the datasets and confirm this was the only occurrence. The affected dataset will be reprocessed and the underlying cause fixed before we continue. But how many times has this happened in production runs we didn't audit?

### The Worst Case Scenario

Now imagine this: during database maintenance, all 12 worker processes encounter connection errors simultaneously. They all crash silently. All in-flight data across all workers is lost. All unprocessed rows never get written because all the workers are dead and the main thread happily unblocks and finishes "successfully." Potentially millions of rows affected, with zero indication that anything went wrong.

## The Case Against Exception-Based Error Handling

### Invisible Failure Modes

Look at this code and tell me what can go wrong:

```python
# What can go wrong here? You can't tell from the code!
await write_batch(pool, batch)
await another_operation()
await yet_another_operation()

# Each of these could raise dozens of different exceptions.
# Which ones? No idea without reading docs (if they exist).
```

There's no indication in the function signatures. No type hints that say "this can fail." You have to dig through documentation—assuming it exists and is accurate—to find out what exceptions might be raised.

### Silent Propagation

Exceptions propagate up the call stack until caught or they crash the program. In our case, an exception raised in `write_batch` propagated through three layers of async functions, crashed a multiprocessing worker, and the parent process never knew. The error vanished into the void.

### No Compiler Help

Python will happily let you write code that assumes success:

```python
result = potentially_failing_operation()
use(result)  # Assumes success, crashes if exception
```

Rust won't compile this:

```rust
let result = potentially_failing_operation();  // Returns Result<T, E>
use(result);  // ERROR: expected T, found Result<T, E>

// Must handle explicitly:
let value = result?;  // Propagate error, or
let value = result.unwrap_or_else(|e| { ... });  // Handle error
```

### Defensive Programming is Optional

This is perhaps the most fundamental problem. In Python, defensive error handling is opt-in. You must remember to add try/except, you must know what exceptions to catch, and you must handle each error case. It's entirely possible—easy, even—to forget.

In Rust, error handling is mandatory. The compiler forces you to handle `Result<T, E>`. The type system makes error paths visible. You cannot accidentally ignore errors, because your code simply won't compile until you deal with them.

## Fixing the Immediate Problem

So how do we fix this? There are several layers of defense we need to add.

### Add Retry Logic with Exponential Backoff

The first and most obvious fix: make the write operations resilient to transient failures. Network blips and temporary connection issues shouldn't result in data loss. We need retry logic with exponential backoff:

```python
async def write_batch(
    pool: asyncpg.Pool,
    batch: list[tuple[Any, ...]],  # Must be list for retries, not generator
    max_retries: int = 3
) -> None:
    """Write batch with retry logic for transient failures."""
    for attempt in range(max_retries):
        try:
            async with pool.acquire() as connection:
                await connection.copy_records_to_table(
                    "target_table", records=batch, schema_name="target_schema"
                )
            if attempt > 0:
                log.info(f"Write succeeded after {attempt + 1} attempts")
            return

        except (
            asyncpg.PostgresConnectionError,
            asyncpg.InterfaceError,
            asyncpg.QueryCanceledError,
            asyncpg.TooManyConnectionsError,
        ) as e:
            if attempt == max_retries - 1:
                log.error(f"Write failed after {max_retries} attempts: {e}")
                raise

            wait_time = 2 ** attempt
            log.warning(f"Write failed, retrying in {wait_time}s: {e}")
            await asyncio.sleep(wait_time)
```

### Check Worker Process Exit Codes

We also need to actually check if our workers died. It's embarrassingly simple:

```python
# After joining worker processes
failed_processes = []
for p in write_processes:
    p.join()
    if p.exitcode != 0:
        failed_processes.append((p.pid, p.exitcode))

if failed_processes:
    error_msg = f"Worker processes crashed: {failed_processes}"
    context.log.error(error_msg)
    raise RuntimeError(error_msg)
```

### Add a Dead Letter Queue

For batches that fail even after retries, we need somewhere to put them. A dead letter queue lets us avoid reprocessing entire datasets—we can just retry the failed batches. If the error is in the data itself, we can inspect it to understand why. If it's a catastrophic database failure, we'll see the DLQ size spike and can replay the data once the database recovers.

```python
# For batches that fail all retries, write to a recovery file
with open(f"failed_batches_{run_id}.json", "a") as f:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "batch_size": len(batch),
        "error": str(e),
        "batch": batch  # Serialize for manual recovery
    }, f)
```

Of course, if we're seeing a massive spike in DLQ writes, we probably want the ETL process to fail loudly rather than silently shuffling everything into the DLQ.

### Monitor Written vs. Enqueued

Finally, we need to actually fail when we detect data loss:

```python
# At end of run, fail if there's a discrepancy
if written_rows != enqueued_rows:
    raise RuntimeError(
        f"Data loss detected: {enqueued_rows - written_rows} rows not written "
        f"({written_rows} written / {enqueued_rows} enqueued)"
    )
```

## The Long-Term Solution

We've been rewriting parts of our ETL pipeline in Rust, and the difference is night and day. The Rust version has proper error handling baked in from the start:

- Write operations retry failed writes up to a configurable number of times
- Commit records are only sent when ALL partition writes succeed
- Fatal errors propagate through dedicated error channels
- The process exits with code 1 on fatal errors so the orchestrator can detect the failure
- On restart, the system replays from the last committed offset—no data loss

Most importantly, exactly-once semantics are guaranteed by the type system itself. You literally cannot write code that silently loses data, because the compiler won't let you ignore errors. `Result<T, E>` makes error handling mandatory and visible. The compiler ensures all error paths are handled. Silent failures simply aren't possible.

## Conclusion

We lost 198 rows because an exception crashed a worker process, and nothing in our Python codebase forced us to think about what would happen when that occurred. The function signatures didn't indicate that write operations could fail. The compiler didn't warn us about unhandled exceptions. The type system didn't make error paths visible. Defensive programming was optional, and we forgot to do it.

This would not have happened in Rust. When you use `Result<T, E>`, the type system forces you to handle errors explicitly. Error paths become visible and mandatory. The compiler becomes your safety net, catching these bugs before they ever reach production.

The immediate fixes—retry logic, exit code checking, dead letter queues, monitoring—will make this specific pipeline more resilient. But the deeper lesson is about the tools we choose and the guarantees they provide. Sometimes the best defense against invisible failures is a compiler that refuses to let them exist in the first place.
