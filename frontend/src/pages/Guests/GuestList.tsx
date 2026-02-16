import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Dropdown,
  Modal,
  Card,
  Row,
  Col,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader, RSVPTag, VIPBadge, GuestSideTag, EmptyState, LoadingSpinner } from '../../components';
import { useGuests, useDeleteGuest, useGuestGroups } from '../../hooks';
import { GuestFilters, GuestListItem, RSVPStatus, GuestSide, GuestRelation } from '../../types';
import { getGuestRelationLabel, downloadFile } from '../../utils/helpers';
import { exportGuestsToExcel, getGuestImportTemplate, importGuestsFromExcel } from '../../services/guests';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

const GuestList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<GuestFilters>({});
  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGuests(page, pageSize, sortBy, sortOrder, filters);
  const { data: groups } = useGuestGroups();
  const deleteGuestMutation = useDeleteGuest();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setPage(1);
  };

  const handleFilterChange = (key: keyof GuestFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1);
  };

  const handleDelete = (id: number) => {
    setGuestToDelete(String(id));
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (guestToDelete) {
      await deleteGuestMutation.mutateAsync(guestToDelete);
      setDeleteModalVisible(false);
      setGuestToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportGuestsToExcel();
      downloadFile(blob, 'wedding_guests.xlsx');
      message.success('Export successful!');
    } catch (error) {
      message.error('Failed to export guests');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getGuestImportTemplate();
      downloadFile(blob, 'guest_import_template.xlsx');
    } catch (error) {
      message.error('Failed to download template');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importGuestsFromExcel(file);
      message.success(result.message);
      refetch();
    } catch (error) {
      message.error('Failed to import guests');
    }
  };

  const columns: ColumnsType<GuestListItem> = [
    {
      title: 'Name',
      key: 'name',
      sorter: true,
      render: (_, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>
            {record.first_name} {record.last_name}
          </span>
          {record.is_vip && <VIPBadge size="small" />}
        </Space>
      ),
    },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      render: (side: GuestSide) => <GuestSideTag side={side} />,
    },
    {
      title: 'Relation',
      dataIndex: 'relation',
      key: 'relation',
      render: (relation: GuestRelation) => getGuestRelationLabel(relation),
    },
    {
      title: 'RSVP',
      dataIndex: 'rsvp_status',
      key: 'rsvp_status',
      render: (status: RSVPStatus) => <RSVPTag status={status} />,
    },
    {
      title: 'Total Guests',
      dataIndex: 'total_guests',
      key: 'total_guests',
      render: (count: number) => <Tag color="gold">{count}</Tag>,
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (table: number | null) => (table ? `Table ${table}` : '-'),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.email && <span style={{ fontSize: 12 }}>{record.email}</span>}
          {record.phone && <span style={{ fontSize: 12, color: '#9A9187' }}>{record.phone}</span>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => navigate(`/guests/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => navigate(`/guests/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  if (isLoading && !data) {
    return <LoadingSpinner text="Loading guests..." />;
  }

  return (
    <div>
      <PageHeader
        title="Guests"
        subtitle={`Manage your wedding guest list (${data?.total || 0} total)`}
        breadcrumbs={[
          { title: 'Dashboard', path: '/dashboard' },
          { title: 'Guests' },
        ]}
        extra={
          <Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'export',
                    icon: <DownloadOutlined />,
                    label: 'Export to Excel',
                    onClick: handleExport,
                  },
                  {
                    key: 'template',
                    icon: <DownloadOutlined />,
                    label: 'Download Import Template',
                    onClick: handleDownloadTemplate,
                  },
                  { type: 'divider' },
                  {
                    key: 'import',
                    icon: <UploadOutlined />,
                    label: (
                      <label style={{ cursor: 'pointer' }}>
                        Import from Excel
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImport(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ),
                  },
                ],
              }}
            >
              <Button icon={<DownloadOutlined />}>Import/Export</Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/guests/new')}
            >
              Add Guest
            </Button>
          </Space>
        }
      />

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #D6C7B8',
        }}
      >
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search guests..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="RSVP Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('rsvp_status', value)}
            >
              <Option value={RSVPStatus.PENDING}>Pending</Option>
              <Option value={RSVPStatus.CONFIRMED}>Confirmed</Option>
              <Option value={RSVPStatus.DECLINED}>Declined</Option>
              <Option value={RSVPStatus.TENTATIVE}>Tentative</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Side"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('side', value)}
            >
              <Option value={GuestSide.BRIDE}>Bride</Option>
              <Option value={GuestSide.GROOM}>Groom</Option>
              <Option value={GuestSide.BOTH}>Both</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Relation"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('relation', value)}
            >
              <Option value={GuestRelation.FAMILY}>Family</Option>
              <Option value={GuestRelation.FRIEND}>Friend</Option>
              <Option value={GuestRelation.COLLEAGUE}>Colleague</Option>
              <Option value={GuestRelation.NEIGHBOR}>Neighbor</Option>
              <Option value={GuestRelation.OTHER}>Other</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="VIP"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) =>
                handleFilterChange('is_vip', value === 'true' ? true : value === 'false' ? false : undefined)
              }
            >
              <Option value="true">VIP Only</Option>
              <Option value="false">Non-VIP</Option>
            </Select>
          </Col>
          {groups && groups.length > 0 && (
            <Col xs={12} sm={6} md={4} lg={3}>
              <Select
                placeholder="Group"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => handleFilterChange('group_id', value)}
              >
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}
        </Row>

        {/* Table */}
        {data?.items.length === 0 ? (
          <EmptyState
            title="No Guests Found"
            description="You haven't added any guests yet. Start building your guest list!"
            actionText="Add First Guest"
            onAction={() => navigate('/guests/new')}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data?.items}
            rowKey="id"
            loading={isLoading}
            rowSelection={rowSelection}
            pagination={{
              current: page,
              pageSize,
              total: data?.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} guests`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/guests/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Guest"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setGuestToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true, loading: deleteGuestMutation.isPending }}
      >
        <p>Are you sure you want to delete this guest? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default GuestList;
