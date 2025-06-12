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
