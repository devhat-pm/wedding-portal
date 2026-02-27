import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Dropdown,
  Modal,
  message,
  Typography,
  Row,
  Col,
  Empty,
  Progress,
  List,
  Checkbox,
  Popconfirm,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  SearchOutlined,
  UploadOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  MinusOutlined,
  InboxOutlined,
  FileExcelOutlined,
  WhatsAppOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { guestsApi } from '../../../services';
import AddGuestModal from './AddGuestModal';
import GuestLinkCard from '../../../components/admin/GuestLinkCard';
import { GoldDivider } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { colors, shadows, borderRadius } from '../../../styles/theme';
import { copyToClipboard } from '../../../utils/helpers';
import type { GuestListItem, RSVPStatus } from '../../../types';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const PageWrapper = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterBar = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  margin-bottom: 24px;

  .ant-card-body {
    padding: 16px 20px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled(Input)`
  && {
    width: 280px;
    border-radius: ${borderRadius.md}px;

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

const FilterSelect = styled(Select)`
  && {
    width: 150px;

    .ant-select-selector {
      border-radius: ${borderRadius.md}px !important;
    }
  }
`;

const TableCard = styled(Card)`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};

  .ant-card-body {
    padding: 0;
  }

  .ant-table-wrapper {
    .ant-table-thead > tr > th {
      background: ${colors.creamLight};
      border-bottom: 1px solid ${colors.borderGold};
      font-weight: 600;
      color: ${colors.secondary};
    }

    .ant-table-tbody > tr:hover > td {
      background: ${colors.goldPale};
    }

    .ant-table-tbody > tr > td {
      border-bottom: 1px solid ${colors.creamDark};
    }
  }
`;

const RSVPTag = styled(Tag)<{ $status: RSVPStatus }>`
  && {
    border-radius: 12px;
    font-weight: 500;
    padding: 2px 12px;
    border: none;

    ${(props) => {
      switch (props.$status) {
        case 'confirmed':
          return `
            background: rgba(74, 124, 89, 0.1);
            color: ${colors.success};
          `;
        case 'declined':
          return `
            background: rgba(139, 21, 56, 0.1);
            color: ${colors.error};
          `;
        default:
          return `
            background: rgba(183, 168, 154, 0.15);
            color: ${colors.primary};
          `;
      }
    }}
  }
`;

const StatusIcon = styled.span<{ $hasInfo: boolean }>`
  color: ${(props) => (props.$hasInfo ? colors.success : colors.gray[400])};
  font-size: 16px;
