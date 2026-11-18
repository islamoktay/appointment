#!/usr/bin/env bash
# Project-Agnostic Automated Security Red-Line Scanner
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT_DIR"

FAILURES=0

echo "=== Running Catastrophic Security Red-Line Checks ==="

# 1. Check for tracked or staged secret files in Git
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  LEAKED_FILES=$(git ls-files --cached --others --exclude-standard | grep -E '(^|/)\.env(\..+)?$|(\.jks|\.keystore|\.pem|\.p12|key\.properties)$' | grep -vE '\.env\.example$' || true)
  if [[ -n "$LEAKED_FILES" ]]; then
    echo "[FAIL] Red Line 1: Sensitive secret/key files detected in workspace or Git:"
    echo "$LEAKED_FILES"
    FAILURES=$((FAILURES + 1))
  fi
fi

# 2. Check Spring Boot main config for hardcoded JWT_SECRET default fallbacks or dangerous actuator exposure
if [[ -d "backend/src/main/resources" ]]; then
  JWT_FALLBACK=$(grep -rnE '\$\{JWT_SECRET:[^}]+\}' backend/src/main/resources/ || true)
  if [[ -n "$JWT_FALLBACK" ]]; then
    echo "[FAIL] Red Line 1: Default fallback secret detected for JWT_SECRET in main backend resources (must fail-fast if missing):"
    echo "$JWT_FALLBACK"
    FAILURES=$((FAILURES + 1))
  fi

  ACTUATOR_LEAK=$(grep -rnE 'exposure\.include\s*[:=]\s*(\*|.*(env|heapdump|beans|configprops))' backend/src/main/resources/ || true)
  if [[ -n "$ACTUATOR_LEAK" ]]; then
    echo "[FAIL] Red Line 3: Dangerous Spring Boot Actuator endpoints exposed (only 'health' is permitted):"
    echo "$ACTUATOR_LEAK"
    FAILURES=$((FAILURES + 1))
  fi
fi

# 2b. Check Spring Boot controllers for direct @Entity binding in @RequestBody (Anti-Mass-Assignment)
if [[ -d "backend/src/main/java" ]]; then
  ENTITY_NAMES=$(grep -rl "@Entity" backend/src/main/java/ 2>/dev/null | xargs -I{} basename {} .java | paste -sd "|" - || true)
  if [[ -n "$ENTITY_NAMES" ]]; then
    MASS_ASSIGN=$(grep -rnE "@RequestBody[[:space:]]+(@Valid[[:space:]]+)?($ENTITY_NAMES)\\b" backend/src/main/java/ || true)
    if [[ -n "$MASS_ASSIGN" ]]; then
      echo "[FAIL] Red Line 3: @RestController binds a JPA @Entity directly in @RequestBody (use a strict Request DTO record):"
      echo "$MASS_ASSIGN"
      FAILURES=$((FAILURES + 1))
    fi
  fi
fi

# 3. Check Web frontend for NEXT_PUBLIC_ secret leaks or localStorage token storage
if [[ -d "web" ]]; then
  NEXT_PUBLIC_SECRET=$(grep -rnE 'NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|PASSWORD|JWT_KEY)' web/ --exclude-dir=node_modules --exclude-dir=.next || true)
  if [[ -n "$NEXT_PUBLIC_SECRET" ]]; then
    echo "[FAIL] Red Line 1: Private secret exposed in NEXT_PUBLIC_ variable:"
    echo "$NEXT_PUBLIC_SECRET"
    FAILURES=$((FAILURES + 1))
  fi

  WEB_STORAGE_TOKEN=$(grep -rnE '(localStorage|sessionStorage)\.(setItem|getItem)\s*\(\s*['"'"'"](token|accessToken|jwt|auth)' web/ --exclude-dir=node_modules --exclude-dir=.next || true)
  if [[ -n "$WEB_STORAGE_TOKEN" ]]; then
    echo "[FAIL] Red Line 4: Web token stored in localStorage/sessionStorage instead of HttpOnly cookie:"
    echo "$WEB_STORAGE_TOKEN"
    FAILURES=$((FAILURES + 1))
  fi
fi

# 4. Check Mobile app for unencrypted token storage or Authorization header logging
if [[ -d "mobile/lib" ]]; then
  MOBILE_HEADER_LOG=$(grep -rnE 'LogInterceptor\([^)]*requestHeader\s*:\s*true' mobile/lib/ || true)
  if [[ -n "$MOBILE_HEADER_LOG" ]]; then
    echo "[FAIL] Red Line 1: Dio LogInterceptor has requestHeader: true (leaks Authorization JWT headers into device logs):"
    echo "$MOBILE_HEADER_LOG"
    FAILURES=$((FAILURES + 1))
  fi
fi

# 5. Check Docker Compose for publicly bound PostgreSQL 5432 port (0.0.0.0:5432)
if [[ -d "infra" ]]; then
  PUBLIC_DB_PORT=$(grep -rnE '^[[:space:]]*-[[:space:]]*["'"'"']?(0\.0\.0\.0:)?5432:5432["'"'"']?' infra/ || true)
  if [[ -n "$PUBLIC_DB_PORT" ]]; then
    echo "[FAIL] Red Line 6: PostgreSQL port 5432 is bound to 0.0.0.0 instead of 127.0.0.1:5432:5432 or internal network:"
    echo "$PUBLIC_DB_PORT"
    FAILURES=$((FAILURES + 1))
  fi
fi

if [[ "$FAILURES" -gt 0 ]]; then
  echo "=== Security Audit FAILED with $FAILURES Red-Line violation(s) ==="
  exit 1
else
  echo "=== Security Audit PASSED (0 Red-Line violations) ==="
  exit 0
fi
