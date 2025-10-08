# Node 20 upgrade plan
Purpose: outline steps to upgrade toolchain to Node ≥20 and validate TypeScript compatibility.

Status: initial upgrade applied on 2025-10-08 (package.json engines, README update, .nvmrc added).

## Current state
- package.json engines unspecified
- tsconfig targets ES2020

## Upgrade steps
1. Update `.nvmrc` and documentation to Node 20.11 LTS
2. Set `"engines": {"node": ">=20.0.0"}` in package.json
3. Bump TypeScript and oclif dependencies as needed
4. Regenerate lockfile using Node 20

## Compatibility validation
- Run `npm run build` and `npm test` under Node 20
- Execute `tsc --noEmit` to catch type issues
- Run `yarn lint` or `npm run lint`

## Tooling updates
- Update GitHub Actions workflow matrix to include Node 20
- Ensure esbuild/ts-node dependencies compatible (check release notes)

## Rollout
- Document upgrade in setup guide
- Communicate change in changelog prior to Alpha release
- Provide fallback instructions for users stuck on Node 18 (use Docker image)
