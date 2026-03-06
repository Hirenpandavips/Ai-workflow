#!/bin/bash

# Parse the file path from stdin JSON
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('file_path', ''))
except:
    print('')
" 2>/dev/null)

# Only act on TypeScript source files
if [[ "$FILE" != *.ts ]] || [[ "$FILE" == *.test.ts ]]; then
  exit 0
fi

echo "📁 File written: $FILE"

# 1. Auto-lint and fix
echo "🔍 Running ESLint..."
npx eslint "$FILE" --fix 2>&1
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "❌ LINT FAILED on $FILE — fix errors before proceeding."
  exit 2  # exit 2 = block Claude + send this output to Claude
fi

echo "✅ Lint passed"

# 2. Run tests if the corresponding test file exists
TEST_FILE="${FILE/src\//src\/__tests__\/}"
TEST_FILE="${TEST_FILE/.ts/.test.ts}"

if [ -f "$TEST_FILE" ]; then
  echo "🧪 Running related tests: $TEST_FILE"
  npx jest "$TEST_FILE" --forceExit 2>&1
  TEST_EXIT=$?
  if [ $TEST_EXIT -ne 0 ]; then
    echo "❌ TESTS FAILED — fix failing tests before proceeding."
    exit 2
  fi
  echo "✅ Tests passed"
fi

exit 0