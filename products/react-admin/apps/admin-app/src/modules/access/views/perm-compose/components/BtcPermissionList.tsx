import React from 'react';
import { Empty } from '@enterprise-workspace/frontend/shared';
import { FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './BtcPermissionList.module.css';

interface BtcPermissionListProps {
  composedPermissions: any[];
  onRemovePermission?: (index: number) => void;
}

export const BtcPermissionList: React.FC<BtcPermissionListProps> & {
  displayName: string;
} = ({
  composedPermissions,
  onRemovePermission,
}) => {
  return (
    <div className={styles.permissionList}>
      {composedPermissions.length > 0 ? (
        <div className={styles.listContainer}>
          {composedPermissions.map((perm, index) => (
            <div
              key={perm.key}
              className={styles.permissionItem}
              onClick={() => onRemovePermission?.(index)}
            >
              <div className={styles.permissionItemIndex}>{index + 1}</div>
              <div className={styles.permissionItemContent}>
                <div className={styles.permissionItemName}>{perm.permissionName}</div>
                <div className={styles.permissionItemCode}>{perm.permissionCode}</div>
              </div>
              <div className={styles.icon}>
                <CloseOutlined />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          description="暂无权限"
          image={FileTextOutlined}
          imageSize={60}
        />
      )}
    </div>
  );
};

BtcPermissionList.displayName = 'BtcPermissionList';

export default BtcPermissionList;
