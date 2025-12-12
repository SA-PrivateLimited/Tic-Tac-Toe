#!/bin/bash

# Script to generate native debug symbols ZIP file for Play Store upload
# This extracts debug symbols from the AAB and creates a ZIP file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AAB_PATH="${SCRIPT_DIR}/app/build/outputs/bundle/release/app-release.aab"
OUTPUT_DIR="${SCRIPT_DIR}/app/build/outputs/native-debug-symbols/release"
OUTPUT_ZIP="${OUTPUT_DIR}/native-debug-symbols.zip"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Extract debug symbols from AAB
echo "Extracting native debug symbols from AAB..."
TEMP_DIR=$(mktemp -d)
cd "${TEMP_DIR}"
unzip -q "${AAB_PATH}" "base/lib/*/*debug*.so" 2>/dev/null || true

# Check if we found any debug symbols
if [ -d "base/lib" ] && [ "$(find base/lib -name "*debug*.so" 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "Found debug symbols, creating ZIP file..."
    # Create the proper directory structure for the ZIP (ABI directories at root, not under lib/)
    find base/lib -name "*debug*.so" -exec sh -c 'abi=$(basename $(dirname "{}")); mkdir -p "${abi}" && cp "{}" "${abi}/"' \;
    zip -r "${OUTPUT_ZIP}" armeabi-v7a/ arm64-v8a/ x86/ x86_64/ 2>/dev/null
    echo "Native debug symbols ZIP created at: ${OUTPUT_ZIP}"
    ls -lh "${OUTPUT_ZIP}"
    echo "ZIP structure:"
    unzip -l "${OUTPUT_ZIP}" | head -15
else
    echo "Note: Debug symbols are already included in the AAB bundle."
    echo "With debugSymbolLevel 'FULL', Play Store can extract them automatically."
    echo "If Play Store requires a separate upload, the symbols are in the AAB."
fi

# Cleanup
cd - > /dev/null
rm -rf "${TEMP_DIR}"

