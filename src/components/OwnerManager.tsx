import React, { useCallback, useEffect, useState } from 'react';
import { UserRoleTypeString } from '../types/user';
import OwnerComponent, { Owner } from './OwnerComponent';

import { debugLog } from '../utils/auditLogger';

interface OwnerManagerProps {
  initialOwners: Owner[];
  onChange: (owners: Owner[]) => void;
  includeCredit?: boolean;
  requireMobile?: boolean;
  userRoleContext?: UserRoleTypeString;
  onSendSignatureRequest?: (ownerId: string) => void;
}

const OwnerManager: React.FC<OwnerManagerProps> = ({
  initialOwners,
  onChange,
  includeCredit = false,
  requireMobile = false,
  userRoleContext,
  onSendSignatureRequest,
}) => {
  // Initialize with at least one owner if none provided
  const [owners, setOwners] = useState<Owner[]>(() => {
    if (initialOwners && initialOwners.length > 0) {
      return initialOwners;
    } else {
      // Create a default primary owner
      return [
        {
          id: `owner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'individual',
          name: '',
          ownershipPercentage: '100',
          files: [],
          shares: '0',
          totalShares: '0',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          mobile: '',
          businessPhone: '',
          email: '',
          isComplete: false,
          notificationSent: false,
          ssn: '',
          dateOfBirth: '',
          title: '',
        },
      ];
    }
  });

  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [totalOwnership, setTotalOwnership] = useState(0);
  const [newOwnerType, setNewOwnerType] = useState<'individual' | 'business' | 'trust'>(
    'individual',
  );
  const [activeOwnerIndex, setActiveOwnerIndex] = useState(0);
  const [modalErrors, setModalErrors] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isBrokerOrLenderOrVendor =
    userRoleContext === 'broker' || userRoleContext === 'lender' || userRoleContext === 'vendor';

  // Calculate total ownership percentage whenever owners change
  useEffect(() => {
    const total = owners.reduce((sum, owner) => {
      return sum + (parseFloat(owner.ownershipPercentage) || 0);
    }, 0);
    setTotalOwnership(total);
  }, [owners]);

  // Update parent component when owners change
  useEffect(() => {
    onChange(owners);
  }, [owners, onChange]);

  // Handle owner update
  const handleOwnerChange = useCallback((updatedOwner: Owner) => {
    setOwners(prevOwners =>
      prevOwners.map(owner => (owner.id === updatedOwner.id ? updatedOwner : owner)),
    );
  }, []);

  // Handle owner deletion
  const handleOwnerDelete = (ownerId: string) => {
    setOwners(prevOwners => {
      const newOwners = prevOwners.filter(owner => owner.id !== ownerId);

      // Redistribute the ownership percentage if needed
      if (newOwners.length > 0) {
        const deletedOwner = prevOwners.find(owner => owner.id === ownerId);
        const deletedPercentage = deletedOwner
          ? parseFloat(deletedOwner.ownershipPercentage) || 0
          : 0;

        if (deletedPercentage > 0) {
          // Calculate remaining total percentage *before* distribution
          const remainingTotal = newOwners.reduce(
            (sum, owner) => sum + (parseFloat(owner.ownershipPercentage) || 0),
            0,
          );

          // Distribute it proportionally among remaining owners
          if (remainingTotal > 0) {
            // Avoid division by zero
            const distributedOwners = newOwners.map(owner => {
              const currentPercentage = parseFloat(owner.ownershipPercentage) || 0;
              const newPercentage = Math.min(
                100,
                currentPercentage + deletedPercentage * (currentPercentage / remainingTotal),
              );
              return {
                ...owner,
                ownershipPercentage: newPercentage.toFixed(2), // Maintain precision
              };
            });
            return distributedOwners;
          } else {
            // If remaining total is 0, distribute equally (or handle as needed)
            const equalShare = deletedPercentage / newOwners.length;
            return newOwners.map(owner => ({
              ...owner,
              ownershipPercentage: Math.min(100, equalShare).toFixed(2),
            }));
          }
        }
      }

      return newOwners;
    });

    // Adjust the active owner index if needed
    if (activeOwnerIndex >= owners.length - 1 && owners.length > 1) {
      setActiveOwnerIndex(owners.length - 2);
    } else if (owners.length <= 1) {
      setActiveOwnerIndex(0); // Reset to 0 if only one or zero owners left
    }
  };

  // Create a new owner
  const createNewOwner = (
    type: 'individual' | 'business' | 'trust',
    suggestedOwnership: number,
  ): Owner => {
    debugLog('general', 'log_statement', `Creating new ${type} owner with ${suggestedOwnership}% ownership`)

    const baseOwner: Owner = {
      id: `owner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      name: '',
      ownershipPercentage: suggestedOwnership.toFixed(2), // Ensure string with precision
      files: [],
      shares: '0',
      totalShares: '0',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      mobile: '',
      businessPhone: '',
      email: '',
      isComplete: false,
      notificationSent: false, // Initialize notificationSent
    };

    // Add type-specific fields
    if (type === 'individual') {
      return {
        ...baseOwner,
        ssn: '',
        dateOfBirth: '',
        title: '',
      };
    } else if (type === 'business') {
      return {
        ...baseOwner,
        businessEin: '',
        businessFormationDate: '',
        businessFormationState: '',
        primaryContactName: '',
        primaryContactTitle: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
      };
    } else {
      // trust
      return {
        ...baseOwner,
        trustEin: '',
        trustFormationDate: '',
        trustState: '',
        trusteeNames: [],
      };
    }
  };

  // Add a new owner
  const addOwner = () => {
    try {
      // Calculate suggested ownership percentage
      const suggestedOwnership = totalOwnership < 100 ? Math.min(20, 100 - totalOwnership) : 0;

      const newOwner = createNewOwner(newOwnerType, suggestedOwnership);
      debugLog('general', 'log_statement', 'Created new owner object:', newOwner)

      // Add the new owner to the list
      const newOwners = [...owners, newOwner];
      setOwners(newOwners);

      // Set the active index to the new owner
      setActiveOwnerIndex(newOwners.length - 1);

      // Close the modal and reset its state
      setShowAddOwnerModal(false);
      setHasAttemptedSubmit(false);
      setModalErrors([]);

      debugLog('general', 'log_statement', 'Owner added successfully, new owner count:', newOwners.length)
    } catch (error) {
      console.error('Error adding owner:', error);
      setModalErrors(['An unexpected error occurred. Please try again.']);
    }
  };

  // Get type label for owner type
  const getOwnerTypeLabel = (type: 'individual' | 'business' | 'trust'): string => {
    switch (type) {
      case 'individual':
        return 'Person';
      case 'business':
        return 'Business';
      case 'trust':
        return 'Trust';
      default:
        return type;
    }
  };

  // Get color classes for owner type
  const getOwnerTypeClasses = (type: 'individual' | 'business' | 'trust'): string => {
    switch (type) {
      case 'individual':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trust':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if owner has required fields filled out
  const isOwnerComplete = useCallback((owner: Owner): boolean => {
    // Common required fields for all owner types
    const hasCommonFields =
      owner.name.trim() !== '' &&
      owner.ownershipPercentage.trim() !== '' &&
      owner.address.trim() !== '' &&
      owner.city.trim() !== '' &&
      owner.state.trim() !== '' &&
      owner.zip.trim() !== '' &&
      owner.phone.trim() !== '' &&
      owner.email.trim() !== '';

    // Check type-specific required fields
    if (owner.type === 'individual') {
      return hasCommonFields && !!owner.ssn && owner.ssn.trim().length >= 9 && !!owner.dateOfBirth;
    } else if (owner.type === 'business') {
      return (
        hasCommonFields &&
        !!owner.businessEin &&
        owner.businessEin.trim().length >= 9 &&
        !!owner.primaryContactName &&
        !!owner.primaryContactEmail
      );
    } else if (owner.type === 'trust') {
      return (
        hasCommonFields &&
        !!owner.trustEin &&
        owner.trustEin.trim().length >= 9 &&
        !!owner.trustFormationDate &&
        !!owner.trustState
      );
    }

    return false;
  }, []);

  // Update owner complete status
  const updateOwnerCompleteStatus = useCallback(
    (ownerId: string) => {
      const owner = owners.find(o => o.id === ownerId);
      if (!owner) return;

      const isComplete = isOwnerComplete(owner);
      if (owner.isComplete !== isComplete) {
        handleOwnerChange({
          ...owner,
          isComplete,
        });
      }
    },
    [owners, isOwnerComplete, handleOwnerChange],
  );

  // Run completeness check on active owner
  useEffect(() => {
    if (owners.length > 0 && activeOwnerIndex >= 0 && activeOwnerIndex < owners.length) {
      updateOwnerCompleteStatus(owners[activeOwnerIndex].id);
    }
  }, [owners, activeOwnerIndex, updateOwnerCompleteStatus]);

  // Handle opening the modal
  const openAddOwnerModal = () => {
    setShowAddOwnerModal(true);
    setNewOwnerType('individual');
    setModalErrors([]);
    setHasAttemptedSubmit(false);
  };

  // Handle closing the modal
  const closeAddOwnerModal = () => {
    setShowAddOwnerModal(false);
    setModalErrors([]);
    setHasAttemptedSubmit(false);
  };

  // Handle owner type change in modal
  const handleOwnerTypeChange = (type: 'individual' | 'business' | 'trust') => {
    setNewOwnerType(type);
  };

  // Validate and submit from modal
  const validateAndSubmit = () => {
    setHasAttemptedSubmit(true);
    const errors: string[] = [];

    // Validate based on current total ownership
    if (totalOwnership >= 100) {
      errors.push(
        'Total ownership already at 100%. Please adjust existing owner percentages first.',
      );
    }

    if (errors.length === 0) {
      debugLog('general', 'log_statement', 'Adding owner with type:', newOwnerType)
      addOwner();
    } else {
      setModalErrors(errors);
    }
  };

  // Add the handler for the Send Signature Request button
  const handleSendRequestClick = (ownerId: string) => {
    if (onSendSignatureRequest) {
      onSendSignatureRequest(ownerId);
      // Optionally update local state immediately for visual feedback,
      // although the parent's update via onChange should handle it.
      setOwners(prev => prev.map(o => (o.id === ownerId ? { ...o, notificationSent: true } : o)));
    } else {
      console.warn('onSendSignatureRequest handler not provided to OwnerManager');
    }
  };

  return (
    <div>
      {/* Owner navigation tabs */}
      {owners.length > 0 && (
        <div className="mb-4 border-b border-light-border">
          <nav className="-mb-px flex flex-wrap" aria-label="Owner navigation">
            {owners.map((owner, index) => (
              <button
                key={owner.id}
                onClick={() => setActiveOwnerIndex(index)}
                className={`mr-2 flex items-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium focus:outline-none ${
                  activeOwnerIndex === index
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-light-text-secondary hover:border-light-border hover:text-light-text'
                }`}
                aria-current={activeOwnerIndex === index ? 'page' : undefined}
                title={`${owner.type === 'individual' ? 'Individual' : owner.type === 'business' ? 'Business Entity' : 'Trust'} Owner${index === 0 ? ' (Primary)' : ''}`}
              >
                <span
                  className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${getOwnerTypeClasses(owner.type)}`}
                >
                  {owner.type.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate md:max-w-xs">
                  {owner.name || (index === 0 ? 'Primary Owner' : `Owner ${index + 1}`)}
                </span>
                <span className="ml-1.5 text-xs text-light-text-secondary">
                  {owner.ownershipPercentage}%
                </span>
                {/* Completion status indicator */}
                {owner.isComplete ? (
                  <span className="ml-2 text-green-500" title="Complete">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="ml-2 text-yellow-500" title="Incomplete">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Active owner component */}
      {owners.length > 0 && (
        <OwnerComponent
          owner={owners[activeOwnerIndex]}
          onChange={handleOwnerChange}
          onDelete={owners.length > 1 && activeOwnerIndex > 0 ? handleOwnerDelete : () => {}}
          isMainOwner={activeOwnerIndex === 0}
          isBrokerView={isBrokerOrLenderOrVendor}
          includeCredit={includeCredit}
          requireMobile={requireMobile}
        />
      )}

      {/* Conditional "Send for Signature" Button */}
      {isBrokerOrLenderOrVendor && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleSendRequestClick(owners[activeOwnerIndex].id)}
            disabled={owners[activeOwnerIndex].notificationSent} // Disable if already sent
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
              owners[activeOwnerIndex].notificationSent
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            }`}
          >
            {owners[activeOwnerIndex].notificationSent ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sent
              </>
            ) : (
              'Send for Signature (Credit Consent)'
            )}
          </button>
        </div>
      )}

      {/* Add Owner button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={openAddOwnerModal}
          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Additional Owner
        </button>
      </div>

      {/* Add Owner Modal */}
      {showAddOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-75">
          <div className="relative mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl md:mx-auto">
            {/* Modal header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Add Additional Owner</h3>
                <button
                  onClick={closeAddOwnerModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4">
              {/* Validation errors */}
              {hasAttemptedSubmit && modalErrors.length > 0 && (
                <div className="bg-red-50 mb-4 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please correct the following:
                      </h3>
                      <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                        {modalErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <p className="mb-4 text-sm text-gray-600">
                Adding an additional owner is necessary for businesses with multiple owners. Each
                owner with 20% or more ownership must be included in the application.
              </p>

              <div className="mb-6 flex rounded-md bg-blue-50 p-4">
                <div className="flex-shrink-0 text-blue-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Each additional owner will need to provide their personal information for the
                    application.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Owner Type</label>

                <div className="space-y-3">
                  {/* Individual option */}
                  <label
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition-all ${
                      newOwnerType === 'individual'
                        ? 'bg-red-50 border-red-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      value="individual"
                      checked={newOwnerType === 'individual'}
                      onChange={() => handleOwnerTypeChange('individual')}
                      className="h-5 w-5 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Individual (Person)</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Natural person who owns part of the business. Requires personal
                        identification and contact information.
                      </p>
                    </div>
                  </label>

                  {/* Business option */}
                  <label
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition-all ${
                      newOwnerType === 'business'
                        ? 'bg-red-50 border-red-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      value="business"
                      checked={newOwnerType === 'business'}
                      onChange={() => handleOwnerTypeChange('business')}
                      className="h-5 w-5 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Business Entity</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Company, LLC, or corporation that owns part of the business. Requires EIN
                        and primary contact.
                      </p>
                    </div>
                  </label>

                  {/* Trust option */}
                  <label
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition-all ${
                      newOwnerType === 'trust'
                        ? 'bg-red-50 border-red-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      value="trust"
                      checked={newOwnerType === 'trust'}
                      onChange={() => handleOwnerTypeChange('trust')}
                      className="h-5 w-5 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Trust</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Legal entity that holds assets for beneficiaries. Will require personal
                        guarantor information from trustees for credit approval.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {totalOwnership >= 100 && (
                <div className="mb-4 flex bg-yellow-50 p-4">
                  <div className="flex-shrink-0 text-yellow-400">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      <p>
                        Total ownership already at {totalOwnership}%. You may need to redistribute
                        ownership percentages to add another owner.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-gray-200 p-4">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={closeAddOwnerModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white hover:bg-primary-700"
                onClick={validateAndSubmit}
              >
                Add Owner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerManager;
