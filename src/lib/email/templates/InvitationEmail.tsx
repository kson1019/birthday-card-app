import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Link,
} from "@react-email/components";
import { getMapSearchUrl } from "@/lib/utils";

interface InvitationEmailProps {
  headline: string;
  title: string;
  hostedBy?: string;
  location: string;
  datetime: string;
  message: string;
  imagePath: string;
  cardUrl: string;
  recipientName?: string;
}

export default function InvitationEmail({
  headline,
  title,
  hostedBy,
  location,
  datetime,
  message,
  imagePath,
  cardUrl,
  recipientName,
}: InvitationEmailProps) {
  const mapUrl = getMapSearchUrl(location);

  return (
    <Html>
      <Head />
      <Preview>You&apos;re Invited! {title}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={imageSectionStyle}>
            <Img
              src={imagePath}
              width={500}
              alt={headline}
              style={imageStyle}
            />
          </Section>

          <Section style={contentStyle}>
            <Heading style={headingStyle}>{headline}</Heading>

            {recipientName && (
              <Text style={greetingStyle}>Hi {recipientName},</Text>
            )}

            <Text style={introStyle}>
              You&apos;re invited to a special celebration!
            </Text>

            <Section style={detailsSectionStyle}>
              <Text style={detailLabelStyle}>What</Text>
              <Text style={detailValueStyle}>{title}</Text>

              {hostedBy && (
                <>
                  <Text style={detailLabelStyle}>Hosted by</Text>
                  <Text style={detailValueStyle}>{hostedBy}</Text>
                </>
              )}

              <Text style={detailLabelStyle}>Where</Text>
              <Text style={detailValueStyle}>
                <Link href={mapUrl} style={locationLinkStyle}>
                  {location}
                </Link>
              </Text>

              <Text style={detailLabelStyle}>When</Text>
              <Text style={detailValueStyle}>{datetime}</Text>
            </Section>

            {message && <Text style={messageStyle}>{message}</Text>}

            <Hr style={dividerStyle} />

            <Section style={ctaSectionStyle}>
              <Button href={cardUrl} style={buttonStyle}>
                View Your Invitation & RSVP
              </Button>
            </Section>
            <Text style={fallbackLinkStyle}>
              If the button does not work, copy and paste this link:
              <br />
              <Link href={cardUrl} style={{ color: "#6d28d9" }}>
                {cardUrl}
              </Link>
            </Text>

            <Text style={footerStyle}>
              Click the button above to see your animated invitation card and
              let us know if you can make it!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f5f0ff",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "24px 12px",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "500px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
};

const imageSectionStyle: React.CSSProperties = {
  padding: 0,
};

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "500px",
  height: "auto",
};

const contentStyle: React.CSSProperties = {
  padding: "24px 18px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const greetingStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#444",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const introStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#666",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const detailsSectionStyle: React.CSSProperties = {
  backgroundColor: "#faf5ff",
  borderRadius: "12px",
  padding: "16px 18px",
  margin: "0 0 20px",
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#9333ea",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "12px 0 2px",
};

const detailValueStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#1a1a1a",
  margin: "0 0 8px",
};

const locationLinkStyle: React.CSSProperties = {
  color: "#6d28d9",
  textDecoration: "underline",
};

const messageStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#555",
  fontStyle: "italic",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const dividerStyle: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0",
};

const ctaSectionStyle: React.CSSProperties = {
  textAlign: "center" as const,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#9333ea",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "bold",
  padding: "12px 20px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  lineHeight: "1.2",
};

const footerStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#999",
  textAlign: "center" as const,
  margin: "16px 0 0",
};

const fallbackLinkStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#6d28d9",
  textAlign: "center" as const,
  margin: "10px 0 0",
  wordBreak: "break-all" as const,
};
