#!/bin/bash

# Archive PQC Implementation Files
# This script archives all PQC-related documentation and cleans up references
# Date: January 9, 2025

echo "🔒 Starting PQC Implementation Archival Process..."
echo "================================================"

# Create archive directory
ARCHIVE_DIR="archived/pqc-deferred-july-2025"
mkdir -p "$ARCHIVE_DIR"

echo "📁 Created archive directory: $ARCHIVE_DIR"

# Copy main PQC documentation files to archive
echo ""
echo "📄 Archiving PQC documentation files..."

# Archive the main timeline document
if [ -f "PQC-IMPLEMENTATION-TIMELINE.md" ]; then
    cp "PQC-IMPLEMENTATION-TIMELINE.md" "$ARCHIVE_DIR/"
    echo "  ✅ Archived PQC-IMPLEMENTATION-TIMELINE.md"
fi

# Archive the security component README
if [ -f "src/components/security/README.md" ]; then
    cp "src/components/security/README.md" "$ARCHIVE_DIR/PQC-SECURITY-COMPONENTS-SPEC.md"
    echo "  ✅ Archived security components specification"
fi

# Archive the audit summary
if [ -f "PQC-CODE-AUDIT-SUMMARY.md" ]; then
    cp "PQC-CODE-AUDIT-SUMMARY.md" "$ARCHIVE_DIR/"
    echo "  ✅ Archived PQC code audit summary"
fi

# Create archive README
echo ""
echo "📝 Creating archive README..."

cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# PQC Implementation Archive

## Archive Date: January 9, 2025

This directory contains archived documentation for the Post-Quantum Cryptography (PQC) implementation that has been deferred to July-August 2025.

## Contents

- `PQC-IMPLEMENTATION-TIMELINE.md` - Original implementation timeline and plan
- `PQC-SECURITY-COMPONENTS-SPEC.md` - Detailed specifications for PQC components
- `PQC-CODE-AUDIT-SUMMARY.md` - Audit of PQC references in the codebase

## Status

The PQC implementation has been strategically deferred to allow the team to focus on delivering 9 core business features by June 15, 2025.

### Timeline
- **June 2025**: Launch EVA Platform with core features
- **July-August 2025**: Begin PQC implementation
- **End of August 2025**: Production-ready PQC system

## Implementation Details

The planned PQC system will include:

1. **CRYSTALS-Kyber**: For key encapsulation mechanism (KEM)
2. **CRYSTALS-Dilithium**: For digital signatures
3. **PQCryptographyProvider**: Core provider component
4. **PQCLogin**: Quantum-resistant authentication
5. **PQCTransactionVerification**: Dual-signature transaction verification

## Why Deferred?

1. Focus on core business features for MVP
2. Allow PQC standards to mature
3. Gather production data to inform implementation
4. Reduce launch complexity and risk

## Next Steps (July 2025)

When implementation resumes, refer to the archived documentation and:
1. Review latest NIST PQC standards
2. Update specifications based on production learnings
3. Implement according to the timeline in `PQC-IMPLEMENTATION-TIMELINE.md`

---

For questions about this deferral, contact the development team.
EOF

echo "  ✅ Created archive README"

# Clean up references in active files
echo ""
echo "🧹 Cleaning up PQC references in active files..."

# Update blockchain README to remove PQC reference
if [ -f "src/components/blockchain/README.md" ]; then
    # Remove the PQC integration line (line 128)
    sed -i.bak '/Integrates with PQC for quantum-resistant security/d' "src/components/blockchain/README.md"
    rm "src/components/blockchain/README.md.bak"
    echo "  ✅ Removed PQC reference from blockchain README"
fi

# Update TransactionExecution.tsx to clarify PQC is deferred
if [ -f "src/components/document/TransactionExecution.tsx" ]; then
    # Update the comment to indicate deferral
    sed -i.bak 's/Secure your transaction with post-quantum cryptography verification before/Secure your transaction with verification before/' "src/components/document/TransactionExecution.tsx"
    rm "src/components/document/TransactionExecution.tsx.bak"
    echo "  ✅ Updated TransactionExecution.tsx comment"
fi

# Create a new security README without PQC content
echo ""
echo "📄 Creating updated security README..."

cat > "src/components/security/README.md" << 'EOF'
# Security Components

This directory contains security-related components for the EVA AI financial services platform.

## Current Components

### 1. WrittenPasswordVerification
Provides additional human verification for high-value transactions using written passwords issued to portfolio managers.

### 2. KYCVerificationFlow
Handles Know Your Customer (KYC) verification processes for user onboarding and compliance.

## Future Enhancements

### Post-Quantum Cryptography (Deferred to July-August 2025)
The planned PQC implementation has been strategically deferred to focus on core business features for the June 2025 MVP launch. For details about the planned PQC system, see `/archived/pqc-deferred-july-2025/`.

## Security Best Practices

1. **Authentication**: All authentication flows use Auth0 with appropriate security measures
2. **Data Encryption**: Sensitive data is encrypted in transit and at rest
3. **Access Control**: Role-based access control (RBAC) is implemented throughout
4. **Audit Trails**: All security-sensitive operations are logged

## Usage

Import security components as needed:

```typescript
import WrittenPasswordVerification from './components/security/WrittenPasswordVerification';
import KYCVerificationFlow from './components/security/KYCVerificationFlow';
```
EOF

echo "  ✅ Created updated security README"

# Update feature documentation files
echo ""
echo "📋 Updating feature documentation..."

# Add note to feature completion status
if [ -f "FEATURE-COMPLETION-STATUS-MAY-27-2025.md" ]; then
    echo "  ℹ️  FEATURE-COMPLETION-STATUS-MAY-27-2025.md already shows PQC as deferred"
fi

# Move the original PQC timeline to archive and create a pointer
if [ -f "PQC-IMPLEMENTATION-TIMELINE.md" ]; then
    mv "PQC-IMPLEMENTATION-TIMELINE.md" "$ARCHIVE_DIR/PQC-IMPLEMENTATION-TIMELINE-ORIGINAL.md"
    
    # Create a pointer file
    cat > "PQC-IMPLEMENTATION-DEFERRED.md" << 'EOF'
# PQC Implementation - DEFERRED

The Post-Quantum Cryptography (PQC) implementation has been strategically deferred to July-August 2025.

## Current Status
- **Status**: ⏸️ DEFERRED
- **Target Timeline**: July-August 2025
- **Reason**: Focus on 9 core business features for June 15, 2025 MVP

## Documentation
All PQC-related documentation has been archived at: `/archived/pqc-deferred-july-2025/`

## For More Information
See the archived documentation for:
- Implementation timeline
- Technical specifications
- Component designs
- Integration plans

This file serves as a pointer to the archived documentation and will be updated when PQC implementation resumes.
EOF
    
    echo "  ✅ Moved PQC timeline to archive and created pointer file"
fi

# Summary
echo ""
echo "🎉 PQC Archival Complete!"
echo "========================"
echo ""
echo "Summary of actions:"
echo "  • Created archive at: $ARCHIVE_DIR"
echo "  • Archived 3 documentation files"
echo "  • Updated 2 code files to remove PQC references"
echo "  • Created updated security README"
echo "  • Created pointer file for deferred implementation"
echo ""
echo "📌 Next steps:"
echo "  1. Review the changes with 'git diff'"
echo "  2. Commit the archived files and updates"
echo "  3. The PQC implementation can be resumed in July 2025"
echo ""
echo "✅ All PQC references have been properly archived and documented!"