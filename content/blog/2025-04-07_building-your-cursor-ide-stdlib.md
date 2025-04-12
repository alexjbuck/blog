+++
title = "Building Your Cursor IDE Stdlib"
date = 2025-04-07
description = "A deep dive into Cursor IDE's self-learning capabilities through .cursor/rules, exploring how to build and maintain your own standard library of AI knowledge."
draft = true

[taxonomies]
tags = ["cursor", "ide", "development", "ai", "productivity"]
+++

In the rapidly evolving landscape of AI-powered development tools,
Cursor IDE stands out with its unique ability to learn and adapt to your codebase.
This post is some of my notes on my attempts to leverage Cursor's `.cursor/rules` system to build your own "stdlib" - a standard library of knowledge that makes your AI assistant smarter and more effective over time.

## What is Cursor?

Cursor is a VSCode fork that integrates an LLM agent with access to all the files in your workspace as a sidebar in the IDE interface.
This is more powerful than copy/paste-ing into Anthropic's or OpenAI's web interface,
Cursor provides a mechanism for executing commands within the default shell environment,
as well as hooks to read, create, and edit existing files.

Something that wasn't obvious to me for my first week of using cursor was that the AI component has 3 modes:

1. **Ask Mode**: User-initiated queries for explanations, refactoring, or problem-solving
2. **Manual Mode**: Traditional coding with AI assistance on demand
3. **Agent Mode** (⌘I): Proactive AI that suggests improvements and learns from your codebase

I had been working in the `ask` mode, and hadn't been terribly enthused with the results.
It seemed to be nothing much different than using the web interfaces and copying results into my editor.
Once I discovered the `agent` mode however, I discovered the agent/tool integrations and I started to see some of the magic that Cursor can offer. 

Uncovering the `agent` mode is when I starting seeing the AI model read my code base, implement a change to the code base, run a test suite, _read the test results_, and iterate on any bugs or failures. It did all this on its own just from an initial prompt to implement some feature.

> Note: For all of the Cursor interactions, you can select between an "auto" model selection mode and selecting a specific model to service your conversation.
The bulk of this article is written from the perspective of using the "auto" model selection mode.
With the business account that I have access to, using a specified model incurs "usage-based-pricing" so I generally don't use this mode.

## Understanding Cursor Rules

The heart of Cursor's learning capability lies in its `.cursor/rules` system. Think of it as your AI's personal knowledge base - a collection of guidelines, patterns, and best practices specific to your project.

Once you uncover this superpower, you will probably start to notice some odd behavior though.
The AI model sometimes has quirky ways of interacting with tools, or uses code patterns that you don't want to use.

For example when adding a dependency, instead of using the package manager tooling e.g. `yarn add <dependency>`, the first tendency seems to be to directly modify the package manifest file and write the dependencies into the appropriate part of the file.
It does this in a _syntactically correct_ way, but relies on the pre-trained memory as to which package versions to add. 
The result is that the versions are almost universally out of date, sometimes not even the same major version as the latest version.

You can type a message with feedback to try and correct the undesired behavior via the interface and you'll probably see a decent result come out from that, but that feedback won't be stored anywhere long term.
When you open Cursor the following day to resume working, its apt to make the same mistake again!

Luckily Cursor rules give us a way to provide Cursor with a long term "memory" and teach it to behave the way we want to.

### Rule Types

Cursor rules come in four flavors:

1. **Auto-attached Rules**
   - Triggered automatically based on file patterns
   - Example: Rules for `*.js`, `*.toml`, or `content/*.md` files
   - Applied whenever matching files are being worked with

2. **Agent-requested Rules**
   - Used contextually when relevant
   - The Cursor agent reads rule descriptions to decide when to apply them
   - Helps maintain consistency across similar scenarios

3. **Always Rules**
   - Global rules applied to every interaction
   - Perfect for project-wide conventions and standards

4. **Manual Rules**
   - Explicitly referenced in agent chat or other rules
   - Used for specific scenarios or complex workflows

### Anatomy of a Rule

A Cursor rule is a Markdown file (`.mdc`) with a specific structure, located in the `.cursor/rules/` folder of a workspace.

