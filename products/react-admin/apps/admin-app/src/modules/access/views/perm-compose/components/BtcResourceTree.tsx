import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import {
  Tree,
  Input,
  Switch,
  Tag,
} from '@enterprise-workspace/frontend/shared';
import { FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import type { TreeProps, TreeNodeData } from '@enterprise-workspace/frontend/shared/data-display/Tree/types';
import styles from './BtcResourceTree.module.css';

interface ResourceTreeProps {
  resourceTree: any[];
  modelValue: {
    resourceFilterText: string;
    applyToChildren: boolean;
  };
  treeProps?: any;
  filterResourceNode: (value: string, data: any) => boolean;
  onResourceCheck?: (data: any, checked: boolean) => void;
}

export interface BtcResourceTreeRef {
  getCheckedNodes: () => any[];
  getCheckedKeys: () => number[];
  setCheckedKeys: (keys: number[]) => void;
  filter: (val: string) => void;
}

export const BtcResourceTree = forwardRef<BtcResourceTreeRef, ResourceTreeProps>(
  (
    {
      resourceTree,
      modelValue,
      treeProps = {
        children: 'children',
        label: 'resourceNameCn',
      },
      filterResourceNode,
      onResourceCheck,
    },
    ref
  ) => {
    const [filterText, setFilterText] = useState(modelValue.resourceFilterText);
    const [applyToChildren, setApplyToChildren] = useState(modelValue.applyToChildren);
    const treeComponentRef = useRef<any>(null);

    useEffect(() => {
      setFilterText(modelValue.resourceFilterText);
      setApplyToChildren(modelValue.applyToChildren);
    }, [modelValue]);

    useEffect(() => {
      if (filterText) {
        treeComponentRef.current?.filter(filterText);
      }
    }, [filterText]);

    // Expose methods through ref
    React.useImperativeHandle(
      ref,
      () => ({
        getCheckedNodes: () => treeComponentRef.current?.getCheckedNodes() || [],
        getCheckedKeys: () => treeComponentRef.current?.getCheckedKeys() || [],
        setCheckedKeys: (keys: number[]) => treeComponentRef.current?.setCheckedKeys(keys),
        filter: (val: string) => treeComponentRef.current?.filter(val),
      }),
      []
    );

    const handleCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
      onResourceCheck?.(info.node, checkedKeys.checked);
    };

    const handleFilter: TreeProps['filterTreeNode'] = (node: TreeNodeData) => {
      return filterResourceNode(filterText, node);
    };

    const renderNode: TreeProps['render'] = (node: TreeNodeData) => {
      const data = node as any;
      return (
        <div className={styles.item}>
          <FolderOpenOutlined className={styles.itemIcon} />
          <span className={styles.itemLabel}>{data[treeProps.label]}</span>
          {data.supportedActions && (
            <Tag type="info" size="small" className={styles.itemTag}>
              {data.supportedActions.length}
            </Tag>
          )}
        </div>
      );
    };

    return (
      <div className={styles.scope}>
        <div className={styles.head}>
          <span className={styles.label}>资源列表</span>
          <Switch
            checked={applyToChildren}
            onChange={setApplyToChildren}
            checkedChildren="应用到子节点"
            unCheckedChildren=""
            size="small"
          />
        </div>

        <div className={styles.search}>
          <Input
            placeholder="搜索资源"
            prefix={<SearchOutlined />}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            allowClear
            size="small"
          />
        </div>

        <div className={styles.data}>
          <Tree
            ref={treeComponentRef}
            data={resourceTree}
            treeProps={treeProps}
            checkable
            checkedKeys={modelValue.checkedKeys || []}
            onCheck={handleCheck}
            filterTreeNode={handleFilter}
            showIcon={false}
            defaultExpandAll
            checkStrictly={!applyToChildren}
            highlightCurrent
            render={renderNode}
            className={styles.tree}
          />
        </div>
      </div>
    );
  }
);

BtcResourceTree.displayName = 'BtcResourceTree';

export default BtcResourceTree;
