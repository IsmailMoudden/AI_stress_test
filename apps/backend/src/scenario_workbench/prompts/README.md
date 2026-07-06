# Prompt Registry

Prompts are stored outside business logic so they can be reviewed, versioned, evaluated, and audited.

## Conventions

- Use one folder per task.
- Use explicit versions such as `v1`, `v2`, and `v3`.
- Keep system prompts and user prompt templates separate.
- Record expected structured output schemas in code and prompt documentation.
- Do not place secrets or sensitive portfolio data in prompt files.

