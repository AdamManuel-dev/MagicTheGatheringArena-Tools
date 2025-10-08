# Output formatter utilities
Purpose: define shared formatting helpers for tables, CSV, JSON, Markdown exports.

## Table formatter
- Wrapper around `cli-table3` with default column alignments
- Support color themes with toggle for no-color
- Provide compact and expanded modes based on terminal width

## CSV formatter
- Utility to convert array of objects to CSV with header order control
- Escape function for quotes and commas
- Accepts schema definition to enforce column presence

## JSON formatter
- Standard function to pretty-print or minify based on flag
- Support newline-delimited JSON for streaming commands
- Validate objects against Zod schemas before output

## Markdown formatter
- Templates for summary tables, bullet lists, and code blocks
- Use for LLM narratives and weekly reports

## Integration points
- Expose via `src/lib/formatters/index.ts`
- Commands import specific formatter or use orchestrating `renderOutput` helper
- Provide tests ensuring consistent output across formats
