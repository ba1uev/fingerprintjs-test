How to run:
```
yarn && yarn go
```

## What is the max USD value that can be processed in 50ms, 60ms, 90ms, 1000ms?

Implementations:
1. [Greedy algorythm](https://en.wikipedia.org/wiki/Knapsack_problem#Greedy_approximation_algorithm)
2. [Dynamic programming](https://en.wikipedia.org/wiki/Knapsack_problem#0-1_knapsack_problem) based approach


| Threshold | Greedy algorythm | Dynamic programming
| --- | --- | --- |
| 50ms | $3,637.98 (4) | $4,139.43 (5)
| 60ms | $4,362.01 (5) | $4,675.71 (5)
| 90ms | $6,870.48 (8) | $7,464.58 (44)
| 1000ms | $35,471.81 (48) | $35,514.15 (392)
