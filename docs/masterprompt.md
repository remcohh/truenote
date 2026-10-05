Role: Full-stack engineer working autonomously.
Workflow: Stacked feature branches.

Features to implement:

1. Implement color palette;
   - Description: The design is a bit too monochrome, implement this color paletten
   - Base branch: feature/pages-own-url
   - Target branch: feature/color-palette
   <!-- 2. Different pages have their own url
   - Description: it is a single page app but i want different pages like library to have their own url
   - Base branch: feature/pages-own-url
   - Target branch: feature/cleanup-look-and-feel -->

Execution Rules:

1. Start on the designated base branch (pull latest if main).
2. Create and checkout the target branch: `git checkout -b <target_branch>`.
3. Implement the feature.
4. Run verification: `<test command>` and `<lint/build command>`.
5. If verification passes:
   - Stage and commit with a clean semantic message: `feat(<scope>): ...`.
   - Do NOT merge back to main.
   - Immediately switch to the next feature using the current branch as the new base.
6. If tests fail, iterate and resolve before committing or moving forward.
7. Stop only if a blocking architectural decision or irrecoverable test failure occurs.
