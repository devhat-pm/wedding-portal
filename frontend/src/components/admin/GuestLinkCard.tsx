import React, { useState } from 'react';
import { Card, Button, Input, Typography, Tooltip, message, Modal, QRCode, Space } from 'antd';
import {
  CopyOutlined,
  WhatsAppOutlined,
  MailOutlined,
  QrcodeOutlined,
  CheckOutlined,
  LinkOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { colors, shadows, borderRadius } from '../../styles/theme';
import { copyToClipboard, formatDate } from '../../utils/helpers';
import type { Wedding } from '../../types/wedding.types';

const { Text, Paragraph } = Typography;

const DEFAULT_INVITATION_TEMPLATE = 'Hi {guest_name}! {couple_names} would love to have you at their wedding ceremony on {wedding_date} at {venue_name}. Please RSVP using the link below. We look forward to celebrating with you!';

interface GuestLinkCardProps {
  guestName: string;
  uniqueToken: string;
  compact?: boolean;
  showQRCode?: boolean;
  className?: string;
  wedding?: Wedding | null;
}

const generateInvitationMessage = (guestName: string, wedding: Wedding | null | undefined, link: string): string => {
  const template = wedding?.invitation_message_template || DEFAULT_INVITATION_TEMPLATE;
  const coupleNames = wedding?.couple_names || 'The Couple';
  const weddingDate = wedding?.wedding_date
    ? dayjs(wedding.wedding_date).format('MMMM D, YYYY')
    : 'the wedding date';
  const venueName = wedding?.venue_name || 'the venue';

  const msg = template
    .replace(/{guest_name}/g, guestName)
    .replace(/{couple_names}/g, coupleNames)
    .replace(/{wedding_date}/g, weddingDate)
    .replace(/{venue_name}/g, venueName);

  return `${msg}\n\n${link}`;
};

const StyledCard = styled(Card)<{ $compact: boolean }>`
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.borderGold};
  box-shadow: ${shadows.sm};

  .ant-card-body {
    padding: ${(props) => (props.$compact ? '16px' : '24px')};
  }
`;

const LinkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const LinkIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.md}px;
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.goldLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 16px;
`;

const LinkInputWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const StyledInput = styled(Input)`
  && {
    border-radius: ${borderRadius.md}px;
    border-color: ${colors.creamDark};
    background: ${colors.creamLight};
    padding-right: 44px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: ${colors.textSecondary};

    &:hover, &:focus {
      border-color: ${colors.primary};
    }
  }
`;

const CopyButton = styled(Button)`
  && {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: ${colors.textSecondary};

    &:hover {
      color: ${colors.primary};
      background: ${colors.goldPale};
    }
  }
`;

const ShareButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ShareButton = styled(Button)<{ $variant: 'whatsapp' | 'email' | 'qr' | 'copy' }>`
  && {
    border-radius: ${borderRadius.md}px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;

    ${(props) => {
      switch (props.$variant) {
        case 'whatsapp':
          return `
            background: #25D366;
            border-color: #25D366;
            color: white;
            &:hover {
              background: #1DA851 !important;
              border-color: #1DA851 !important;
              color: white !important;
            }
          `;
        case 'email':
          return `
            background: ${colors.secondary};
            border-color: ${colors.secondary};
            color: white;
            &:hover {
              background: ${colors.tealDark} !important;
              border-color: ${colors.tealDark} !important;
              color: white !important;
            }
          `;
        case 'qr':
          return `
            border-color: ${colors.primary};
            color: ${colors.primary};
            &:hover {
              background: ${colors.goldPale} !important;
              border-color: ${colors.primary} !important;
              color: ${colors.primary} !important;
            }
          `;
        case 'copy':
          return `
            background: ${colors.primary};
            border-color: ${colors.primary};
            color: white;
            &:hover {
              background: ${colors.goldDark} !important;
              border-color: ${colors.goldDark} !important;
              color: white !important;
            }
          `;
        default:
          return '';
      }
    }}
  }
`;

const QRCodeModal = styled(Modal)`
  .ant-modal-content {
    border-radius: ${borderRadius.lg}px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: 1px solid ${colors.creamDark};
  }

  .ant-modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
  }
