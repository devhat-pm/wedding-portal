import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Tabs,
  Badge,
  Spin,
  message,
  Checkbox,
  Image,
  Modal,
  Row,
  Col,
  Tooltip,
  Empty,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { GoldDivider } from '../../../components';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import type { GuestMedia } from '../../../types';
import * as mediaApi from '../../../services/media.api';

const { Title, Text, Paragraph } = Typography;

const PageWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterTabs = styled(Tabs)`
  && {
    .ant-tabs-nav {
      margin-bottom: 0;
    }

    .ant-tabs-tab {
      padding: 12px 20px;
      font-weight: 500;
    }

    .ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: ${colors.primary};
      }
    }

    .ant-tabs-ink-bar {
      background: ${colors.primary};
    }
  }
`;

const BulkActionsBar = styled(motion.div)`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${colors.secondary};
  color: white;
  padding: 12px 20px;
  border-radius: ${borderRadius.lg}px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${shadows.lg};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const MediaCard = styled(motion.div)<{ $selected?: boolean; $status?: string }>`
  position: relative;
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  background: ${colors.cardBg};
  border: 2px solid ${(props) => {
    if (props.$selected) return colors.primary;
    if (props.$status === 'pending') return colors.warning;
    if (props.$status === 'rejected') return colors.error;
    return colors.borderGold;
  }};
  box-shadow: ${shadows.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);

    .media-overlay {
      opacity: 1;
    }
  }
`;

const MediaThumbnail = styled.div<{ $imageUrl: string }>`
  width: 100%;
  padding-top: 100%;
  background: url(${(props) => props.$imageUrl}) center/cover no-repeat;
  position: relative;
`;

const MediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
`;

const MediaTypeIcon = styled.div<{ $type: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => (props.$selected ? colors.primary : 'rgba(255, 255, 255, 0.9)')};
  border: 2px solid ${(props) => (props.$selected ? colors.primary : colors.borderGold)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  z-index: 2;
  transition: all 0.2s ease;
`;

const StatusBadge = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 2;

  ${(props) => {
    switch (props.$status) {
      case 'pending':
        return `background: ${colors.warning}; color: #fff;`;
      case 'approved':
        return `background: ${colors.success}; color: #fff;`;
      case 'rejected':
        return `background: ${colors.error}; color: #fff;`;
      default:
        return '';
    }
  }}
`;

const MediaInfo = styled.div`
  padding: 12px;
  border-top: 1px solid ${colors.creamDark};
`;

const GuestName = styled.div`
  font-weight: 500;
  color: ${colors.textPrimary};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const UploadDate = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const QuickActionButton = styled(Button)<{ $variant?: 'approve' | 'reject' }>`
  && {
    flex: 1;
    height: 28px;
    font-size: 12px;

    ${(props) => {
      if (props.$variant === 'approve') {
        return `
          background: ${colors.success};
          border-color: ${colors.success};
          color: white;
          &:hover {
            background: #9A9187 !important;
            border-color: #9A9187 !important;
          }
        `;
      }
      if (props.$variant === 'reject') {
        return `
          background: ${colors.error};
          border-color: ${colors.error};
          color: white;
          &:hover {
            background: #7B756D !important;
            border-color: #7B756D !important;
          }
        `;
      }
      return '';
    }}
  }
`;

const EmptyStateWrapper = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.creamLight} 0%, ${colors.creamMedium} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 48px;
  color: ${colors.primary};
