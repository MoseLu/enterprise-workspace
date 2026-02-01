/**
 * Skills优化系统数据库Schema定义
 */

export const SCHEMA_VERSION = 5;

/**
 * 数据库表结构定义
 */
export const TABLES = {
  executions: `
    CREATE TABLE IF NOT EXISTS executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT NOT NULL,
      execution_id TEXT NOT NULL UNIQUE,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      status TEXT NOT NULL DEFAULT 'running',
      user_feedback_raw TEXT,
      user_feedback_analyzed TEXT,
      inferred_rating REAL,
      explicit_rating REAL,
      multi_dimension_scores TEXT,
      step_scores TEXT,
      iterations INTEGER DEFAULT 0,
      metrics TEXT,
      context TEXT,
      summary TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  execution_steps: `
    CREATE TABLE IF NOT EXISTS execution_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      step_name TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      status TEXT NOT NULL DEFAULT 'running',
      step_type TEXT,
      completion_score REAL,
      error_message TEXT,
      hints_shown TEXT,
      hints_feedback TEXT,
      context_snapshot TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE
    )
  `,
  
  hint_suggestions: `
    CREATE TABLE IF NOT EXISTS hint_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT NOT NULL,
      step_pattern TEXT,
      hint_text TEXT NOT NULL,
      hint_type TEXT NOT NULL,
      trigger_conditions TEXT,
      success_count INTEGER DEFAULT 0,
      failure_count INTEGER DEFAULT 0,
      accuracy_score REAL DEFAULT 0.0,
      last_used_at INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  hint_feedback: `
    CREATE TABLE IF NOT EXISTS hint_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      step_id INTEGER,
      hint_id INTEGER NOT NULL,
      user_response TEXT,
      is_helpful INTEGER,
      feedback_type TEXT,
      feedback_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE,
      FOREIGN KEY (step_id) REFERENCES execution_steps(id) ON DELETE CASCADE,
      FOREIGN KEY (hint_id) REFERENCES hint_suggestions(id) ON DELETE CASCADE
    )
  `,
  
  optimizations: `
    CREATE TABLE IF NOT EXISTS optimizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT NOT NULL,
      optimization_id TEXT NOT NULL UNIQUE,
      trigger_reason TEXT,
      before_content TEXT,
      after_content TEXT,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      metrics_improvement TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  shared_issues: `
    CREATE TABLE IF NOT EXISTS shared_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT,
      issue_type TEXT NOT NULL,
      description TEXT NOT NULL,
      solution TEXT,
      reported_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      resolved_at INTEGER,
      reference_count INTEGER DEFAULT 0,
      tags TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  skill_metrics: `
    CREATE TABLE IF NOT EXISTS skill_metrics (
      skill_name TEXT PRIMARY KEY,
      total_executions INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 0.0,
      avg_rating REAL DEFAULT 0.0,
      avg_multi_dimension_scores TEXT,
      avg_iterations REAL DEFAULT 0.0,
      avg_duration REAL DEFAULT 0.0,
      last_optimized_at INTEGER,
      current_version TEXT,
      is_first_execution INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  skill_hierarchy: `
    CREATE TABLE IF NOT EXISTS skill_hierarchy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_skill_name TEXT NOT NULL,
      child_skill_name TEXT NOT NULL,
      split_reason TEXT,
      split_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      execution_count_before_split INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      UNIQUE(parent_skill_name, child_skill_name)
    )
  `,
  
  judgment_criteria: `
    CREATE TABLE IF NOT EXISTS judgment_criteria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dimension TEXT NOT NULL,
      criteria_text TEXT NOT NULL,
      examples TEXT,
      weight REAL NOT NULL DEFAULT 1.0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  conversation_scenarios: `
    CREATE TABLE IF NOT EXISTS conversation_scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      user_query TEXT NOT NULL,
      ai_response TEXT,
      related_skill_name TEXT,
      scenario_type TEXT,
      extracted_intent TEXT,
      extracted_keywords TEXT,
      potential_issues TEXT,
      optimization_suggestions TEXT,
      is_skill_related INTEGER DEFAULT 0,
      confidence_score REAL DEFAULT 0.0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  conversation_skill_mapping: `
    CREATE TABLE IF NOT EXISTS conversation_skill_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      relevance_score REAL DEFAULT 0.0,
      mapping_reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      UNIQUE(conversation_id, skill_name)
    )
  `,
  
  parallel_executions: `
    CREATE TABLE IF NOT EXISTS parallel_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_execution_id TEXT NOT NULL,
      child_execution_id TEXT,
      child_skill_name TEXT NOT NULL,
      chat_id TEXT,
      chat_url TEXT,
      process_info TEXT,
      task_description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'opened',
      opened_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      started_at INTEGER,
      completed_at INTEGER,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (parent_execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE
    )
  `,
  
  dev_errors: `
    CREATE TABLE IF NOT EXISTS dev_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      error_hash TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'error',
      error_type TEXT,
      workspace_name TEXT,
      package_name TEXT,
      error_message TEXT NOT NULL,
      error_stack TEXT,
      file_path TEXT,
      line_number INTEGER,
      column_number INTEGER,
      raw_output TEXT,
      occurrence_count INTEGER DEFAULT 1,
      first_seen_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      last_seen_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      reported_to_cursor INTEGER DEFAULT 0,
      reported_at INTEGER,
      resolved INTEGER DEFAULT 0,
      resolved_at INTEGER,
      solution TEXT,
      tags TEXT,
      context TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  execution_errors: `
    CREATE TABLE IF NOT EXISTS execution_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      step_id INTEGER,
      error_type TEXT NOT NULL,
      error_message TEXT NOT NULL,
      stack_trace TEXT,
      context_snapshot TEXT,
      project_state TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE,
      FOREIGN KEY (step_id) REFERENCES execution_steps(id) ON DELETE CASCADE
    )
  `,
  
  project_state_snapshots: `
    CREATE TABLE IF NOT EXISTS project_state_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      git_commit TEXT,
      git_branch TEXT,
      package_versions TEXT,
      build_config TEXT,
      env_vars TEXT,
      node_version TEXT,
      pnpm_version TEXT,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE
    )
  `,
  
  skill_versions: `
    CREATE TABLE IF NOT EXISTS skill_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_name TEXT NOT NULL,
      version TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      change_summary TEXT,
      metrics_before TEXT,
      metrics_after TEXT,
      created_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      is_active INTEGER DEFAULT 0,
      rollout_percentage INTEGER DEFAULT 100,
      UNIQUE(skill_name, version)
    )
  `,
  
  issue_patterns: `
    CREATE TABLE IF NOT EXISTS issue_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_id TEXT NOT NULL UNIQUE,
      skill_name TEXT,
      issue_type TEXT NOT NULL,
      pattern_description TEXT NOT NULL,
      root_cause TEXT,
      solution TEXT,
      scenario_tags TEXT,
      match_count INTEGER DEFAULT 0,
      confidence_score REAL DEFAULT 0.0,
      last_matched_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  optimization_validations: `
    CREATE TABLE IF NOT EXISTS optimization_validations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      optimization_id TEXT NOT NULL,
      validation_status TEXT NOT NULL DEFAULT 'pending',
      test_results TEXT,
      metrics_comparison TEXT,
      improvement_score REAL,
      validated_at INTEGER,
      validator_info TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (optimization_id) REFERENCES optimizations(optimization_id) ON DELETE CASCADE
    )
  `,
  
  implicit_feedback: `
    CREATE TABLE IF NOT EXISTS implicit_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      execution_id TEXT NOT NULL,
      feedback_type TEXT NOT NULL,
      action_taken TEXT,
      file_changes TEXT,
      adoption_rate REAL DEFAULT 0.0,
      detected_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE
    )
  `
};

/**
 * 创建索引
 */
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_executions_skill_name ON executions(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status)',
  'CREATE INDEX IF NOT EXISTS idx_execution_steps_execution_id ON execution_steps(execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_hint_suggestions_skill_name ON hint_suggestions(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_hint_suggestions_is_active ON hint_suggestions(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_hint_feedback_execution_id ON hint_feedback(execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_hint_feedback_hint_id ON hint_feedback(hint_id)',
  'CREATE INDEX IF NOT EXISTS idx_optimizations_skill_name ON optimizations(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_shared_issues_skill_name ON shared_issues(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_shared_issues_issue_type ON shared_issues(issue_type)',
  'CREATE INDEX IF NOT EXISTS idx_skill_hierarchy_parent ON skill_hierarchy(parent_skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_skill_hierarchy_child ON skill_hierarchy(child_skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_conversation_scenarios_skill_name ON conversation_scenarios(related_skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_conversation_scenarios_type ON conversation_scenarios(scenario_type)',
  'CREATE INDEX IF NOT EXISTS idx_conversation_skill_mapping_skill ON conversation_skill_mapping(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_conversation_skill_mapping_conversation ON conversation_skill_mapping(conversation_id)',
  'CREATE INDEX IF NOT EXISTS idx_parallel_executions_parent ON parallel_executions(parent_execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_parallel_executions_child_execution ON parallel_executions(child_execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_parallel_executions_chat_id ON parallel_executions(chat_id)',
  'CREATE INDEX IF NOT EXISTS idx_parallel_executions_status ON parallel_executions(status)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_hash ON dev_errors(error_hash)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_severity ON dev_errors(severity)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_workspace ON dev_errors(workspace_name)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_package ON dev_errors(package_name)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_reported ON dev_errors(reported_to_cursor)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_resolved ON dev_errors(resolved)',
  'CREATE INDEX IF NOT EXISTS idx_dev_errors_last_seen ON dev_errors(last_seen_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_execution_errors_execution_id ON execution_errors(execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_execution_errors_step_id ON execution_errors(step_id)',
  'CREATE INDEX IF NOT EXISTS idx_execution_errors_error_type ON execution_errors(error_type)',
  'CREATE INDEX IF NOT EXISTS idx_project_state_snapshots_execution_id ON project_state_snapshots(execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_project_state_snapshots_git_commit ON project_state_snapshots(git_commit)',
  'CREATE INDEX IF NOT EXISTS idx_skill_versions_skill_name ON skill_versions(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_skill_versions_version ON skill_versions(version)',
  'CREATE INDEX IF NOT EXISTS idx_skill_versions_is_active ON skill_versions(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_issue_patterns_skill_name ON issue_patterns(skill_name)',
  'CREATE INDEX IF NOT EXISTS idx_issue_patterns_issue_type ON issue_patterns(issue_type)',
  'CREATE INDEX IF NOT EXISTS idx_issue_patterns_pattern_id ON issue_patterns(pattern_id)',
  'CREATE INDEX IF NOT EXISTS idx_optimization_validations_optimization_id ON optimization_validations(optimization_id)',
  'CREATE INDEX IF NOT EXISTS idx_optimization_validations_status ON optimization_validations(validation_status)',
  'CREATE INDEX IF NOT EXISTS idx_implicit_feedback_execution_id ON implicit_feedback(execution_id)',
  'CREATE INDEX IF NOT EXISTS idx_implicit_feedback_type ON implicit_feedback(feedback_type)'
];