There is a yaml-header followed by markdown content.
Thats all that is required.
You can put whatever markdown content you want into the rule.
If the rule gets applied, the content of the rule is read into the context window, ensuring the agent is aware of the rule when acting and responding.

```yaml
---
description: Clear purpose of the rule
globs: ["*.ts", "*.tsx"]
alwaysApply: false
---
# Rule Title
There is no requirement on the structure of a rule's content, but this is a good pattern to follow.

## Context
Description of what the rule addresses

## Guidelines
Specific instructions for the AI to follow

## Examples
Concrete code samples showing the rule in action, both good and bad examples.
```


The yaml-header has 4 patterns, depending on which of the 4 modes was selected.

1. Auto-attached rules -  ❌ `description`, ✅ `globs`, ❌ `alwaysApply`.
```yaml
---
description: 
globs: content/**/*.md,*.scss
alwaysApply: false
---
```
2. Agent requested rules - ✅ `description`, ❌ `globs`, ❌ `alwaysApply`.

```yaml
---
description: Rule description
globs: 
alwaysApply: false
---
```
3. Always apply rules - ❌ `description`, ❌ `globs`, ✅ `alwaysApply`.
```yaml
---
description: 
globs: 
alwaysApply: true
---
```
4. Manual rules - ❌ `description`, ❌ `globs`, ❌ `alwaysApply`.
```yaml
---
description: 
globs: 
alwaysApply: false
---
```

With these building blocks you can start to write out your own rules to modify the long term behavior of the AI agent in Cursor.

Writing rules by hand works, and I encourage you to give it a try, but wouldn't it be better if Cursor could write the rules itself?

## The Power of Self-Learning

What makes Cursor's rule system truly powerful is its ability to evolve with your project. The self-learning process follows a simple cycle:

1. **Pattern Recognition**: Identify common issues or patterns
2. **Documentation**: Find solutions and best practices
3. **Rule Creation**: Formalize knowledge into rules
4. **Refinement**: Apply, test, and improve rules over time

There isn't anything about this framework that is built into Cursor.
This is behavior that we can give to Cursor ***by using a rule***.

### A rule to rule all rules

This is an example of a rule I have implemented in a project to give Cursor this self-learning capability. 
I haven't settled on the best type of rule to use, this is implemented as a "agent_requested" rule type.

``````yaml,linenos
---
description: Mandatory framework for learning from errors and building new rules to improve the knowledge base.
globs: 
alwaysApply: false
---
# Self-Learning and Error Correction

## Overview
This rule establishes a framework for Cursor to learn from its mistakes and build a growing knowledge base about this codebase. When Cursor makes an error that requires correction, it should analyze the error, understand the correct solution, and update its knowledge base accordingly. This includes strict rules for where to place new rules.

## Error Analysis Process
When a code suggestion generates an error or requires manual correction:

1. Identify the specific error type and root cause
2. Document the incorrect approach that was taken
3. Document the correct solution that fixed the issue
4. Create or update rules with this new knowledge

## Automatic Learning
Cursor should maintain a registry of common errors it has encountered and their solutions in the `.cursor/rules/registry` directory. Each time a new pattern is identified follow these rules:

1. Always place rule files in PROJECT_ROOT/.cursor/rules/registry:
    .cursor/rules/registry
    ├── your-rule-name.mdc
    ├── another-rule.mdc
    └── ...

2. Follow the naming convention:
    - Use kebab-case for filenames
    - Always use .mdc extension
    - Make names descriptive of the rule's purpose

3. Directory structure:
    PROJECT_ROOT/
    ├── .cursor/
    │   └── rules/
    │       └── registry/
    │           ├── your-rule-name.mdc
    │           └── ...
    └── ...

4. Never place rule files:
    - In the project root
    - In subdirectories outside .cursor/rules
    - In any other location

5. Determine which type of rule it should be:
    - `auto_attached`, characterized by a `glob` value which is a list of filename glob patterns which should invoke the rule.
    - `agent_requested`, characterized by a `description` which is read by the agent to determine if the rule should be invoked.
    - `always`, characterized by always including the rule into every agent context.
    - `manual`, characterized by requiring direct reference to the file for the rule to be invoked by another rule.
