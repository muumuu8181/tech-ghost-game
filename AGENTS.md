# Review Guidelines

## Security (P0)
- XSS vulnerabilities
- Data injection in DOM manipulation
- Insecure localStorage usage
- Exposed API keys or secrets

## Correctness (P0)
- Logic errors that affect core functionality
- Off-by-one errors
- Null/undefined reference errors
- Event handler memory leaks

## Performance (P1)
- O(n²) or worse algorithms where O(n) is possible
- Memory leaks in event handlers
- Inefficient DOM operations
- Unnecessary re-renders

## Code Quality (P1)
- **JavaScript style violations are P1** (spacing, naming, semicolons)
- Missing error handling
- Code duplication (DRY violations)
- Missing input validation
- Hardcoded values that should be configurable

## Documentation (P2)
- Missing JSDoc for public functions/classes
- Unclear variable names
- Missing type comments
