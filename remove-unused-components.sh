#!/bin/bash

echo "Preparing to move unused components to backup directory..."

# Create backup directory
BACKUP_DIR="./unused-components-backup"
mkdir -p $BACKUP_DIR

# Input file with list of unused components
INPUT_FILE="unused-component-files.txt"

# Counter for moved files
MOVED_COUNT=0

# Check if the input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: $INPUT_FILE not found!"
    exit 1
fi

# Process each line in the input file
while read -r line; do
    # Extract the file path
    FILE_PATH=$(echo "$line" | cut -d: -f2 | tr -d ' ')
    
    # Skip if line is empty
    if [ -z "$FILE_PATH" ]; then
        continue
    fi
    
    # Check if the file exists
    if [ -f "$FILE_PATH" ]; then
        # Create the target directory structure in the backup
        TARGET_DIR=$(dirname "$BACKUP_DIR/$FILE_PATH")
        mkdir -p "$TARGET_DIR"
        
        # Move the file to the backup directory
        cp "$FILE_PATH" "$BACKUP_DIR/$FILE_PATH"
        echo "Backed up: $FILE_PATH"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        echo "Warning: File not found - $FILE_PATH"
    fi
done < <(grep "Potentially unused:" "$INPUT_FILE")

echo "Backup completed. $MOVED_COUNT files were backed up to $BACKUP_DIR"
echo "Review the backup before proceeding with actual removal."
echo ""
echo "To remove the files after review, run:"
echo "while read -r line; do FILE_PATH=\$(echo \"\$line\" | cut -d: -f2 | tr -d ' '); if [ -f \"\$FILE_PATH\" ]; then rm \"\$FILE_PATH\"; echo \"Removed: \$FILE_PATH\"; fi; done < <(grep \"Potentially unused:\" \"$INPUT_FILE\")" 