6. Add YAML frontmatter metadata with `description`, `type`, and `glob` if this will be an `auto_attached` rule.
7. Include examples of both incorrect and correct implementations.
8. Reference any related rules that might apply.

NOTE: The rule files that are located in `.cursor/rules/` and not inside of `.cursor/rules/registry/` are the anchor rules that seeded this project with its guidelines.

examples:
  - input: |
      # Bad: Rule file in wrong location
      rules/my-rule.mdc
      my-rule.mdc
      .rules/my-rule.mdc

      # Good: Rule file in correct location
      .cursor/rules/my-rule.mdc
    output: "Correctly placed Cursor rule file"
    
## How to define which rule type 

The yaml-header for a rule file has 4 patterns, depending on which of the 4 modes was selected.

1. Auto-attached rules -  ❌ `description`, ✅ `globs`, ❌ `alwaysApply`.
```yaml
---
description: 
globs: content/**/*.md,*.scss
alwaysApply: false
---
```
2. Agent requested rules - ✅ `description`, ❌ `globs`, ❌ `alwaysApply`.

```yaml
---
description: Rule description
globs: 
alwaysApply: false
---
```
3. Always apply rules - ❌ `description`, ❌ `globs`, ✅ `alwaysApply`.
```yaml
---
description: 
globs: 
alwaysApply: true
---
```
4. Manual rules - ❌ `description`, ❌ `globs`, ❌ `alwaysApply`.
```yaml
---
description: 
globs: 
alwaysApply: false
---
```

## Error Categories
Maintain specific sections for different error types.

### Type Errors
Document common type errors specific to this codebase and how to properly type definitions.

### Integration Errors
Track errors related to integration tests and their resolution.

### Performance Issues
Document patterns that lead to performance issues and their optimized alternatives.

### Dependency Management
Track uv and yarn/package management issues and their solutions.

## Continuous Improvement
This rule should evolve over time as new errors are encountered and resolved. When implementing a fix that's been seen before, reference the relevant rule. When implementing a fix for a new type of error, create a new rule or update existing ones.

## Example Learning Pattern
      
````
---
description: Type Error in Redpanda Connect Pipeline
globs: *.py
alwaysApply: false
---

# TypeScript Type Error in Pipeline Configuration

## Incorrect Pattern
```typescript
const pipeline = createPipeline({
  input: {
    // Missing required type information
    topic: "input-topic",
    config: {}
  },
  // Other configuration
});
```

## Correct Pattern
```typescript
const pipeline = createPipeline<InputSchema, OutputSchema>({
  input: {
    // Properly typed with required interface
    topic: "input-topic",
    config: {
      consumerGroup: "my-group"
    }
  },
  // Other configuration
});
```

## Explanation
Redpanda Connect pipelines require explicit type parameters and proper configuration of consumer groups to function correctly.
````

## Implementation Instructions
When you encounter a pattern that seems to repeat or an error that occurs more than once, ask Cursor to create a new rule file documenting this pattern in the `.cursor/rules/registry` directory.
``````

### Error Analysis Framework

When encountering issues, Cursor can help build new rules using this framework:

1. Identify the root cause of the error
2. Document the incorrect approach that led to it
3. Record the correct solution
4. Create or update rules to prevent similar issues

Common rule categories include:
- Type system errors
- Tool usage issues
- Avoiding low performance patterns
- Dependency management
- Project-specific conventions

## Getting Started with Rules

Ready to build your own stdlib? Here's how to begin:

1. Install Cursor IDE from [cursor.sh](https://cursor.sh)
2. Create a `.cursor/rules` directory in your project
3. Add your self-learning rule
4. Let cursor add rules organically as you work

Start small - create rules for patterns you encounter frequently. Over time, your rule collection will grow into a comprehensive knowledge base that makes your development process more efficient and consistent.

## Resources

To learn more about Cursor and rules:

- [Cursor IDE Website](https://cursor.sh)
- [Official Documentation](https://docs.cursor.com/get-started/welcome)
- [GitHub Repository](https://github.com/getcursor/cursor)
- [Community Forum](https://forum.cursor.com/)

Happy coding!