`;

const ActionButton = styled(Button)`
  && {
    padding: 4px 8px;
    height: auto;
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

// Upload Modal Styles
const UploadModal = styled(Modal)`
  .ant-modal-content {
    border-radius: ${borderRadius.xl}px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: 1px solid ${colors.creamDark};
    padding: 20px 24px;
  }

  .ant-modal-body {
    padding: 24px;
  }
`;

const DropzoneArea = styled.div<{ $isDragActive: boolean; $hasFile: boolean }>`
  border: 2px dashed ${(props) =>
    props.$isDragActive ? colors.primary : props.$hasFile ? colors.success : colors.creamDark};
  border-radius: ${borderRadius.lg}px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) =>
    props.$isDragActive
      ? colors.goldPale
      : props.$hasFile
      ? 'rgba(74, 124, 89, 0.05)'
      : colors.creamLight};

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.goldPale};
  }
`;

const DropzoneIcon = styled.div`
  font-size: 48px;
  color: ${colors.primary};
  margin-bottom: 16px;
`;

const PreviewSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${colors.creamLight};
  border-radius: ${borderRadius.md}px;
  max-height: 300px;
  overflow-y: auto;
`;

const PreviewItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: ${borderRadius.sm}px;
  margin-bottom: 8px;
  border: 1px solid ${colors.creamDark};

  &:last-child {
    margin-bottom: 0;
  }
`;

const UploadProgressWrapper = styled.div`
  margin-top: 24px;
`;

const SuccessListWrapper = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-top: 16px;
`;

interface TableParams {
  pagination: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
}

interface UploadedGuest {
  name: string;
  token: string;
}

const GuestList: React.FC = () => {
  const navigate = useNavigate();
  const { wedding } = useAuth();
  const [guests, setGuests] = useState<GuestListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [travelFilter, setTravelFilter] = useState<string>('all');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestListItem | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadParsedData, setUploadParsedData] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<'select' | 'preview' | 'uploading' | 'success'>('select');
  const [uploadedGuests, setUploadedGuests] = useState<UploadedGuest[]>([]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadFile(file);
      // Parse Excel/CSV for preview before upload
      parseFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const parseFile = async (file: File) => {
    // Show file info as preview - actual parsing happens server-side
    setUploadParsedData([file.name]);
    setUploadStep('preview');
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadStep('uploading');
    setUploadProgress(0);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      // Simulate progress while uploading
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);

      const result = await guestsApi.uploadGuestsExcel(uploadFile);

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      // Populate uploaded guests from API response for display
      const uploaded = (result.guests || []).map((g: any) => ({
        name: g.full_name || g.name || '',
        token: g.unique_token || g.token || '',
      }));
      setUploadedGuests(uploaded);
      setUploadStep('success');
      const count = result.created_count || result.created || uploaded.length;
      message.success(`Successfully uploaded ${count} guest(s)!${result.errors?.length ? ` (${result.errors.length} error(s))` : ''}`);
      if (result.errors?.length) {
        result.errors.forEach((err: string) => message.warning(err));
      }
      fetchGuests();
    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      message.error(error.response?.data?.detail || error?.detail || 'Failed to upload file');
      setUploadStep('preview');
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setUploadLoading(false);
    }
  };

  const resetUpload = () => {
    setUploadFile(null);
    setUploadParsedData([]);
    setUploadStep('select');
    setUploadProgress(0);
    setUploadedGuests([]);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    resetUpload();
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await guestsApi.downloadUploadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guest_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('Template downloaded!');
    } catch {
      message.error('Failed to download template');
    }
  };

  // Fetch guests
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await guestsApi.getGuests({
        page: tableParams.pagination.current || 1,
        page_size: tableParams.pagination.pageSize || 10,
        search: searchText || undefined,
        rsvp_status: rsvpFilter !== 'all' ? (rsvpFilter as RSVPStatus) : undefined,
        has_travel_info: travelFilter !== 'all' ? travelFilter === 'yes' : undefined,
        has_hotel_info: hotelFilter !== 'all' ? hotelFilter === 'yes' : undefined,
      });

      setGuests(response.items);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.total,
        },
      }));
    } catch (error) {
      message.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, searchText, rsvpFilter, travelFilter, hotelFilter]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<GuestListItem> | SorterResult<GuestListItem>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      sortField: Array.isArray(sorter) ? undefined : (sorter.field as string),
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
    });
  };

  const handleCopyLink = async (token: string) => {
    const appUrl = import.meta.env.VITE_APP_URL?.trim().replace(/\/+$/, '') || window.location.origin;
    const url = `${appUrl}/guest/${token}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      message.success('Link copied to clipboard!');
    } else {
      message.error('Failed to copy link');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await guestsApi.deleteGuest(id);
      message.success('Guest deleted');
      fetchGuests();
    } catch (error) {
      message.error('Failed to delete guest');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => guestsApi.deleteGuest(id as number)));
      message.success(`Deleted ${selectedRowKeys.length} guests`);
      setSelectedRowKeys([]);
      fetchGuests();
    } catch (error) {
      message.error('Failed to delete guests');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await guestsApi.exportGuests();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guests-export.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('Export downloaded!');
    } catch (error) {
      message.error('Failed to export guests');
    }
  };

  const handleRegenerateLink = async (id: number) => {
    try {
      await guestsApi.regenerateLink(id);
      message.success('Link regenerated');
      fetchGuests();
    } catch (error) {
      message.error('Failed to regenerate link');
    }
  };

  const showLinkModal = (guest: GuestListItem) => {
    setSelectedGuest(guest);
    setLinkModalOpen(true);
  };

  const columns: ColumnsType<GuestListItem> = [
    {
      title: 'Guest Name',
      key: 'name',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <Text strong style={{ whiteSpace: 'nowrap' }}>
          {(record as any).full_name || `${record.first_name} ${record.last_name}`}
        </Text>
      ),
      sorter: (a, b) => {
        const nameA = ((a as any).full_name || `${a.first_name} ${a.last_name}`).toLowerCase();
        const nameB = ((b as any).full_name || `${b.first_name} ${b.last_name}`).toLowerCase();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Guests',
      key: 'number_of_attendees',
      width: 80,
      align: 'center',
      sorter: (a, b) => (a.number_of_attendees || 0) - (b.number_of_attendees || 0),
      render: (_, record) => (
        <Text>{record.number_of_attendees || 0}</Text>
      ),
    },
    {
      title: 'RSVP',
      dataIndex: 'rsvp_status',
      key: 'rsvp_status',
      width: 120,
      sorter: (a, b) => (a.rsvp_status || '').localeCompare(b.rsvp_status || ''),
      render: (status: RSVPStatus) => {
        const icons = {
          confirmed: <CheckCircleOutlined />,
          declined: <CloseCircleOutlined />,
          pending: <ClockCircleOutlined />,
          maybe: <ClockCircleOutlined />,
        };
        return (
          <RSVPTag $status={status}>
            {icons[status] || icons.pending} {status.charAt(0).toUpperCase() + status.slice(1)}
          </RSVPTag>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => phone || <Text type="secondary">-</Text>,
    },
    {
      title: 'Travel',
      key: 'has_travel_info',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <StatusIcon $hasInfo={record.has_travel_info}>
          {record.has_travel_info ? <CheckOutlined /> : <MinusOutlined />}
        </StatusIcon>
      ),
    },
    {
      title: 'Hotel',
      key: 'has_hotel_info',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <StatusIcon $hasInfo={record.has_hotel_info}>
          {record.has_hotel_info ? <CheckOutlined /> : <MinusOutlined />}
        </StatusIcon>
      ),
    },
    {
      title: 'Link',
      key: 'unique_token',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Copy link">
            <ActionButton
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(record.unique_token)}
            />
          </Tooltip>
          <Tooltip title="Share via WhatsApp">
            <ActionButton
              type="text"
              icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
              onClick={() => showLinkModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => navigate(`/admin/guests/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => navigate(`/admin/guests/${record.id}?edit=true`),
              },
              {
                key: 'regenerate',
                icon: <ReloadOutlined />,
                label: 'Regenerate Link',
                onClick: () => handleRegenerateLink(record.id),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Delete Guest',
                    content: `Are you sure you want to delete ${(record as any).full_name || `${record.first_name} ${record.last_name}`}?`,
                    okText: 'Delete',
                    okButtonProps: { danger: true },
                    onOk: () => handleDelete(record.id as any),
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <ActionButton type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <PageWrapper>
      <PageHeader>
        <HeaderLeft>
          <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
            <TeamOutlined style={{ marginRight: 12, color: colors.primary }} />
            Guest Management
          </Title>
          <Text type="secondary">Manage your wedding guest list and invitations</Text>
        </HeaderLeft>

        <HeaderRight>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
          <Button icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
            Upload Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
            Add Guest
          </Button>
        </HeaderRight>
      </PageHeader>

      {/* Filter Bar */}
      <FilterBar>
        <FilterRow>
          <SearchInput
            placeholder="Search guests..."
            prefix={<SearchOutlined style={{ color: colors.textSecondary }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <FilterSelect
            placeholder="RSVP Status"
            value={rsvpFilter}
            onChange={(value) => setRsvpFilter(value as string)}
            suffixIcon={<FilterOutlined />}
            popupMatchSelectWidth={false}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="declined">Declined</Option>
          </FilterSelect>

          <FilterSelect
            placeholder="Travel Info"
            value={travelFilter}
            onChange={(value) => setTravelFilter(value as string)}
            popupMatchSelectWidth={false}
          >
            <Option value="all">All Travel</Option>
            <Option value="yes">Has Travel Info</Option>
            <Option value="no">No Travel Info</Option>
          </FilterSelect>

          <FilterSelect
            placeholder="Hotel Info"
            value={hotelFilter}
            onChange={(value) => setHotelFilter(value as string)}
            popupMatchSelectWidth={false}
          >
            <Option value="all">All Hotel</Option>
            <Option value="yes">Has Hotel Info</Option>
            <Option value="no">No Hotel Info</Option>
          </FilterSelect>

          {selectedRowKeys.length > 0 && (
            <Space>
              <Text type="secondary">{selectedRowKeys.length} selected</Text>
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} guests?`}
                onConfirm={handleBulkDelete}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button danger size="small">
                  Delete Selected
                </Button>
              </Popconfirm>
            </Space>
          )}
        </FilterRow>
      </FilterBar>

      {/* Table */}
      <TableCard>
        <Table
          columns={columns}
          dataSource={guests}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <EmptyStateWrapper>
                <EmptyStateIcon>
                  <TeamOutlined />
                </EmptyStateIcon>
                <Title level={4} style={{ color: colors.secondary }}>
                  No Guests Yet
                </Title>
                <Paragraph type="secondary" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
                  Start building your guest list by adding guests manually or uploading an Excel file.
                </Paragraph>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
                    Add Guest
                  </Button>
                  <Button icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
                    Upload Excel
                  </Button>
                </Space>
              </EmptyStateWrapper>
            ),
          }}
        />
      </TableCard>

      {/* Add Guest Modal */}
      <AddGuestModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => fetchGuests()}
      />

      {/* Upload Modal */}
      <UploadModal
        title="Upload Guest List"
        open={uploadModalOpen}
        onCancel={closeUploadModal}
        width={600}
        footer={
          uploadStep === 'select'
            ? null
            : uploadStep === 'preview'
            ? [
                <Button key="back" onClick={resetUpload}>
                  Choose Different File
                </Button>,
                <Button key="upload" type="primary" onClick={handleUpload} loading={uploadLoading}>
                  Upload Guests
                </Button>,
              ]
            : uploadStep === 'success'
            ? [
                <Button key="close" type="primary" onClick={closeUploadModal}>
                  Done
                </Button>,
              ]
            : null
        }
      >
        {uploadStep === 'select' && (
          <>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <DropzoneArea $isDragActive={isDragActive} $hasFile={false}>
                <DropzoneIcon>
                  <FileExcelOutlined />
                </DropzoneIcon>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel file'}
                </Title>
                <Text type="secondary">or click to browse</Text>
                <div style={{ marginTop: 16 }}>
                  <Tag>.xlsx</Tag>
                  <Tag>.xls</Tag>
                  <Tag>.csv</Tag>
                </div>
              </DropzoneArea>
            </div>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                Need a template? The file must have a <Text strong>full_name</Text> column.
              </Text>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                type="link"
              >
                Download Template
              </Button>
            </div>
          </>
        )}

        {uploadStep === 'preview' && (
          <>
            <DropzoneArea $isDragActive={false} $hasFile={true}>
              <Space>
                <CheckCircleOutlined style={{ fontSize: 24, color: colors.success }} />
                <div>
                  <Text strong>{uploadFile?.name}</Text>
                  <Text type="secondary" style={{ display: 'block' }}>
                    {(uploadFile?.size ? (uploadFile.size / 1024).toFixed(1) : '0')} KB - Ready to upload
                  </Text>
                </div>
              </Space>
            </DropzoneArea>

            <PreviewSection>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                File will be processed on the server. Duplicate names will be skipped automatically.
              </Text>
            </PreviewSection>
          </>
        )}

        {uploadStep === 'uploading' && (
          <UploadProgressWrapper>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InboxOutlined style={{ fontSize: 48, color: colors.primary, marginBottom: 24 }} />
              <Title level={5}>Uploading Guests...</Title>
              <Progress percent={uploadProgress} status="active" strokeColor={colors.primary} />
            </div>
          </UploadProgressWrapper>
        )}

        {uploadStep === 'success' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: colors.success, marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                Upload Successful!
              </Title>
              <Text type="secondary">
                {uploadedGuests.length} guests have been added with unique links
              </Text>
            </div>

            <GoldDivider text="Generated Links" variant="simple" margin="16px 0" />

            <SuccessListWrapper>
              <List
                dataSource={uploadedGuests}
                renderItem={(guest) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Copy link" key="copy">
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyLink(guest.token)}
                        />
                      </Tooltip>,
                      <Tooltip title="WhatsApp" key="whatsapp">
                        <Button
                          type="text"
                          icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                          onClick={() => {
                            const appUrl = import.meta.env.VITE_APP_URL?.trim().replace(/\/+$/, '') || window.location.origin;
                            const url = `${appUrl}/guest/${guest.token}`;
                            const text = encodeURIComponent(
                              `You're invited! Please RSVP using your personal link below:\n\n${url}`
                            );
                            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                          }}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta title={guest.name} description={`Token: ${guest.token}`} />
                  </List.Item>
                )}
              />
            </SuccessListWrapper>
          </>
        )}
      </UploadModal>

      {/* Link Share Modal */}
      <Modal
        title={`Share Link - ${(selectedGuest as any)?.full_name || `${selectedGuest?.first_name} ${selectedGuest?.last_name}`}`}
        open={linkModalOpen}
        onCancel={() => setLinkModalOpen(false)}
        destroyOnClose
        maskClosable
        footer={[
          <Button key="close" onClick={() => setLinkModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={500}
      >
        {selectedGuest && (
          <GuestLinkCard
            guestName={(selectedGuest as any).full_name || `${selectedGuest.first_name} ${selectedGuest.last_name}`}
            uniqueToken={selectedGuest.unique_token}
            wedding={wedding}
          />
        )}
      </Modal>
    </PageWrapper>
  );
};

export default GuestList;