`;

const PreviewModal = styled(Modal)`
  .ant-modal-content {
    border-radius: ${borderRadius.xl}px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
`;

const PreviewInfo = styled.div`
  padding: 20px;
  background: ${colors.creamLight};
`;

type MediaStatus = 'all' | 'pending' | 'approved' | 'rejected';

const MediaGallery: React.FC = () => {
  const [media, setMedia] = useState<GuestMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MediaStatus>('all');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [previewItem, setPreviewItem] = useState<GuestMedia | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaApi.getMedia({});
      // Map API response to GuestMedia format
      const items = (response.items || []).map((item: any) => ({
        id: item.id,
        guest_id: item.guest_id,
        media_type: item.file_type === 'video' ? 'video' : 'photo',
        file_url: item.file_url,
        thumbnail_url: item.thumbnail_url || item.file_url,
        caption: item.caption,
        status: item.is_approved ? 'approved' : (item.is_rejected ? 'rejected' : 'pending'),
        uploaded_at: item.uploaded_at,
        guest_name: item.guest_name || 'Unknown Guest',
      })) as GuestMedia[];
      setMedia(items);
    } catch (error) {
      message.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const counts = {
    all: media.length,
    pending: media.filter((m) => m.status === 'pending').length,
    approved: media.filter((m) => m.status === 'approved').length,
    rejected: media.filter((m) => m.status === 'rejected').length,
  };

  const handleSelect = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredMedia.map((m) => m.id)));
    }
  };

  const handleApprove = async (ids: number[]) => {
    try {
      await Promise.all(ids.map((id) => mediaApi.approveMedia(String(id))));
      setMedia((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, status: 'approved' as const } : m))
      );
      setSelectedItems(new Set());
      message.success(`${ids.length} item(s) approved`);
    } catch (error) {
      message.error('Failed to approve media');
    }
  };

  const handleReject = async (ids: number[]) => {
    try {
      await Promise.all(ids.map((id) => mediaApi.rejectMedia(String(id))));
      setMedia((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, status: 'rejected' as const } : m))
      );
      setSelectedItems(new Set());
      message.success(`${ids.length} item(s) rejected`);
    } catch (error) {
      message.error('Failed to reject media');
    }
  };

  const handleDelete = async (ids: number[]) => {
    Modal.confirm({
      title: `Delete ${ids.length} item(s)?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await Promise.all(ids.map((id) => mediaApi.rejectMedia(String(id))));
          setMedia((prev) => prev.filter((m) => !ids.includes(m.id)));
          setSelectedItems(new Set());
          message.success(`${ids.length} item(s) deleted`);
        } catch (error) {
          message.error('Failed to delete media');
        }
      },
    });
  };

  const handleDownload = async (ids: number[]) => {
    try {
      message.info(`Downloading media...`);
      const blob = await mediaApi.downloadAllMedia();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'media-download.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download media');
    }
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          All <Badge count={counts.all} style={{ backgroundColor: colors.textSecondary, marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          Pending <Badge count={counts.pending} style={{ backgroundColor: colors.warning, marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: 'approved',
      label: (
        <span>
          Approved <Badge count={counts.approved} style={{ backgroundColor: colors.success, marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span>
          Rejected <Badge count={counts.rejected} style={{ backgroundColor: colors.error, marginLeft: 8 }} />
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
            <PictureOutlined style={{ marginRight: 12, color: colors.primary }} />
            Guest Media
          </Title>
          <Text type="secondary">
            Review and manage photos and videos uploaded by guests
          </Text>
        </div>

        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => handleDownload(Array.from(selectedItems))}>
            Download Selected
          </Button>
        </Space>
      </PageHeader>

      <Card style={{ marginBottom: 24 }}>
        <FilterTabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as MediaStatus);
            setSelectedItems(new Set());
          }}
          items={tabItems}
        />
      </Card>

      <AnimatePresence>
        {selectedItems.size > 0 && (
          <BulkActionsBar
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Space>
              <Checkbox
                checked={selectedItems.size === filteredMedia.length}
                indeterminate={selectedItems.size > 0 && selectedItems.size < filteredMedia.length}
                onChange={handleSelectAll}
              />
              <Text style={{ color: 'white' }}>
                {selectedItems.size} of {filteredMedia.length} selected
              </Text>
            </Space>

            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(Array.from(selectedItems))}
                style={{ background: colors.success, borderColor: colors.success }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(Array.from(selectedItems))}
              >
                Reject
              </Button>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(Array.from(selectedItems))}
                style={{ color: 'white' }}
              >
                Delete
              </Button>
            </Space>
          </BulkActionsBar>
        )}
      </AnimatePresence>

      <GoldDivider
        text={`${filteredMedia.length} ${activeTab === 'all' ? 'Items' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        variant="simple"
        margin="0 0 24px 0"
      />

      {filteredMedia.length > 0 ? (
        <MediaGrid>
          {filteredMedia.map((item, index) => (
            <MediaCard
              key={item.id}
              $selected={selectedItems.has(item.id)}
              $status={item.status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setPreviewItem(item)}
            >
              <MediaThumbnail $imageUrl={item.thumbnail_url || item.file_url}>
                <SelectionCheckbox
                  $selected={selectedItems.has(item.id)}
                  onClick={(e) => handleSelect(item.id, e)}
                >
                  {selectedItems.has(item.id) && <CheckOutlined />}
                </SelectionCheckbox>

                <MediaTypeIcon $type={item.media_type}>
                  {item.media_type === 'video' ? <VideoCameraOutlined /> : <PictureOutlined />}
                </MediaTypeIcon>

                <StatusBadge $status={item.status}>{item.status}</StatusBadge>

                <MediaOverlay className="media-overlay">
                  <Tooltip title="View full size">
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      ghost
                      style={{ alignSelf: 'center' }}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                </MediaOverlay>
              </MediaThumbnail>

              <MediaInfo>
                <GuestName>
                  <UserOutlined />
                  {item.guest_name || 'Unknown Guest'}
                </GuestName>
                <UploadDate>
                  <CalendarOutlined />
                  {dayjs(item.uploaded_at).format('MMM D, h:mm A')}
                </UploadDate>

                {item.status === 'pending' && (
                  <QuickActions onClick={(e) => e.stopPropagation()}>
                    <QuickActionButton
                      $variant="approve"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove([item.id])}
                    >
                      Approve
                    </QuickActionButton>
                    <QuickActionButton
                      $variant="reject"
                      icon={<CloseOutlined />}
                      onClick={() => handleReject([item.id])}
                    >
                      Reject
                    </QuickActionButton>
                  </QuickActions>
                )}
              </MediaInfo>
            </MediaCard>
          ))}
        </MediaGrid>
      ) : (
        <Card>
          <EmptyStateWrapper>
            <EmptyStateIcon>
              <PictureOutlined />
            </EmptyStateIcon>
            <Title level={4} style={{ color: colors.secondary }}>
              No Media Found
            </Title>
            <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto' }}>
              {activeTab === 'all'
                ? 'No media has been uploaded by guests yet.'
                : `No ${activeTab} media items.`}
            </Paragraph>
          </EmptyStateWrapper>
        </Card>
      )}

      <PreviewModal
        open={!!previewItem}
        onCancel={() => setPreviewItem(null)}
        footer={null}
        width={800}
        centered
      >
        {previewItem && (
          <>
            {previewItem.media_type === 'photo' ? (
              <PreviewImage src={previewItem.file_url} alt={previewItem.caption || 'Guest photo'} />
            ) : (
              <video
                src={previewItem.file_url}
                controls
                style={{ width: '100%', maxHeight: '70vh' }}
              />
            )}
            <PreviewInfo>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Uploaded by</Text>
                  <div style={{ fontWeight: 500 }}>{previewItem.guest_name || 'Unknown Guest'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Uploaded at</Text>
                  <div style={{ fontWeight: 500 }}>
                    {dayjs(previewItem.uploaded_at).format('MMMM D, YYYY h:mm A')}
                  </div>
                </Col>
                {previewItem.caption && (
                  <Col span={24}>
                    <Text type="secondary">Caption</Text>
                    <div style={{ fontWeight: 500 }}>{previewItem.caption}</div>
                  </Col>
                )}
                <Col span={24}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        handleApprove([previewItem.id]);
                        setPreviewItem(null);
                      }}
                      style={{ background: colors.success, borderColor: colors.success }}
                    >
                      Approve
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => {
                        handleReject([previewItem.id]);
                        setPreviewItem(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload([previewItem.id])}
                    >
                      Download
                    </Button>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        handleDelete([previewItem.id]);
                        setPreviewItem(null);
                      }}
                    >
                      Delete
                    </Button>
                  </Space>
                </Col>
              </Row>
            </PreviewInfo>
          </>
        )}
      </PreviewModal>
    </PageWrapper>
  );
};

export default MediaGallery;
