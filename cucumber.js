const common = {
  requireModule: ['ts-node/register'],
  require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
  paths: ['features/**/*.feature'],
  format: [
    'summary',
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  // Undefined or pending steps fail the run. Keeps the step vocabulary honest.
  strict: true,
};

module.exports = { default: common };
