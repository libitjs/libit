# @libit/log

> Lightweight level based logging system.

## Log Level

### How do Levels Works?

A log request of level `p` in a logger with level `q` is enabled if `p >= q`. This rule is at the heart of @libit/log.
It assumes that levels are ordered. For the standard levels, we have `ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF`.
