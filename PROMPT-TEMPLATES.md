# Prompt Templates for Feature Development

## How to Use These Templates

Replace [PLACEHOLDERS] with specific details for each feature. Each prompt should be focused on one specific task.

---

## 1. Component Creation Prompts

### Template:

```
Create a [COMPONENT_NAME] component for the [FEATURE_NAME] feature in the EVA Platform.

Requirements:
- Purpose: [DESCRIBE_PURPOSE]
- Location: src/components/[FEATURE_FOLDER]/[COMPONENT_NAME].tsx
- Props: [LIST_PROPS]
- State: [LIST_STATE_NEEDS]
- Integration: Must work with [EXISTING_COMPONENTS]

Technical specifications:
- Use React functional components with TypeScript
- Follow existing design patterns in the codebase
- Include proper error handling
- Make it responsive using Tailwind CSS
- Add accessibility features (ARIA labels, keyboard navigation)

The component should [SPECIFIC_FUNCTIONALITY].
```

---

## 2. API Integration Prompts

### Template:

```
Integrate the [API_NAME] API into the [FEATURE_NAME] feature.

API Details:
- Endpoint: [API_ENDPOINT]
- Authentication: [AUTH_METHOD]
- Purpose: [WHAT_IT_DOES]

Requirements:
- Create service file: src/api/services/[SERVICE_NAME]Service.ts
- Handle all error cases
- Implement retry logic for failed requests
- Add proper TypeScript types
- Include loading states
- Cache responses where appropriate

The integration should [EXPECTED_BEHAVIOR].
```

---

## 3. State Management Prompts

### Template:

```
Implement state management for [FEATURE_NAME] using [React Context/Redux/Zustand].

State Requirements:
- Data structure: [DESCRIBE_DATA]
- Actions needed: [LIST_ACTIONS]
- Side effects: [LIST_SIDE_EFFECTS]

Create:
- Context/Store at: src/contexts/[FEATURE_NAME]Context.tsx
- Custom hooks for accessing state
- Proper TypeScript interfaces

The state should handle [SPECIFIC_SCENARIOS].
```

---

## 4. Form Implementation Prompts

### Template:

```
Create a [FORM_NAME] form for [FEATURE_NAME] with the following fields:

Fields:
[LIST_ALL_FIELDS_WITH_TYPES]

Requirements:
- Validation rules: [LIST_VALIDATION_RULES]
- Multi-step: [YES/NO - IF YES, DESCRIBE STEPS]
- Auto-save: [YES/NO]
- File uploads: [YES/NO - IF YES, DESCRIBE]

Technical requirements:
- Use React Hook Form or similar
- Real-time validation
- Proper error messages
- Accessibility compliant
- Mobile responsive

The form should [SUBMISSION_BEHAVIOR].
```

---

## 5. Testing Prompts

### Template:

```
Write comprehensive tests for [COMPONENT/FEATURE_NAME].

Test Coverage:
- Unit tests for: [LIST_FUNCTIONS/COMPONENTS]
- Integration tests for: [LIST_INTEGRATIONS]
- E2E tests for: [LIST_USER_FLOWS]

Requirements:
- Use Jest and React Testing Library
- Achieve >80% code coverage
- Test error scenarios
- Test loading states
- Test accessibility

Focus on testing [CRITICAL_FUNCTIONALITY].
```

---

## 6. UI/UX Enhancement Prompts

### Template:

```
Enhance the UI/UX of [FEATURE_NAME] with the following improvements:

Current State: [DESCRIBE_CURRENT]
Desired State: [DESCRIBE_DESIRED]

Requirements:
- Visual improvements: [LIST_VISUAL_CHANGES]
- Interaction improvements: [LIST_INTERACTION_CHANGES]
- Performance improvements: [LIST_PERFORMANCE_NEEDS]
- Accessibility improvements: [LIST_A11Y_NEEDS]

Use existing design system components where possible.
Follow the EVA Platform design guidelines.
```

---

## 7. Data Model Prompts

### Template:

```
Design and implement the data model for [FEATURE_NAME].

Entities:
[LIST_ENTITIES_WITH_RELATIONSHIPS]

Requirements:
- TypeScript interfaces in: src/types/[FEATURE_NAME].ts
- API response types
- Database schema (if needed)
- Validation schemas

The data model should support [USE_CASES].
```

---

## 8. Performance Optimization Prompts

### Template:

```
Optimize the performance of [FEATURE_NAME/COMPONENT].

Current Issues:
- [LIST_PERFORMANCE_PROBLEMS]

Requirements:
- Implement lazy loading for: [COMPONENTS/DATA]
- Add pagination for: [LARGE_LISTS]
- Optimize re-renders using: [React.memo/useMemo/useCallback]
- Cache data using: [CACHING_STRATEGY]

Target metrics:
- Page load: < 2 seconds
- Interaction delay: < 100ms
- Memory usage: [SPECIFY_LIMITS]
```

---

## 9. Security Implementation Prompts

### Template:

```
Implement security measures for [FEATURE_NAME].

Security Requirements:
- Authentication: [DESCRIBE_AUTH_NEEDS]
- Authorization: [DESCRIBE_PERMISSION_NEEDS]
- Data encryption: [WHAT_NEEDS_ENCRYPTION]
- Input validation: [VALIDATION_RULES]
- API security: [SECURITY_HEADERS/TOKENS]

Compliance needs:
- [LIST_COMPLIANCE_REQUIREMENTS]

The implementation should prevent [SECURITY_THREATS].
```

---

## 10. Documentation Prompts

### Template:

```
Create comprehensive documentation for [FEATURE_NAME].

Documentation needed:
- User guide: How to use the feature
- API documentation: Endpoints and responses
- Developer guide: How to extend/modify
- Deployment guide: Configuration and setup

Format:
- Location: docs/[FEATURE_NAME]/
- Include code examples
- Add screenshots/diagrams
- Write troubleshooting section

The documentation should help [TARGET_AUDIENCE] to [ACHIEVE_GOAL].
```

---

## Example Prompt Using Template

### Credit Application Multi-Step Flow:

```
Create a MultiStepApplicationFlow component for the Credit Application feature in the EVA Platform.

Requirements:
- Purpose: Guide users through a multi-step credit application process
- Location: src/components/credit/MultiStepApplicationFlow.tsx
- Props: currentStep, totalSteps, onStepChange, applicationData
- State: currentStepData, validationErrors, isSubmitting
- Integration: Must work with existing SafeForms components

Technical specifications:
- Use React functional components with TypeScript
- Follow existing design patterns in the codebase
- Include proper error handling
- Make it responsive using Tailwind CSS
- Add accessibility features (ARIA labels, keyboard navigation)

The component should:
1. Display a progress indicator showing current step
2. Allow navigation between steps (with validation)
3. Persist form data between steps
4. Show step-specific forms from SafeForms
5. Handle final submission to the API
```
