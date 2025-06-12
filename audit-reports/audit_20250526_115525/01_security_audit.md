# Section 1: Security & Authentication Audit

## Findings:

### 1.1 Encryption Implementation
src/types/UserTypes.ts:  taxId?: string;
src/config/redis.ts:  password: process.env.REACT_APP_REDIS_PASSWORD,
src/utils/validation.ts:  password: z.string()
src/utils/rateLimiter.ts:   * @param actionKey - Unique identifier for the action (e.g., 'login', 'password-reset')
src/utils/rateLimiter.ts:  passwordReset: {
src/utils/formValidation.ts:export const passwordSchema = z
src/utils/formValidation.ts:      password: passwordSchema,
src/utils/formValidation.ts: * @param ssn - SSN string to validate
src/utils/formValidation.ts:export const validateSSN = (ssn: string): ValidationResult => {
src/utils/formValidation.ts:  if (!ssn) {
src/utils/formValidation.ts:  const digitsOnly = ssn.replace(/\D/g, '');
src/utils/formValidation.ts: * @param ssn - SSN string
src/utils/formValidation.ts:export const formatSSN = (ssn: string): string => {
src/utils/formValidation.ts:  const digitsOnly = ssn.replace(/\D/g, '');
src/utils/formValidation.ts:  return ssn;
src/components/PlaidLinkModal.tsx:    password: '',
src/components/PlaidLinkModal.tsx:                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
src/components/PlaidLinkModal.tsx:                    id="password"
src/components/PlaidLinkModal.tsx:                    type="password"
src/components/PlaidLinkModal.tsx:                    value={credentials.password}
src/components/PlaidLinkModal.tsx:                    onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
src/components/credit/BusinessTaxReturns.tsx:  const [irsCredentials, setIRSCredentials] = useState({ username: '', password: '' });
src/components/credit/BusinessTaxReturns.tsx:        password: irsCredentials.password,
src/components/credit/BusinessTaxReturns.tsx:                  type="password"
src/components/credit/BusinessTaxReturns.tsx:                  value={irsCredentials.password}
src/components/credit/BusinessTaxReturns.tsx:                  onChange={e => setIRSCredentials(prev => ({ ...prev, password: e.target.value }))}
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:    ssn: '',
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:                name="ssn"
src/components/credit/SafeForms/PersonalFinanceStatement.tsx:                value={formData.ssn}
src/components/credit/SafeForms/AdditionalOwnerTrust.tsx:    taxId: '',
src/components/credit/SafeForms/AdditionalOwnerTrust.tsx:                name="taxId"
src/components/credit/SafeForms/AdditionalOwnerTrust.tsx:                value={formData.taxId}
src/components/credit/SafeForms/AdditionalOwnerIndividual.tsx:    ssn: '',
src/components/credit/SafeForms/AdditionalOwnerIndividual.tsx:                name="ssn"
src/components/credit/SafeForms/AdditionalOwnerIndividual.tsx:                value={formData.ssn}
src/components/credit/SafeForms/CreditApplication.tsx:  ssn: string;
src/components/credit/SafeForms/CreditApplication.tsx:  ssnSignatureData: string | null;
src/components/credit/SafeForms/CreditApplication.tsx:  const [taxId, setTaxId] = useState('');
src/components/credit/SafeForms/CreditApplication.tsx:        ssn: '',
src/components/credit/SafeForms/CreditApplication.tsx:        ssnSignatureData: null,
src/components/credit/SafeForms/CreditApplication.tsx:      setTaxId(initialData.taxId || '');
src/components/credit/SafeForms/CreditApplication.tsx:              ssn: initialData.ownerSsn || '',
src/components/credit/SafeForms/CreditApplication.tsx:    type: 'ssn' | 'ein'
src/components/credit/SafeForms/CreditApplication.tsx:          if (owner.ownerType === 'individual' && type === 'ssn' && owner.individualDetails) {
src/components/credit/SafeForms/CreditApplication.tsx:              individualDetails: { ...owner.individualDetails, ssnSignatureData: signatureData },
src/components/credit/SafeForms/CreditApplication.tsx:  const clearOwnerSignature = (ownerId: string, type: 'ssn' | 'ein') => {
src/components/credit/SafeForms/CreditApplication.tsx:    const refKey = type === 'ssn' ? `${ownerId}_ssn` : `${ownerId}_ein`;
src/components/credit/SafeForms/CreditApplication.tsx:        ssn: '',
src/components/credit/SafeForms/CreditApplication.tsx:        ssnSignatureData: null,
src/components/credit/SafeForms/CreditApplication.tsx:    const ssnRefKey = `${ownerId}_ssn`;
src/components/credit/SafeForms/CreditApplication.tsx:    if (sigPadRefs.current[ssnRefKey]) delete sigPadRefs.current[ssnRefKey];
src/components/credit/SafeForms/CreditApplication.tsx:      taxId,
src/components/credit/SafeForms/CreditApplication.tsx:          const sigPad = sigPadRefs.current[`${id}_ssn`];
src/components/credit/SafeForms/CreditApplication.tsx:          if (sigPad?.isEmpty() && owner.individualDetails.ssnSignatureData) {
src/components/credit/SafeForms/CreditApplication.tsx:              individualDetails: { ...ownerData.individualDetails!, ssnSignatureData: null },
src/components/credit/SafeForms/CreditApplication.tsx:        if (isBusinessEinSigEmpty && taxId && businessEinSignature) {
src/components/credit/SafeForms/CreditApplication.tsx:    if (fields.taxId) setTaxId(fields.taxId);
src/components/credit/SafeForms/CreditApplication.tsx:              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
src/components/credit/SafeForms/CreditApplication.tsx:                id="taxId"
src/components/credit/SafeForms/CreditApplication.tsx:                value={taxId}
src/components/credit/SafeForms/CreditApplication.tsx:                    value={owner.individualDetails.ssn}
src/components/credit/SafeForms/CreditApplication.tsx:                      handleOwnerInputChange(owner.id, 'individualDetails.ssn', e.target.value)
src/components/credit/SafeForms/CreditApplication.tsx:                        sigPadRefs.current[`${owner.id}_ssn`] = ref;
src/components/credit/SafeForms/CreditApplication.tsx:                        const sigData = sigPadRefs.current[`${owner.id}_ssn`]?.toDataURL() || null;
src/components/credit/SafeForms/CreditApplication.tsx:                        handleOwnerSignatureEnd(owner.id, sigData, 'ssn');
src/components/credit/SafeForms/CreditApplication.tsx:                      onClick={() => clearOwnerSignature(owner.id, 'ssn')}
src/components/credit/SafeForms/CreditApplication.tsx:                if (fields.ssn) updatedOwners[index].individualDetails!.ssn = fields.ssn;
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '12-3456789',
src/components/credit/SafeForms/FormTemplates.ts:        ssn: '123-45-6789',
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '98-7654321',
src/components/credit/SafeForms/FormTemplates.ts:        ssn: '987-65-4321',
src/components/credit/SafeForms/FormTemplates.ts:        ssn: '234-56-7890',
src/components/credit/SafeForms/FormTemplates.ts:        ssn: '345-67-8901',
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '23-4567890',
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '34-5678901',
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '45-6789012',
src/components/credit/SafeForms/FormTemplates.ts:        taxId: '56-7890123',
src/components/credit/BorrowerSelector.tsx:  taxId: string;
src/components/credit/BorrowerSelector.tsx:    ssn?: string;
src/components/credit/BorrowerSelector.tsx:            taxId: '12-3456789',
src/components/credit/BorrowerSelector.tsx:                ssn: '123-45-6789',
src/components/credit/BorrowerSelector.tsx:                ssn: '987-65-4321',
src/components/credit/BorrowerSelector.tsx:            taxId: '98-7654321',
src/components/credit/BorrowerSelector.tsx:                ssn: '456-78-9012',
src/components/credit/BorrowerSelector.tsx:            taxId: '45-6789012',
src/components/credit/BorrowerSelector.tsx:                ssn: '567-89-0123',
src/components/credit/BorrowerSelector.tsx:      borrower.taxId.includes(searchTerm)
src/components/credit/BorrowerSelector.tsx:                                {borrower.taxId}
src/components/credit/FinancialAccountConnector.tsx:                            htmlFor="password"
src/components/credit/FinancialAccountConnector.tsx:                            type="password"
src/components/credit/FinancialAccountConnector.tsx:                            id="password"
src/components/credit/FinancialStatements.tsx:                  type="password"
src/components/credit/SafeForms.tsx:  taxId: string;
src/components/credit/SafeForms.tsx:  ssn: string;
src/components/credit/SafeForms.tsx:          taxId: '12-3456789',
src/components/credit/SafeForms.tsx:          taxId: '98-7654321',
src/components/credit/SafeForms.tsx:          ssn: '123-45-6789',
src/components/credit/SafeForms.tsx:          ssn: '987-65-4321',
src/components/credit/SafeForms.tsx:        taxId: prefillData.taxId,
src/components/credit/SafeForms.tsx:        if (primaryOwner.ssn) {
src/components/credit/SafeForms.tsx:          mappedData.ownerSSN = primaryOwner.ssn;
src/components/credit/SafeForms.tsx:          taxId: selectedBusiness.taxId,
src/components/credit/SafeForms.tsx:          <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
src/components/credit/SafeForms.tsx:            name="taxId"
src/components/credit/SafeForms.tsx:            id="taxId"
src/components/credit/SafeForms.tsx:            value={formData.taxId || ''}
src/components/CreditApplicationForm.tsx:  taxId: string;
src/components/CreditApplicationForm.tsx:      taxId: initialData.taxId || '',
src/components/CreditApplicationForm.tsx:        taxId: '',
src/components/CreditApplicationForm.tsx:        const { businessName, taxId, address, city, state, zipCode, email, phone } = e.detail;
src/components/CreditApplicationForm.tsx:          taxId: taxId || prevData.taxId,
src/components/CreditApplicationForm.tsx:    if (name === 'taxId') {
src/components/CreditApplicationForm.tsx:    // Update taxId validation to check for unknownEin flag
src/components/CreditApplicationForm.tsx:    if (!formData.taxId && !formData.unknownEin) {
src/components/CreditApplicationForm.tsx:      newErrors.taxId = 'Tax ID/EIN is required';
src/components/CreditApplicationForm.tsx:    } else if (formData.taxId) {
src/components/CreditApplicationForm.tsx:      const einValidation = validateEIN(formData.taxId);
src/components/CreditApplicationForm.tsx:        newErrors.taxId = einValidation.message;
src/components/CreditApplicationForm.tsx:        if (primaryOwner.type === 'individual' && !primaryOwner.ssn) {
src/components/CreditApplicationForm.tsx:        taxId: business.taxId,
src/components/CreditApplicationForm.tsx:        taxId: business.taxId || '',
src/components/CreditApplicationForm.tsx:            ssn: owner.ssn || existingOwner.ssn,
src/components/CreditApplicationForm.tsx:          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="taxId">
src/components/CreditApplicationForm.tsx:              id="taxId"
src/components/CreditApplicationForm.tsx:              name="taxId"
src/components/CreditApplicationForm.tsx:              value={formData.taxId}
src/components/CreditApplicationForm.tsx:              className={`block w-full rounded-md border ${errors.taxId ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
src/components/CreditApplicationForm.tsx:                    taxId: isChecked ? '' : prev.taxId,
src/components/CreditApplicationForm.tsx:          {errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
src/components/security/WrittenPasswordVerification.tsx:  const [passwordReceived, setPasswordReceived] = useState(false);
src/components/security/WrittenPasswordVerification.tsx:      setError('Please enter the written password');
src/components/security/WrittenPasswordVerification.tsx:          verificationMethod: 'written-password',
src/components/security/WrittenPasswordVerification.tsx:        setError('Invalid written password. Please check and try again.');
src/components/security/WrittenPasswordVerification.tsx:                  To complete this transaction, you need a written password from a portfolio
src/components/security/WrittenPasswordVerification.tsx:          ) : !passwordReceived ? (
src/components/security/WrittenPasswordVerification.tsx:                    wait for them to provide you with the written password.
src/components/security/WrittenPasswordVerification.tsx:                  Please enter the written password provided by the portfolio manager.
src/components/security/WrittenPasswordVerification.tsx:                  Written passwords are case-sensitive and follow the format: EVA-PM-XXXX-XXXXX
src/components/security/WrittenPasswordVerification.tsx:                  <p>The written password has been verified by the system.</p>
src/components/security/WrittenPasswordVerification.tsx:                verificationMethod: 'written-password',
src/components/security/WrittenPasswordVerification.tsx:          Written passwords are issued to portfolio managers and are used to verify high-value or
src/components/AIChatAdvisor.tsx:        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
src/components/AIChatAdvisor.tsx:        { name: 'password', label: 'Password', type: 'password', required: true },
src/components/AIChatAdvisor.tsx:        { name: 'password', label: 'Online Banking Password', type: 'password', required: true },
src/components/AIChatAdvisor.tsx:        { name: 'apiKey', label: 'API Key/Secret', type: 'password', required: true },
src/components/AIChatAdvisor.tsx:        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
src/components/DocumentVerificationSystem.tsx:  taxId?: string;
src/components/DocumentVerificationSystem.tsx:                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
src/components/DocumentVerificationSystem.tsx:                      id="taxId"
src/components/DocumentVerificationSystem.tsx:                      name="taxId"
src/components/DocumentVerificationSystem.tsx:                      value={formData.taxId || ''}
src/components/BorrowerSelector.tsx:  taxId: string;
src/components/BorrowerSelector.tsx:            taxId: '82-4291042',
src/components/BorrowerSelector.tsx:            taxId: '46-8273910',
src/components/BorrowerSelector.tsx:            taxId: '35-7091284',
src/components/BorrowerSelector.tsx:            taxId: '91-5372810',
src/components/BorrowerSelector.tsx:            taxId: '576-29-4801',
src/components/BorrowerSelector.tsx:        borrower.taxId.includes(term)
src/components/BorrowerSelector.tsx:                      {borrower.taxId}
src/components/OwnerManager.tsx:          ssn: '',
src/components/OwnerManager.tsx:        ssn: '',
src/components/OwnerManager.tsx:      return hasCommonFields && !!owner.ssn && owner.ssn.trim().length >= 9 && !!owner.dateOfBirth;
src/components/ThirdPartyAuthModal.tsx:      type: 'text' | 'password' | 'email';
src/components/document/ShareDocumentModal.tsx:  const [passwordProtect, setPasswordProtect] = useState(false);
src/components/document/ShareDocumentModal.tsx:  const [password, setPassword] = useState('');
src/components/document/ShareDocumentModal.tsx:  const [passwordConfirm, setPasswordConfirm] = useState('');
src/components/document/ShareDocumentModal.tsx:          needsPassword: passwordProtect && requireForAll,
src/components/document/ShareDocumentModal.tsx:    // Validate password if enabled
src/components/document/ShareDocumentModal.tsx:    if (passwordProtect && (!password || password !== passwordConfirm)) {
src/components/document/ShareDocumentModal.tsx:      setError('Please ensure your password and confirmation match.');
src/components/document/ShareDocumentModal.tsx:      // In a real implementation, you would hash the password before sending
src/components/document/ShareDocumentModal.tsx:      if (passwordProtect) {
src/components/document/ShareDocumentModal.tsx:        // Update file with password protection
src/components/document/ShareDocumentModal.tsx:        file.passwordHash = password; // In reality, this would be hashed
src/components/document/ShareDocumentModal.tsx:                  checked={passwordProtect}
src/components/document/ShareDocumentModal.tsx:            {passwordProtect && (
src/components/document/ShareDocumentModal.tsx:                    htmlFor="share-password"
src/components/document/ShareDocumentModal.tsx:                    type="password"
src/components/document/ShareDocumentModal.tsx:                    id="share-password"
src/components/document/ShareDocumentModal.tsx:                    value={password}
src/components/document/ShareDocumentModal.tsx:                    htmlFor="share-password-confirm"
src/components/document/ShareDocumentModal.tsx:                    type="password"
src/components/document/ShareDocumentModal.tsx:                    id="share-password-confirm"
src/components/document/ShareDocumentModal.tsx:                    value={passwordConfirm}
src/components/document/ShareDocumentModal.tsx:                    Require password for all recipients
src/components/document/WrittenPasswordVerification.tsx:  const [passwordSent, setPasswordSent] = useState(false);
src/components/document/WrittenPasswordVerification.tsx:  // Demo verification password - would be generated and stored securely in a real app
src/components/document/WrittenPasswordVerification.tsx:  // Generate a random password for demo purposes
src/components/document/WrittenPasswordVerification.tsx:      console.log(`One-time password for transaction ${transactionId}: ${demoPassword}`);
src/components/document/WrittenPasswordVerification.tsx:    // In production, this would be a secure API call to verify the password
src/components/document/WrittenPasswordVerification.tsx:        setErrorMessage('Invalid password. Please try again.');
src/components/document/WrittenPasswordVerification.tsx:        {/* DEMO ONLY: Fixed password display */}
src/components/document/WrittenPasswordVerification.tsx:          <p className="text-sm font-bold text-yellow-800">DEMO MODE: Always working password</p>
src/components/document/WrittenPasswordVerification.tsx:            This password will always work during demo. In production, real passwords would be
src/components/document/WrittenPasswordVerification.tsx:        {!passwordSent ? (
src/components/document/WrittenPasswordVerification.tsx:              To complete this transaction, you need a written password from a portfolio manager.
src/components/document/WrittenPasswordVerification.tsx:              Please enter the written password provided by {selectedManager?.name}.
src/components/document/WrittenPasswordVerification.tsx:                Written passwords are case-sensitive. You can also use the demo password above.
src/components/document/WrittenPasswordVerification.tsx:            Written passwords are issued to portfolio managers and are used to verify high-value or
src/components/document/WrittenPasswordVerification.tsx:        {/* For DEMO purposes only - display generated password if one exists */}
src/components/document/FilelockDriveApp.tsx:  passwordHash?: string; // Hashed password for security
src/components/document/TransactionExecution.tsx:                          Written password verification complete!
src/components/document/TransactionExecution.tsx:                          You need a written password from a portfolio manager to verify this
src/components/OwnerComponent.tsx:  ssn?: string;
src/components/OwnerComponent.tsx:    if (name === 'ssn') {
src/components/OwnerComponent.tsx:          delete updatedOwner.ssn;
src/components/OwnerComponent.tsx:          delete updatedOwner.ssn;
src/components/OwnerComponent.tsx:              name="ssn"
src/components/OwnerComponent.tsx:              value={owner.ssn || ''}
src/components/OwnerComponent.tsx:            {errors.ssn && <p className="text-risk-red text-sm mt-1">{errors.ssn}</p>}
src/components/borrower/SimplifiedBorrowerInterface.tsx:                  <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
src/components/borrower/SimplifiedBorrowerInterface.tsx:                  id="ssn"
src/components/blockchain/ShieldProtocolDetails.tsx:                <span className="text-gray-700">One-time password authorization for release</span>
src/components/common/FileUpload/DocumentUploadModal.tsx:    if (einMatch) fields.taxId = einMatch[1].replace('-', '');
src/components/common/Form/FormField.tsx: * @param {string} type - Input type (text, email, password, etc.)
src/components/common/Input/Input.stories.tsx:      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
src/components/common/Input/Input.stories.tsx:    type: 'password',
src/components/common/Input/Input.stories.tsx:    placeholder: 'Enter your password',
src/components/common/Input/Input.stories.tsx:    type: 'password',
src/components/common/Input/Input.stories.tsx:    placeholder: 'Enter your password',
src/components/common/PasswordStrengthMeter.tsx:  password: string;
src/components/common/PasswordStrengthMeter.tsx:  password,
src/components/common/PasswordStrengthMeter.tsx:  // Calculate password strength
src/components/common/PasswordStrengthMeter.tsx:  const passwordStrength = useMemo(() => {
src/components/common/PasswordStrengthMeter.tsx:    if (!password) return 0;
src/components/common/PasswordStrengthMeter.tsx:    if (password.length >= 8) score += 1;
src/components/common/PasswordStrengthMeter.tsx:    if (password.length >= 12) score += 1;
src/components/common/PasswordStrengthMeter.tsx:    const uniqueChars = new Set(password).size;
src/components/common/PasswordStrengthMeter.tsx:  }, [password]);
src/components/common/PasswordStrengthMeter.tsx:    t('password.veryWeak', 'Very Weak'),
src/components/common/PasswordStrengthMeter.tsx:    t('password.weak', 'Weak'),
src/components/common/PasswordStrengthMeter.tsx:    t('password.fair', 'Fair'),
src/components/common/PasswordStrengthMeter.tsx:    t('password.good', 'Good'),
src/components/common/PasswordStrengthMeter.tsx:    t('password.strong', 'Strong'),
src/components/common/PasswordStrengthMeter.tsx:    label: strengthLabels[passwordStrength],
src/components/common/PasswordStrengthMeter.tsx:    color: strengthClasses[passwordStrength],
src/components/common/PasswordStrengthMeter.tsx:  // Return password criteria
src/components/common/PasswordStrengthMeter.tsx:  const passwordCriteria = useMemo(() => {
src/components/common/PasswordStrengthMeter.tsx:        label: t('password.criteria.length', 'At least 8 characters'),
src/components/common/PasswordStrengthMeter.tsx:        met: password.length >= 8,
src/components/common/PasswordStrengthMeter.tsx:        label: t('password.criteria.uppercase', 'Contains uppercase letter'),
src/components/common/PasswordStrengthMeter.tsx:        label: t('password.criteria.lowercase', 'Contains lowercase letter'),
src/components/common/PasswordStrengthMeter.tsx:        label: t('password.criteria.number', 'Contains number'),
src/components/common/PasswordStrengthMeter.tsx:        label: t('password.criteria.special', 'Contains special character'),
src/components/common/PasswordStrengthMeter.tsx:  }, [password, t]);
src/components/common/PasswordStrengthMeter.tsx:    <div className={`password-strength-meter ${className}`}>
src/components/common/PasswordStrengthMeter.tsx:              index <= passwordStrength
src/components/common/PasswordStrengthMeter.tsx:                ? strengthClasses[passwordStrength]
src/components/common/PasswordStrengthMeter.tsx:        {t('password.strength', 'Password strength')}:
src/components/common/PasswordStrengthMeter.tsx:            passwordStrength <= 1
src/components/common/PasswordStrengthMeter.tsx:              : passwordStrength === 2
src/components/common/PasswordStrengthMeter.tsx:                : passwordStrength >= 3
src/components/common/PasswordStrengthMeter.tsx:        {passwordCriteria.map((criterion, i) => (
src/components/common/FormFieldWithOther.tsx:  type: 'text' | 'select' | 'textarea' | 'number' | 'email' | 'password' | 'date';
src/components/common/FormFieldWithOther.tsx:        // Other input types (text, number, email, password, date)
src/components/UserSelector.tsx:  taxId?: string;
src/components/UserSelector.tsx:          taxId: '12-3456789',
src/components/UserSelector.tsx:          taxId: '98-7654321',
src/components/UserSelector.tsx:        taxId: user.taxId || '',
src/components/DocumentVerificationWrapper.tsx:  taxId?: string;
src/components/DocumentVerificationWrapper.tsx:    taxId: '12-3456789',
src/components/KYCVerificationFlow.tsx:  ssn: string;
src/components/KYCVerificationFlow.tsx:    ssn: '',
src/components/DatabaseSearch.tsx:  taxId: string;
src/components/DatabaseSearch.tsx:  ssn?: string;
src/components/DatabaseSearch.tsx:      taxId: '82-1234567',
src/components/DatabaseSearch.tsx:          ssn: '333-33-3333',
src/components/DatabaseSearch.tsx:          ssn: '444-44-4444',
src/components/DatabaseSearch.tsx:      taxId: '45-6789012',
src/components/DatabaseSearch.tsx:          ssn: '555-55-5555',
src/components/DatabaseSearch.tsx:      taxId: '33-4567890',
src/components/DatabaseSearch.tsx:          ssn: '666-66-6666',
src/components/DatabaseSearch.tsx:          ssn: '777-77-7777',
src/components/DatabaseSearch.tsx:            business.taxId.includes(searchQuery)
src/components/DatabaseSearch.tsx:            (owner.ssn && owner.ssn.includes(searchQuery))
src/components/DatabaseSearch.tsx:                        {(item as BusinessRecord).taxId}
src/components/IntelligentDataOrchestrator.tsx:        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
src/components/IntelligentDataOrchestrator.tsx:        { name: 'password', label: 'Password', type: 'password', required: true },
src/components/IntelligentDataOrchestrator.tsx:        { name: 'password', label: 'Online Banking Password', type: 'password', required: true },
src/components/IntelligentDataOrchestrator.tsx:        { name: 'apiKey', label: 'API Key/Secret', type: 'password', required: true },
src/components/IntelligentDataOrchestrator.tsx:        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
src/components/routing/LoadableRouter.tsx:                      alert(`Selected ${borrower.businessName}\nTax ID: ${borrower.taxId}`);
src/components/risk/PlaidBankConnection.tsx:    password: '',
src/components/risk/PlaidBankConnection.tsx:              Please enter your online banking username and password. Your credentials are securely transmitted via Plaid and not stored by us.
src/components/risk/PlaidBankConnection.tsx:                    type="password"
src/components/risk/PlaidBankConnection.tsx:                    value={credentials.password}
src/components/risk/PlaidBankConnection.tsx:                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
src/hooks/useAuth.ts:  password: string;
src/api/ShieldAuthConnector.ts:  ssn?: string; // Social Security Number (for US)
src/api/ShieldAuthConnector.ts:  taxId: string;
src/api/ShieldAuthConnector.ts:      if (request.ssn) {
src/api/ShieldAuthConnector.ts:        formData.append('ssn', request.ssn);
src/api/ShieldAuthConnector.ts:      formData.append('taxId', request.taxId);
src/api/authService.ts:  password: string;
src/api/authService.ts:    if (!credentials.email || !credentials.password) {
src/api/authService.ts:        error: 'Email and password are required.',
src/api/userService.ts:   * Change user password
src/api/userService.ts:      // Check if current password would be correct in a real environment
src/api/userService.ts:      if (currentPassword === 'password') {
src/api/userService.ts:        throw new Error('Current password is incorrect');
src/api/userService.ts:      `${API_ENDPOINTS.PROFILE}/change-password`,
src/api/services/irsApiService.ts:  password: string;
src/api/services/irsApiService.ts:  password: string;
src/api/services/irsApiService.ts:  ssn?: string;
src/api/services/irsApiService.ts:  ssn?: string;
src/api/services/irsApiService.ts:  ssn?: string;
src/api/services/irsApiService.ts:      if (!request.username || !request.password) {
src/pages/CreditApplication.tsx:      taxId: borrower.taxId,
src/pages/CreditApplication.tsx:    //       taxId: borrower.taxId,
src/pages/ProfileSettings.tsx:  const [passwordForm, setPasswordForm] = useState({
src/pages/ProfileSettings.tsx:  const [passwordErrors, setPasswordErrors] = useState<{
src/pages/ProfileSettings.tsx:    if (passwordErrors[name as keyof typeof passwordErrors]) {
src/pages/ProfileSettings.tsx:        delete newErrors[name as keyof typeof passwordErrors];
src/pages/ProfileSettings.tsx:    const errors: typeof passwordErrors = {};
src/pages/ProfileSettings.tsx:    if (!passwordForm.currentPassword) {
src/pages/ProfileSettings.tsx:      errors.currentPassword = 'Current password is required';
src/pages/ProfileSettings.tsx:    if (!passwordForm.newPassword) {
src/pages/ProfileSettings.tsx:      errors.newPassword = 'New password is required';
src/pages/ProfileSettings.tsx:    } else if (passwordForm.newPassword.length < 8) {
src/pages/ProfileSettings.tsx:    if (!passwordForm.confirmPassword) {
src/pages/ProfileSettings.tsx:      errors.confirmPassword = 'Please confirm your password';
src/pages/ProfileSettings.tsx:    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
src/pages/ProfileSettings.tsx:      .changePassword(passwordForm.currentPassword, passwordForm.newPassword)
src/pages/ProfileSettings.tsx:        showToast(t('profile.passwordUpdated'), 'success');
src/pages/ProfileSettings.tsx:            currentPassword: 'Current password is incorrect',
src/pages/ProfileSettings.tsx:          {passwordErrors.general && (
src/pages/ProfileSettings.tsx:              {passwordErrors.general}
src/pages/ProfileSettings.tsx:                type="password"
src/pages/ProfileSettings.tsx:                value={passwordForm.currentPassword}
src/pages/ProfileSettings.tsx:                  passwordErrors.currentPassword
src/pages/ProfileSettings.tsx:                aria-invalid={passwordErrors.currentPassword ? 'true' : 'false'}
src/pages/ProfileSettings.tsx:                  passwordErrors.currentPassword ? 'current-password-error' : undefined
src/pages/ProfileSettings.tsx:              {passwordErrors.currentPassword && (
src/pages/ProfileSettings.tsx:                  id="current-password-error"
src/pages/ProfileSettings.tsx:                  {passwordErrors.currentPassword}
src/pages/ProfileSettings.tsx:                type="password"
src/pages/ProfileSettings.tsx:                value={passwordForm.newPassword}
src/pages/ProfileSettings.tsx:                  passwordErrors.newPassword
src/pages/ProfileSettings.tsx:                aria-invalid={passwordErrors.newPassword ? 'true' : 'false'}
src/pages/ProfileSettings.tsx:                aria-describedby={passwordErrors.newPassword ? 'new-password-error' : undefined}
src/pages/ProfileSettings.tsx:              {passwordErrors.newPassword && (
src/pages/ProfileSettings.tsx:                <p id="new-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
src/pages/ProfileSettings.tsx:                  {passwordErrors.newPassword}
src/pages/ProfileSettings.tsx:              {passwordForm.newPassword && (
src/pages/ProfileSettings.tsx:                <PasswordStrengthMeter password={passwordForm.newPassword} className="mt-3" />
src/pages/ProfileSettings.tsx:                type="password"
src/pages/ProfileSettings.tsx:                value={passwordForm.confirmPassword}
src/pages/ProfileSettings.tsx:                  passwordErrors.confirmPassword
src/pages/ProfileSettings.tsx:                aria-invalid={passwordErrors.confirmPassword ? 'true' : 'false'}
src/pages/ProfileSettings.tsx:                  passwordErrors.confirmPassword ? 'confirm-password-error' : undefined
src/pages/ProfileSettings.tsx:              {passwordErrors.confirmPassword && (
src/pages/ProfileSettings.tsx:                  id="confirm-password-error"
src/pages/ProfileSettings.tsx:                  {passwordErrors.confirmPassword}
src/pages/ProfileSettings.tsx:              'Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.'
src/pages/TransactionExecution.tsx:                    For security purposes, please enter the covenant password provided during
src/pages/TransactionExecution.tsx:                      type="password"
src/pages/TransactionExecution.tsx:                      placeholder="Enter covenant password"
src/pages/TransactionExecution.tsx:                      <p className="text-gray-500">Enter the password to view covenant details</p>
src/services/AuthService.ts:  password: string;
src/services/AuthService.ts:   * Login with email and password
src/index.tsx:// Log Auth0 configuration status
src/index.tsx:console.log('🔐 Auth0 Configuration:', {
src/App.tsx:import { useAuth0ApiClient } from './hooks/useAuth0ApiClient'; // Initialize Auth0 API client
src/App.tsx:  // Initialize Auth0 API client
src/App.tsx:  useAuth0ApiClient();
src/contexts/Auth0Context.tsx:import { useAuth0Extended } from '../providers/Auth0Provider';
src/contexts/Auth0Context.tsx:import { mapAuth0RoleToEVA } from '../config/auth0';
src/contexts/Auth0Context.tsx:interface Auth0ContextType {
src/contexts/Auth0Context.tsx:const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);
src/contexts/Auth0Context.tsx:// Auth0Context Provider props
src/contexts/Auth0Context.tsx:interface Auth0ContextProviderProps {
src/contexts/Auth0Context.tsx:// Auth0Context Provider component
src/contexts/Auth0Context.tsx:export const Auth0ContextProvider: React.FC<Auth0ContextProviderProps> = ({ children }) => {
src/contexts/Auth0Context.tsx:  } = useAuth0Extended();
src/contexts/Auth0Context.tsx:  // Transform Auth0 user to our User interface
src/contexts/Auth0Context.tsx:      const evaRole = mapAuth0RoleToEVA(roles);
src/contexts/Auth0Context.tsx:  // Handle Auth0 errors
src/contexts/Auth0Context.tsx:  const contextValue: Auth0ContextType = {
src/contexts/Auth0Context.tsx:  return <Auth0Context.Provider value={contextValue}>{children}</Auth0Context.Provider>;
src/contexts/Auth0Context.tsx:export const useAuth0Context = (): Auth0ContextType => {
src/contexts/Auth0Context.tsx:  const context = useContext(Auth0Context);
src/contexts/Auth0Context.tsx:    throw new Error('useAuth0Context must be used within an Auth0ContextProvider');
src/contexts/Auth0Context.tsx:export const useAuth = useAuth0Context;
src/config/auth0.ts: * Auth0 Configuration
src/config/auth0.ts: * This file contains all Auth0-related configuration
src/config/auth0.ts:export const getAuth0Scope = () => {
src/config/auth0.ts:// Role mapping from Auth0 roles to EVA platform roles
src/config/auth0.ts:export const mapAuth0RoleToEVA = (auth0Roles: string[]): string => {
src/config/auth0.ts:  // Map Auth0 roles to EVA platform roles
src/providers/Auth0Provider.tsx:import { Auth0Provider as Auth0ProviderSDK, useAuth0 as useAuth0SDK } from '@auth0/auth0-react';
src/providers/Auth0Provider.tsx:import { auth0Config, getAuth0Scope } from '../config/auth0';
src/providers/Auth0Provider.tsx:interface Auth0ProviderProps {
src/providers/Auth0Provider.tsx: * Custom Auth0 Provider that wraps the Auth0 SDK provider
src/providers/Auth0Provider.tsx:export const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
src/providers/Auth0Provider.tsx:    <Auth0ProviderSDK
src/providers/Auth0Provider.tsx:        scope: getAuth0Scope(),
src/providers/Auth0Provider.tsx:    </Auth0ProviderSDK>
src/providers/Auth0Provider.tsx: * Custom hook that extends useAuth0 with additional functionality
src/providers/Auth0Provider.tsx:export const useAuth0Extended = () => {
src/providers/Auth0Provider.tsx:  const auth0 = useAuth0SDK();
src/providers/Auth0Provider.tsx:    // Auth0 roles can be in different places depending on configuration
src/providers/Auth0Provider.tsx:export default Auth0Provider;
src/providers/AppProviders.tsx:import { Auth0Provider } from './Auth0Provider';
src/providers/AppProviders.tsx:import { Auth0ContextProvider } from '../contexts/Auth0Context';
src/providers/AppProviders.tsx:      <Auth0Provider>
src/providers/AppProviders.tsx:        <Auth0ContextProvider>
src/providers/AppProviders.tsx:        </Auth0ContextProvider>
src/providers/AppProviders.tsx:      </Auth0Provider>
src/tests/typography.test.tsx:  useAuth: () => ({ user: null }),
src/components/routing/RouterSelector.tsx:import Auth0Login from '../../pages/Auth0Login';
src/components/routing/RouterSelector.tsx:import Auth0ProtectedRoute from './Auth0ProtectedRoute';
src/components/routing/RouterSelector.tsx:      <Route path="/login" element={<Auth0Login />} />
src/components/routing/RouterSelector.tsx:          <Auth0ProtectedRoute>
src/components/routing/RouterSelector.tsx:          </Auth0ProtectedRoute>
src/components/routing/Auth0ProtectedRoute.tsx:import { useAuth } from '../../contexts/Auth0Context';
src/components/routing/Auth0ProtectedRoute.tsx:interface Auth0ProtectedRouteProps {
src/components/routing/Auth0ProtectedRoute.tsx:const Auth0ProtectedRoute: React.FC<Auth0ProtectedRouteProps> = ({ children, requiredRole }) => {
src/components/routing/Auth0ProtectedRoute.tsx:  const { isAuthenticated, isLoading, user } = useAuth();
src/components/routing/Auth0ProtectedRoute.tsx:  // Show loading state while Auth0 is initializing
src/components/routing/Auth0ProtectedRoute.tsx:export default Auth0ProtectedRoute;
src/hooks/useAuth0ApiClient.ts:import { useAuth } from '../contexts/Auth0Context';
src/hooks/useAuth0ApiClient.ts: * Hook to initialize the Auth0 API client with access token getter
src/hooks/useAuth0ApiClient.ts:export const useAuth0ApiClient = () => {
src/hooks/useAuth0ApiClient.ts:  const { getAccessToken } = useAuth();
src/hooks/useAuth0ApiClient.ts:export default useAuth0ApiClient;
src/hooks/useAuth.ts:export function useAuth() {
src/hooks/useAuth.ts:export default useAuth; 
src/api/ShieldAuthConnector.ts: * Combines functionality similar to Auth0, Plaid, and LexisNexis
src/api/auth0ApiClient.ts:class Auth0ApiClient {
src/api/auth0ApiClient.ts:export const auth0ApiClient = new Auth0ApiClient();
src/pages/Transactions.tsx:// PQC components removed - using Auth0 for authentication
src/pages/Transactions.tsx:  // PQC verification removed - using Auth0 for authentication
src/pages/Transactions.tsx:    // Directly proceed with blockchain verification (Auth0 handles authentication)
src/pages/Transactions.tsx:      {/* PQC Verification removed - using Auth0 for authentication */}
src/pages/Auth0Login.tsx:import { useAuth } from '../contexts/Auth0Context';
src/pages/Auth0Login.tsx:const Auth0Login: React.FC = () => {
src/pages/Auth0Login.tsx:  const { login, isAuthenticated, isLoading, error } = useAuth();
src/pages/Auth0Login.tsx:  // Show loading state while Auth0 is initializing
src/pages/Auth0Login.tsx:            Secure authentication powered by Auth0
src/pages/Auth0Login.tsx:              Sign in with Auth0
src/pages/Auth0Login.tsx:              You will be redirected to Auth0 for secure authentication
src/pages/Auth0Login.tsx:                Enterprise-grade security with Auth0
src/pages/Auth0Login.tsx:export default Auth0Login;
