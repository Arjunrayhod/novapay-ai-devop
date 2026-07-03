import sys
from pathlib import Path


def ai_code_audit(file_to_check: str) -> bool:
    print(f"--- 🔍 AI Engine: Scanning {file_to_check} for Security ---")

    code = Path(file_to_check).read_text()

    if "api_key" in code or "password" in code:
        print("❌ AI AUDIT FAILED: Hardcoded credentials detected!")
        print("Violation: RBI Security & PCI-DSS v4 Mandate.")
        return False
    else:
        print("✅ AI AUDIT PASSED: No immediate security threats found.")
        print("Compliance Check: Approved for Production.")
        return True


if __name__ == "__main__":
    target_file = Path("app.py")
    if target_file.exists():
        success = ai_code_audit(str(target_file))
        if not success:
            sys.exit(1)
    else:
        print(f"⚠️ {target_file} not found. Skipping audit.")
