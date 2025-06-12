// Test script to verify that the Credit Consent Disclaimer is rendered on the page
function checkForCreditConsentDisclaimer() {
  console.log('Checking for Credit Consent Disclaimer...');

  // The specific text to look for
  const disclaimerText =
    'During your loan, lease, or credit application process, Unisyn Technologies, LLC, and its subsidiaries verifies your information and creditworthiness, and shares such information with potential lenders and third parties to further your loan application process.';

  // Check if the text is present in the document
  const pageContent = document.body.innerText;
  const isPresent = pageContent.includes(disclaimerText);

  console.log('Disclaimer present:', isPresent);

  // Find all elements that might contain the disclaimer
  const elements = Array.from(document.querySelectorAll('*')).filter(
    el => el.innerText && el.innerText.includes('Credit Consent Disclaimer')
  );

  console.log('Elements with "Credit Consent Disclaimer" title:', elements);

  // Get the specific disclaimer component if it exists
  const disclaimerComponent = elements.find(el => el.innerText.includes(disclaimerText));

  if (disclaimerComponent) {
    console.log('Disclaimer component found:', disclaimerComponent);
    console.log('Full disclaimer text:');
    console.log('--------------------');
    console.log(disclaimerComponent.innerText);
    console.log('--------------------');
    return true;
  } else {
    console.log('Disclaimer component not found or not fully rendered');
    return false;
  }
}

// Run the check
checkForCreditConsentDisclaimer();
