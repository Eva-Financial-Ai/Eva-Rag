#!/bin/bash

echo "Performing deep component usage analysis..."

# Directory to analyze
COMPONENTS_DIR="./categorized-components/2-potentially-needed"
ANALYSIS_FILE="component-usage-analysis.txt"

# Create/clear output file
> $ANALYSIS_FILE

echo "# Deep Component Usage Analysis" >> $ANALYSIS_FILE
echo "" >> $ANALYSIS_FILE
echo "This analysis checks for more complex usage patterns of components that might have been missed by the initial scan." >> $ANALYSIS_FILE
echo "" >> $ANALYSIS_FILE

# Function to perform a deeper analysis of component usage
analyze_component() {
    local file="$1"
    local filename=$(basename "$file")
    local component_name="${filename%.*}"
    
    echo "Analyzing component: $component_name" >> $ANALYSIS_FILE
    echo "------------------------" >> $ANALYSIS_FILE
    
    # Check for direct imports
    echo "1. Direct imports:" >> $ANALYSIS_FILE
    grep -r "import.*$component_name" --include="*.ts*" --include="*.js*" src/ | grep -v "$file" >> $ANALYSIS_FILE
    
    # Check for dynamic imports
    echo "" >> $ANALYSIS_FILE
    echo "2. Dynamic imports:" >> $ANALYSIS_FILE
    grep -r "React.lazy.*$component_name\|import(.*$component_name\|React.lazy\(().*=>.*import.*$component_name" --include="*.ts*" --include="*.js*" src/ >> $ANALYSIS_FILE
    
    # Check for JSX usage
    echo "" >> $ANALYSIS_FILE
    echo "3. JSX usage:" >> $ANALYSIS_FILE
    grep -r "<$component_name[ />]" --include="*.ts*" --include="*.js*" src/ | grep -v "$file" >> $ANALYSIS_FILE
    
    # Check for variable/property component usage (e.g., const MyComponent = components.SomeComponent)
    echo "" >> $ANALYSIS_FILE
    echo "4. Variable/property component usage:" >> $ANALYSIS_FILE
    grep -r "\(components\.\|[a-zA-Z]\+\[['\"]\)$component_name['\"]" --include="*.ts*" --include="*.js*" src/ >> $ANALYSIS_FILE
    
    # Check for string references (for dynamic component rendering)
    echo "" >> $ANALYSIS_FILE
    echo "5. String references:" >> $ANALYSIS_FILE
    grep -r "['\"]\(component\|Component\|type\|Type\)['\"].*[\"']$component_name[\"']" --include="*.ts*" --include="*.js*" src/ >> $ANALYSIS_FILE
    
    echo "" >> $ANALYSIS_FILE
    echo "6. Component Registration:" >> $ANALYSIS_FILE
    grep -r "componentMap\|registerComponent\|components\[" --include="*.ts*" --include="*.js*" src/ | grep "$component_name" >> $ANALYSIS_FILE
    
    # Check for similar component names (might be renamed imports)
    echo "" >> $ANALYSIS_FILE
    echo "7. Similar component names:" >> $ANALYSIS_FILE
    local similar_pattern=$(echo $component_name | sed 's/\([A-Z]\)/ \1/g' | tr -s ' ' | sed 's/^ //')
    for word in $similar_pattern; do
        grep -r "\<$word" --include="*.ts*" --include="*.js*" src/ | head -n 5 >> $ANALYSIS_FILE
    done
    
    echo "" >> $ANALYSIS_FILE
    echo "Recommendation:" >> $ANALYSIS_FILE
    
    # Analyze results and make a recommendation
    local direct_imports=$(grep -c "import.*$component_name" --include="*.ts*" --include="*.js*" src/ | grep -v "$file")
    local dynamic_imports=$(grep -c "React.lazy.*$component_name\|import(.*$component_name" --include="*.ts*" --include="*.js*" src/)
    local jsx_usage=$(grep -c "<$component_name[ />]" --include="*.ts*" --include="*.js*" src/ | grep -v "$file")
    local var_usage=$(grep -c "\(components\.\|[a-zA-Z]\+\[['\"]\)$component_name['\"]" --include="*.ts*" --include="*.js*" src/)
    
    if [[ $direct_imports -gt 0 || $dynamic_imports -gt 0 || $jsx_usage -gt 0 || $var_usage -gt 0 ]]; then
        echo "This component appears to be USED but through a method that our basic detection missed." >> $ANALYSIS_FILE
        echo "Review the usage patterns above and keep the component." >> $ANALYSIS_FILE
    else
        echo "This component is likely UNUSED. Consider removing it or adding proper imports if needed." >> $ANALYSIS_FILE
    fi
    
    echo "" >> $ANALYSIS_FILE
    echo "=======================================================" >> $ANALYSIS_FILE
    echo "" >> $ANALYSIS_FILE
}

# Find all component files in the potentially needed directory
find "$COMPONENTS_DIR" -type f -name "*.tsx" -o -name "*.jsx" | while read -r file; do
    analyze_component "$file"
done

echo "Deep component analysis completed. Results saved to $ANALYSIS_FILE"
echo "Please review the analysis file to determine which components should be kept." 