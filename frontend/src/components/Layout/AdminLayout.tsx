import React, { useState, useEffect, Suspense } from 'react';
import { Layout, Menu, Dropdown, Avatar, Breadcrumb, Button, Drawer, Spin } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  HomeOutlined,
  SkinOutlined,
  CoffeeOutlined,
  CalendarOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  BellOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { colors, shadows, borderRadius } from '../../styles/theme';
import ChatBot from '../chat/ChatBot';

const { Header, Sider, Content } = Layout;

const SIDER_WIDTH = 240;
const SIDER_COLLAPSED_WIDTH = 80;
const MOBILE_BREAKPOINT = 992;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledSider = styled(Sider)`
  background: ${colors.cardBg} !important;
  box-shadow: ${shadows.md};
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow: auto;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }

  /* Arabic pattern background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='none' stroke='%23B7A89A' stroke-width='0.3' opacity='0.06'/%3E%3C/svg%3E");
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    display: none !important;
  }
`;

const Logo = styled.div`
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid ${colors.creamDark};
  position: relative;
  z-index: 1;
`;

const LogoText = styled.h1<{ $collapsed: boolean }>`
  font-family: 'Playfair Display', serif;
  font-size: ${(props) => (props.$collapsed ? '20px' : '24px')};
  color: ${colors.secondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  transition: font-size 0.3s;

  span {
    color: ${colors.primary};
  }
`;

const LogoSubtext = styled.p<{ $collapsed: boolean }>`
  font-size: 11px;
  color: ${colors.textSecondary};
  margin: 4px 0 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
`;

const StyledMenu = styled(Menu)`
  background: transparent !important;
  border-right: none !important;
  padding: 16px 8px;
  flex: 1;
  position: relative;
  z-index: 1;

  .ant-menu-item {
    margin: 4px 0;
    border-radius: ${borderRadius.md}px;
    height: 44px;
    line-height: 44px;

    &:hover {
      background: ${colors.creamMedium} !important;
    }

    &.ant-menu-item-selected {
      background: ${colors.goldPale} !important;
      color: ${colors.primary} !important;

      &::after {
        border-right-color: ${colors.primary} !important;
      }
    }
  }

  .ant-menu-item-icon {
    font-size: 18px !important;
  }
`;

const MainLayout = styled(Layout)<{ $siderWidth: number }>`
  margin-left: ${(props) => props.$siderWidth}px;
  transition: margin-left 0.2s ease;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    margin-left: 0;
  }
`;

const StyledHeader = styled(Header)`
  background: ${colors.cardBg} !important;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${shadows.sm};
  position: sticky;
  top: 0;
  z-index: 99;
  height: 64px;

  @media (max-width: 576px) {
    padding: 0 16px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MobileMenuButton = styled(Button)`
  display: none;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    display: flex;
  }
`;

const BreadcrumbWrapper = styled.div`
  @media (max-width: 576px) {
    display: none;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationButton = styled(Button)`
  border: none;
  box-shadow: none;
  background: transparent;

  &:hover {
    background: ${colors.creamMedium};
  }
`;

const WeddingName = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: ${colors.secondary};
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserDropdownTrigger = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: ${borderRadius.md}px;
  transition: background 0.2s;

  &:hover {
    background: ${colors.creamMedium};
  }
`;

const AdminName = styled.span`
  font-size: 14px;
  color: ${colors.textPrimary};

  @media (max-width: 576px) {
    display: none;
  }
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: ${colors.background};
  min-height: calc(100vh - 64px);

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    padding: 20px;
  }

  @media (max-width: 576px) {
    padding: 16px;
  }
`;

const PageLoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: 16px;
`;

const LoadingText = styled.span`
  color: ${colors.textSecondary};
  font-size: 14px;
`;

const MobileDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 0;
    background: ${colors.cardBg};
  }
`;

interface AdminLayoutProps {
  weddingName?: string;
  adminEmail?: string;
}

const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/admin/guests',
    icon: <TeamOutlined />,
    label: 'Guests',
  },
  {
    key: '/admin/hotels',
    icon: <HomeOutlined />,
    label: 'Hotels',
  },
  {
    key: '/admin/dress-codes',
    icon: <SkinOutlined />,
    label: 'Dress Codes',
  },
  {
    key: '/admin/food-menu',
    icon: <CoffeeOutlined />,
    label: 'Food Menu',
  },
  {
    key: '/admin/activities',
    icon: <CalendarOutlined />,
    label: 'Activities',
  },
  {
    key: '/admin/media',
    icon: <PictureOutlined />,
    label: 'Media Gallery',
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({
  weddingName = 'Wedding',
  adminEmail = 'admin@example.com',
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('wedding_id');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Get current breadcrumb items
  const getBreadcrumbItems = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const items: { title: React.ReactNode }[] = [{ title: <Link to="/admin">Home</Link> }];

    if (pathParts.length > 1) {
      const currentPage = menuItems.find((item) => item.key === location.pathname);
      if (currentPage) {
        items.push({ title: currentPage.label });
      }
    }

    return items;
  };

  const renderSiderContent = () => (
    <>
      <Logo>
        <LogoText $collapsed={collapsed}>
          <span>W</span>edding
        </LogoText>
        <LogoSubtext $collapsed={collapsed}>Management System</LogoSubtext>
      </Logo>
      <StyledMenu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  );

  return (
    <StyledLayout>
      {/* Desktop Sider */}
      <StyledSider
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        trigger={null}
      >
        {renderSiderContent()}
      </StyledSider>

      {/* Mobile Drawer */}
      <MobileDrawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={280}
      >
        {renderSiderContent()}
      </MobileDrawer>

      <MainLayout $siderWidth={isMobile ? 0 : siderWidth}>
        <StyledHeader>
          <HeaderLeft>
            <MobileMenuButton
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
            />
            <BreadcrumbWrapper>
              <Breadcrumb items={getBreadcrumbItems()} />
            </BreadcrumbWrapper>
          </HeaderLeft>

          <HeaderRight>
            <WeddingName>{weddingName}</WeddingName>
            <NotificationButton
              type="text"
              icon={<BellOutlined style={{ fontSize: 18 }} />}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <UserDropdownTrigger>
                <Avatar
                  style={{ backgroundColor: colors.primary }}
                  icon={<UserOutlined />}
                />
                <AdminName>{adminEmail}</AdminName>
              </UserDropdownTrigger>
            </Dropdown>
          </HeaderRight>
        </StyledHeader>

        <StyledContent>
          <Suspense
            fallback={
              <PageLoadingWrapper>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: colors.primary }} spin />} />
                <LoadingText>Loading page...</LoadingText>
              </PageLoadingWrapper>
            }
          >
            <Outlet />
          </Suspense>
        </StyledContent>
      </MainLayout>

      <ChatBot weddingId={localStorage.getItem('wedding_id') || undefined} position="bottom-right" />
    </StyledLayout>
  );
};

export default AdminLayout;
