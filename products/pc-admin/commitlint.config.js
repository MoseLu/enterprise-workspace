module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
    // 主题行最大长度
    'subject-max-length': [2, 'always', 50],
    // 正文每行最大长度
    'body-max-line-length': [2, 'always', 72],
    // 主题行不能为空
    'subject-empty': [2, 'never'],
    // 主题行必须以小写字母开头
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
  },
};

