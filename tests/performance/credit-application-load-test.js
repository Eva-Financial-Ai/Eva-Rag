import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const submissionSuccess = new Rate('submission_success');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Ramp up to 50 users
    { duration: '10m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 200 },  // Spike to 200 users
    { duration: '10m', target: 100 }, // Back to 100 users
    { duration: '3m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% error rate
    errors: ['rate<0.1'],              // Custom error rate
    submission_success: ['rate>0.9'],  // 90% submission success rate
  },
};

// Test data generator
function generateCreditApplication() {
  const businessNames = ['Tech Corp', 'Innovation LLC', 'Growth Inc', 'Future Systems', 'Digital Solutions'];
  const states = ['CA', 'NY', 'TX', 'FL', 'WA'];
  
  return {
    legalBusinessName: `${businessNames[Math.floor(Math.random() * businessNames.length)]} ${Date.now()}`,
    taxId: `${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000000 + 1000000)}`,
    businessAddressStreet: `${Math.floor(Math.random() * 9999)} Main St`,
    businessAddressCity: 'San Francisco',
    businessAddressState: states[Math.floor(Math.random() * states.length)],
    businessAddressZip: `${Math.floor(Math.random() * 90000 + 10000)}`,
    businessPhone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    businessEmail: `contact@business${Date.now()}.com`,
    businessEntityType: 'LLC',
    dateEstablished: '2020-01-01',
    numberOfEmployees: Math.floor(Math.random() * 100 + 1).toString(),
    requestedAmount: (Math.floor(Math.random() * 9 + 1) * 50000).toString(),
    termRequested: '24',
    useOfFunds: 'Working capital and equipment purchase',
    annualBusinessRevenue: (Math.floor(Math.random() * 5000000 + 500000)).toString(),
    monthlyGrossRevenue: (Math.floor(Math.random() * 500000 + 50000)).toString(),
    currentOutstandingBusinessDebt: (Math.floor(Math.random() * 200000)).toString(),
    monthlyRentMortgage: (Math.floor(Math.random() * 10000 + 2000)).toString(),
    bankName: 'Test Bank',
    owners: [{
      ownerType: 'individual',
      individualDetails: {
        firstName: 'John',
        lastName: `Doe${Date.now()}`,
        ssn: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        dob: '1980-01-01',
        ownershipPercentage: '100',
        title: 'CEO',
        homeAddressStreet: '123 Home St',
        homeAddressCity: 'San Francisco',
        homeAddressState: 'CA',
        homeAddressZip: '94105',
        contactPhone: '555-123-4567',
        email: `owner${Date.now()}@email.com`,
      },
    }],
    mainAuthorization: true,
    mainCertification: true,
  };
}

// Authentication token (should be set via environment variable)
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';
const BASE_URL = __ENV.BASE_URL || 'https://eva-credit-api.workers.dev';

export function setup() {
  // Setup code - could create test data, authenticate, etc.
  console.log('Starting credit application load test...');
}

export default function () {
  // Generate unique application data
  const applicationData = generateCreditApplication();
  
  // Submit credit application
  const submitResponse = http.post(
    `${BASE_URL}/api/credit-applications`,
    JSON.stringify(applicationData),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      timeout: '30s',
    }
  );

  // Check submission response
  const submitSuccess = check(submitResponse, {
    'submission status is 201': (r) => r.status === 201,
    'submission has application ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.applicationId !== undefined;
      } catch {
        return false;
      }
    },
    'submission response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!submitSuccess);
  submissionSuccess.add(submitSuccess);

  if (submitSuccess && submitResponse.status === 201) {
    const { applicationId } = JSON.parse(submitResponse.body);
    
    // Retrieve application
    sleep(1); // Wait 1 second before retrieval
    
    const getResponse = http.get(
      `${BASE_URL}/api/credit-applications/${applicationId}`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    check(getResponse, {
      'retrieval status is 200': (r) => r.status === 200,
      'retrieval response time < 200ms': (r) => r.timings.duration < 200,
      'cache hit on second request': (r) => r.headers['X-Cache-Status'] === 'HIT',
    });

    // Upload document
    const documentData = new FormData();
    documentData.append('document', http.file('test.pdf', 'test content', 'test.pdf'));
    documentData.append('documentType', 'articles_of_organization');

    const uploadResponse = http.post(
      `${BASE_URL}/api/credit-applications/${applicationId}/documents`,
      documentData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        timeout: '60s',
      }
    );

    check(uploadResponse, {
      'document upload status is 201': (r) => r.status === 201,
      'document upload has URL': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.url !== undefined;
        } catch {
          return false;
        }
      },
    });

    // Update application status
    const updateResponse = http.put(
      `${BASE_URL}/api/credit-applications/${applicationId}`,
      JSON.stringify({ status: 'in_review' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    check(updateResponse, {
      'update status is 200': (r) => r.status === 200,
      'update reflects new status': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'in_review';
        } catch {
          return false;
        }
      },
    });
  }

  // Random sleep between 1-5 seconds to simulate real user behavior
  sleep(Math.random() * 4 + 1);
}

export function teardown(data) {
  // Cleanup code
  console.log('Credit application load test completed');
}