`;

const QRCodeWrapper = styled.div`
  padding: 24px;
  background: white;
  border-radius: ${borderRadius.lg}px;
  box-shadow: ${shadows.md};
  margin-bottom: 16px;
`;

const CompactWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessagePreviewBox = styled.div`
  background: linear-gradient(135deg, ${colors.goldPale} 0%, ${colors.creamLight} 100%);
  border: 1px solid ${colors.borderGold};
  border-radius: ${borderRadius.md}px;
  padding: 14px 16px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.6;
  color: ${colors.textPrimary};
`;

const GuestLinkCard: React.FC<GuestLinkCardProps> = ({
  guestName,
  uniqueToken,
  compact = false,
  showQRCode = true,
  className,
  wedding,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}/guest/${uniqueToken}`;
  const invitationMessage = generateInvitationMessage(guestName, wedding, fullUrl);

  const handleCopyMessageAndLink = async () => {
    const ok = await copyToClipboard(invitationMessage);
    if (ok) {
      setCopied(true);
      message.success('Message & link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      message.error('Failed to copy');
    }
  };

  const handleCopyLinkOnly = async () => {
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopiedLink(true);
      message.success('Link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      message.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(invitationMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const coupleNames = wedding?.couple_names || 'The Couple';
    const subject = encodeURIComponent(`Wedding Invitation from ${coupleNames}`);
    const body = encodeURIComponent(invitationMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  if (compact) {
    return (
      <CompactWrapper className={className}>
        <Text
          copyable={{
            text: fullUrl,
            tooltips: ['Copy link', 'Copied!'],
          }}
          style={{ fontFamily: 'monospace', fontSize: 12, color: colors.textSecondary }}
        >
          {uniqueToken.slice(0, 8)}...
        </Text>
        <Tooltip title="Share via WhatsApp">
          <Button
            type="text"
            size="small"
            icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
            onClick={handleWhatsAppShare}
          />
        </Tooltip>
      </CompactWrapper>
    );
  }

  return (
    <>
      <StyledCard $compact={compact} className={className}>
        <LinkHeader>
          <LinkIcon>
            <LinkOutlined />
          </LinkIcon>
          <div>
            <Text strong style={{ display: 'block' }}>
              Guest Portal Link
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Share this link with {guestName}
            </Text>
          </div>
        </LinkHeader>

        {wedding && (
          <MessagePreviewBox>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
              <MessageOutlined style={{ marginRight: 4 }} />
              Invitation Message Preview
            </Text>
            {invitationMessage}
          </MessagePreviewBox>
        )}

        <LinkInputWrapper>
          <StyledInput value={fullUrl} readOnly size="large" />
          <CopyButton
            type="text"
            icon={copiedLink ? <CheckOutlined style={{ color: colors.success }} /> : <CopyOutlined />}
            onClick={handleCopyLinkOnly}
          />
        </LinkInputWrapper>

        <ShareButtonsWrapper>
          <ShareButton
            $variant="copy"
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopyMessageAndLink}
          >
            {copied ? 'Copied!' : 'Copy Message & Link'}
          </ShareButton>

          <ShareButton
            $variant="whatsapp"
            icon={<WhatsAppOutlined />}
            onClick={handleWhatsAppShare}
          >
            WhatsApp
          </ShareButton>

          <ShareButton $variant="email" icon={<MailOutlined />} onClick={handleEmailShare}>
            Email
          </ShareButton>

          {showQRCode && (
            <ShareButton $variant="qr" icon={<QrcodeOutlined />} onClick={() => setQrModalOpen(true)}>
              QR Code
            </ShareButton>
          )}
        </ShareButtonsWrapper>
      </StyledCard>

      <QRCodeModal
        title={`QR Code for ${guestName}`}
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() => {
              // Download QR code as image
              const canvas = document.querySelector('.ant-qrcode canvas') as HTMLCanvasElement;
              if (canvas) {
                const link = document.createElement('a');
                link.download = `qr-code-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                message.success('QR code downloaded!');
              }
            }}
          >
            Download
          </Button>,
        ]}
      >
        <QRCodeWrapper>
          <QRCode value={fullUrl} size={200} />
        </QRCodeWrapper>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
          Scan this code to access the guest portal
        </Paragraph>
      </QRCodeModal>
    </>
  );
};

export default GuestLinkCard;
