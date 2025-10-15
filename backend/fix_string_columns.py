#!/usr/bin/env python3
"""Fix all String columns to have proper length for MySQL compatibility"""

import os
import re
import glob

def fix_string_columns(filepath):
    """Fix String column declarations in a file"""
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Fix String columns without length specification
    # Match Column(String followed by comma or closing parenthesis but not a number
    patterns = [
        (r'Column\(String\)', 'Column(String(255))'),
        (r'Column\(String,', 'Column(String(255),'),
    ]

    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)

    # Don't change strings that already have length specified
    # This regex will not match if there's already a number after String

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Fixed: {filepath}")
        return True
    else:
        print(f"⏭️  Skipped: {filepath} (no changes needed)")
        return False

def main():
    """Fix all model files"""
    model_files = glob.glob('app/models/*.py')
    fixed_count = 0

    for filepath in model_files:
        if fix_string_columns(filepath):
            fixed_count += 1

    print(f"\n📊 Summary: Fixed {fixed_count} files out of {len(model_files)}")

if __name__ == "__main__":
    main()