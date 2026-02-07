import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@enterprise-workspace/frontend/shared';
import {
  FileExcelOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';
import styles from './BtcFileThumbnailCell.module.scss';

const Z_INDEX = 4000;

interface BtcFileThumbnailCellProps {
  src?: string;
  mime?: string;
  originalName?: string;
}

interface ImagePreviewProps {
  visible: boolean;
  src: string;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ visible, src, onClose }) => {
  if (!visible) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible]);

  return ReactDOM.createPortal(
    <div className={styles.imagePreview} onClick={handleBackdropClick} style={{ zIndex: Z_INDEX }}>
      <div className={styles.imagePreviewContent}>
        <img src={src} alt="" className={styles.previewImage} />
        <Button
          type="text"
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </Button>
      </div>
    </div>,
    document.body
  );
};

export const BtcFileThumbnailCell: React.FC<BtcFileThumbnailCellProps> = ({
  src = '',
  mime = '',
  originalName = '',
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const extension = useMemo(() => {
    const nameSource = originalName || src || '';
    const matched = nameSource.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
    return matched ? matched[1].toLowerCase() : '';
  }, [originalName, src]);

  const isImage = useMemo(() => {
    if (mime) {
      return mime.startsWith('image/');
    }
    const ext = extension;
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
  }, [mime, extension]);

  const extensionLabel = useMemo(() => {
    if (!extension) {
      return 'FILE';
    }
    return extension.length > 4
      ? extension.slice(0, 4).toUpperCase()
      : extension.toUpperCase();
  }, [extension]);

  const typeClass = useMemo(() => {
    const ext = extension;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return styles.iconExcel;
    if (['ppt', 'pptx'].includes(ext)) return styles.iconPpt;
    if (['doc', 'docx'].includes(ext)) return styles.iconWord;
    if (['pdf'].includes(ext)) return styles.iconPdf;
    if (['txt', 'md'].includes(ext)) return styles.iconText;
    return styles.iconDefault;
  }, [extension]);

  const getFileIcon = () => {
    const ext = extension;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileExcelOutlined />;
    if (['ppt', 'pptx'].includes(ext)) return <FilePptOutlined />;
    if (['doc', 'docx'].includes(ext)) return <FileWordOutlined />;
    if (['pdf'].includes(ext)) return <FilePdfOutlined />;
    if (['txt', 'md'].includes(ext)) return <FileTextOutlined />;
    return <FileOutlined />;
  };

  const openPreview = () => {
    if (!isImage || !src) return;
    setPreviewVisible(true);
  };

  return (
    <>
      <div className={styles.thumbnail}>
        {isImage ? (
          <div
            className={styles.image}
            role="button"
            tabIndex={0}
            onClick={openPreview}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPreview();
              }
            }}
          >
            <img src={src} alt="" />
          </div>
        ) : (
          <div className={`${styles.icon} ${typeClass}`}>
            <span className={styles.iconText}>{extensionLabel}</span>
          </div>
        )}
      </div>
      <ImagePreview
        visible={previewVisible}
        src={src}
        onClose={() => setPreviewVisible(false)}
      />
    </>
  );
};
