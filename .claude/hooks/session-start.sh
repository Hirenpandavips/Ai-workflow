#!/bin/bash
echo "╔══════════════════════════════════════╗"
echo "║        SESSION CONTEXT               ║"
echo "╠══════════════════════════════════════╣"
echo "  Branch  : $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "  Commit   : $(git log --oneline -1 2>/dev/null || echo 'no commits')"
echo "  Modified : $(git status --short 2>/dev/null | wc -l | tr -d ' ') files"
echo "  Node     : $(node -v)"
echo "  TS       : $(npx tsc --version 2>/dev/null)"
echo "╚══════════════════════════════════════╝"
git status --short 2>/dev/null | head -10