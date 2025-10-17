# CI/CD Setup Guide

## Overview

This project uses **GitHub Actions** for automated Continuous Integration and Continuous Deployment (CI/CD). Every push and pull request triggers automated workflows to ensure code quality and reliability.

---

## 🔧 Workflows

### 1. **Automated Testing** (`.github/workflows/tests.yml`)

**Triggers:**
- Push to `main` or `xiaoling-deployment` branches
- Pull requests to `main`

**What it does:**
- ✅ Runs test suite on Python 3.9, 3.10, and 3.11
- ✅ Uses in-memory SQLite (no MySQL required)
- ✅ Generates test coverage report
- ✅ Uploads coverage artifacts
- ✅ Provides test summary

**Jobs:**
1. **test** - Runs pytest across multiple Python versions
2. **test-summary** - Aggregates results and reports status

**View results:**
```
GitHub → Your Repo → Actions → "Run Tests" workflow
```

---

### 2. **Code Quality Checks** (`.github/workflows/code-quality.yml`)

**Triggers:**
- Push to `main` or `xiaoling-deployment` branches
- Pull requests to `main`

**What it does:**

#### Python Linting
- ✅ **flake8** - PEP 8 style guide enforcement
  - Catches syntax errors
  - Checks code complexity
  - Enforces line length (127 chars)
- ✅ **pylint** - Advanced code analysis
  - Code smells detection
  - Best practices enforcement

#### Security Scanning
- ✅ **Bandit** - Security vulnerability scanner
  - Detects common security issues
  - SQL injection patterns
  - Hardcoded passwords
- ✅ **Safety** - Dependency vulnerability checker
  - Scans requirements.txt
  - Reports known CVEs

#### Frontend Checks
- ✅ **HTMLHint** - HTML validation
- ✅ **console.log detector** - Finds debug statements

**View results:**
```
GitHub → Your Repo → Actions → "Code Quality Checks" workflow
```

---

## 📊 Status Badges

Add these badges to your README.md:

```markdown
![Tests](https://github.com/xl-c111/holbertonschool-hbnb/actions/workflows/tests.yml/badge.svg)
![Code Quality](https://github.com/xl-c111/holbertonschool-hbnb/actions/workflows/code-quality.yml/badge.svg)
```

---

## 🚀 How It Works

### On Every Push/PR:

```
1. Developer pushes code
   ↓
2. GitHub Actions triggered automatically
   ↓
3. Workflows run in parallel:
   ├─ tests.yml → Run pytest on 3 Python versions
   └─ code-quality.yml → Lint + security scan
   ↓
4. Results shown in PR/commit
   ↓
5. ✅ Green checkmark = all passed
   ❌ Red X = something failed
```

---

## 🛠️ Local Testing Before Push

**Run tests locally:**
```bash
cd backend
python -m pytest -v
```

**Run linting locally:**
```bash
cd backend
pip install flake8 pylint

# Check syntax errors
flake8 app --count --select=E9,F63,F7,F82 --show-source

# Full lint check
flake8 app --max-line-length=127

# Advanced analysis
pylint app --max-line-length=127
```

**Run security scan locally:**
```bash
cd backend
pip install bandit safety

# Security scan
bandit -r app -ll

# Dependency check
safety check
```

---

## ⚙️ Configuration Files

### Python Version Matrix

Tests run on:
- Python 3.9 (older projects)
- Python 3.10 (stable)
- Python 3.11 (latest stable)

**Why?** Ensures compatibility across different environments.

### Caching

Both workflows use pip caching:
```yaml
cache: 'pip'
cache-dependency-path: backend/requirements.txt
```

**Benefit:** Faster workflow runs (dependencies cached between runs)

---

## 🔍 Understanding Workflow Results

### ✅ All Checks Passed

```
✅ test (3.9)
✅ test (3.10)
✅ test (3.11)
✅ lint
✅ security
✅ frontend-lint
```

**Safe to merge!**

### ❌ Tests Failed

**Click on the failed job to see:**
- Which test failed
- Error messages
- Stack traces
- Line numbers

**Example:**
```
backend/tests/test_user_api.py::test_login FAILED

AssertionError: Expected 200, got 401
```

### ⚠️ Linting Warnings

```
app/api/v1/users.py:45:80: E501 line too long (140 > 127 characters)
app/models/user.py:23:1: C0111 Missing docstring
```

**Note:** Linting jobs use `continue-on-error: true`, so they won't block PRs but will show warnings.

---

## 📈 Coverage Reports

**After each test run (Python 3.11 only):**
1. Coverage report generated
2. Uploaded as artifact
3. Retained for 7 days

**Download coverage report:**
```
GitHub → Actions → Select workflow run → Artifacts → coverage-report
```

**View coverage in terminal:**
```bash
cd backend
pip install pytest-cov
pytest --cov=app --cov-report=term-missing
```

---

## 🔐 Security Best Practices

### What the Security Scan Checks:

| Tool | Checks For |
|------|------------|
| **Bandit** | Hardcoded passwords, SQL injection, insecure functions |
| **Safety** | Known vulnerabilities in dependencies (CVEs) |

### Common Issues Detected:

```python
# ❌ BAD - Bandit will flag this
password = "hardcoded_password"

# ✅ GOOD
password = os.getenv("DB_PASSWORD")
```

---

## 🚧 Adding New Workflows

### Structure:

```
.github/
└── workflows/
    ├── tests.yml           # Automated testing
    ├── code-quality.yml    # Linting & security
    └── deploy.yml          # (Future) Deployment workflow
```

### Example: Add Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to server
      run: |
        # Your deployment script here
        echo "Deploying to production..."
```

---

## 🐛 Troubleshooting

### Problem: Workflow not triggering

**Solution:**
- Check branch name matches workflow config
- Ensure `.github/workflows/` directory exists
- Workflow files must have `.yml` or `.yaml` extension

### Problem: Tests pass locally but fail in CI

**Common causes:**
1. **Missing dependencies** - Update `requirements.txt`
2. **Environment differences** - Check Python version
3. **Hardcoded paths** - Use relative paths
4. **Environment variables** - CI uses `TestingConfig`

**Debug:**
```yaml
- name: Debug environment
  run: |
    python --version
    pip list
    env | grep FLASK
```

### Problem: Slow workflow runs

**Solutions:**
- Enable pip caching (already configured)
- Reduce test matrix (fewer Python versions)
- Split jobs to run in parallel

---

## 📚 Best Practices

### ✅ DO:
- ✅ Run tests locally before pushing
- ✅ Keep tests fast (< 5 minutes total)
- ✅ Fix linting warnings promptly
- ✅ Review security scan results
- ✅ Update dependencies regularly

### ❌ DON'T:
- ❌ Commit secrets to the repo
- ❌ Skip CI checks with `[skip ci]` unnecessarily
- ❌ Ignore failing tests ("I'll fix it later")
- ❌ Disable security scans

---

## 📖 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pytest Documentation](https://docs.pytest.org/)
- [flake8 Rules](https://flake8.pycqa.org/en/latest/user/error-codes.html)
- [Bandit Security Docs](https://bandit.readthedocs.io/)

---

## 🎯 Next Steps

1. **Commit workflows:**
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows for automated testing and code quality"
   git push
   ```

2. **Watch it run:**
   - Go to GitHub → Actions tab
   - See workflows execute automatically

3. **Add status badges** to README.md (optional)

4. **Set up branch protection** (recommended):
   - GitHub → Settings → Branches
   - Add rule for `main`
   - ✅ Require status checks to pass before merging

---


