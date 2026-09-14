export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'revert', 'docs', 'style', 'chore', 'refactor', 'test', 'build', 'ci', 'wip'],
    ],
  },
};
