import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      auth0_domain: process.env.REACT_APP_AUTH0_DOMAIN,
      auth0_client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
      auth0_audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
