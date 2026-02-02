/**
 * Test Fixtures
 * 
 * Reusable test data for API tests
 */

export const fixtures = {
  users: {
    owner: {
      email: 'owner@testcompany.com',
      password: 'SecureOwner123!',
      firstName: 'Company',
      lastName: 'Owner',
    },
    admin: {
      email: 'admin@testcompany.com',
      password: 'SecureAdmin123!',
      firstName: 'Admin',
      lastName: 'User',
    },
    operator: {
      email: 'operator@testcompany.com',
      password: 'SecureOp123!',
      firstName: 'Operator',
      lastName: 'User',
    },
  },

  automationConfigs: {
    emailTriage: {
      templateId: 1,
      name: 'Email Task Triage',
      configJson: {
        source: 'Gmail',
        labelFilter: 'INBOX',
        categories: ['task', 'question', 'complaint', 'feedback'],
      },
    },
    leadFollowup: {
      templateId: 2,
      name: 'Lead Follow-up',
      configJson: {
        crm: 'Pipedrive',
        followUpDelay: 7,
        autoSend: false,
        templateName: 'Follow-up Email',
      },
    },
    formCrmSync: {
      templateId: 3,
      name: 'Form to CRM Sync',
      configJson: {
        formSource: 'Typeform',
        crmDestination: 'HubSpot',
        fieldMapping: {
          email: 'email',
          name: 'full_name',
          company: 'company_name',
        },
      },
    },
    leadSlackNotify: {
      templateId: 4,
      name: 'Lead Slack Notification',
      configJson: {
        channel: '#sales',
        qualificationCriteria: {
          minScore: 80,
          mustHaveCompany: true,
        },
      },
    },
  },

  intakes: {
    emailOverload: {
      name: 'Email Overload',
      department: 'Customer Support',
      description: 'Our support team spends 3-4 hours daily triaging customer emails manually',
      currentVolume: 150,
      timeSpent: 240,
    },
    leadLag: {
      name: 'Lead Response Lag',
      department: 'Sales',
      description: 'New leads wait 2-3 days for first contact, losing warm opportunities',
      currentVolume: 30,
      timeSpent: 60,
    },
  },

  connections: {
    gmail: {
      provider: 'gmail',
      credentials: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        scope: 'https://www.googleapis.com/auth/gmail.modify',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600000, // 1 hour from now
      },
    },
    hubspot: {
      provider: 'hubspot',
      credentials: {
        access_token: 'mock-hubspot-token',
        refresh_token: 'mock-hubspot-refresh',
      },
    },
  },
};

/**
 * Deep clone fixture data to avoid mutations
 */
export function getFixture<T>(path: string): T {
  const keys = path.split('.');
  let value: any = fixtures;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Fixture not found: ${path}`);
    }
  }
  
  return JSON.parse(JSON.stringify(value));
}
