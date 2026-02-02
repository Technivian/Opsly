import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { storage } from "../storage";

/**
 * Gmail OAuth and API Integration
 * 
 * Handles:
 * - OAuth 2.0 authorization flow
 * - Token storage and refresh
 * - Gmail API operations (list, read, modify emails)
 */

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.labels",
];

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  labelIds: string[];
}

export class GmailConnector {
  private config: GmailConfig;
  private oauth2Client: OAuth2Client;

  constructor(config: GmailConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GMAIL_SCOPES,
      prompt: "consent",
      state: state || "",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to obtain access and refresh tokens");
    }

    const expiresAt = new Date();
    if (tokens.expiry_date) {
      expiresAt.setTime(tokens.expiry_date);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 1); // Default 1 hour
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    };
  }

  /**
   * Set credentials from stored tokens
   */
  async setCredentials(accessToken: string, refreshToken: string): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Set up auto-refresh
    this.oauth2Client.on("tokens", async (tokens) => {
      if (tokens.refresh_token) {
        // TODO: Update stored refresh token
        console.log("[Gmail] New refresh token received");
      }
      if (tokens.access_token) {
        // TODO: Update stored access token
        console.log("[Gmail] Access token refreshed");
      }
    });
  }

  /**
   * List messages matching query
   */
  async listMessages(
    query: string = "is:unread",
    maxResults: number = 50
  ): Promise<GmailMessage[]> {
    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];
    const fullMessages: GmailMessage[] = [];

    // Fetch full message details
    for (const message of messages) {
      if (!message.id) continue;

      const fullMessage = await this.getMessage(message.id);
      if (fullMessage) {
        fullMessages.push(fullMessage);
      }
    }

    return fullMessages;
  }

  /**
   * Get full message details
   */
  async getMessage(messageId: string): Promise<GmailMessage | null> {
    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = response.data;
    if (!message.id) return null;

    const headers = message.payload?.headers || [];
    const from = headers.find((h) => h.name === "From")?.value || "";
    const to = headers.find((h) => h.name === "To")?.value || "";
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const dateStr = headers.find((h) => h.name === "Date")?.value || "";

    // Extract body
    let body = "";
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
    } else if (message.payload?.parts) {
      // Multi-part message
      const textPart = message.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    }

    return {
      id: message.id,
      threadId: message.threadId || "",
      from,
      to,
      subject,
      snippet: message.snippet || "",
      body,
      date: dateStr ? new Date(dateStr) : new Date(),
      labelIds: message.labelIds || [],
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  }

  /**
   * Add labels to message
   */
  async addLabels(messageId: string, labelIds: string[]): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: labelIds,
      },
    });
  }

  /**
   * Archive message (remove INBOX label)
   */
  async archive(messageId: string): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["INBOX"],
      },
    });
  }
}

/**
 * Get Gmail connector for an organization
 */
export async function getGmailConnector(
  orgId: number
): Promise<GmailConnector | null> {
  const connection = await storage.getConnectionByProvider(orgId, "gmail");
  if (!connection || !connection.accessToken || !connection.refreshToken) {
    return null;
  }

  const config: GmailConfig = {
    clientId: process.env.GMAIL_CLIENT_ID || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
    redirectUri: process.env.GMAIL_REDIRECT_URI || `${process.env.BASE_URL || "http://localhost:5000"}/api/connections/gmail/callback`,
  };

  const connector = new GmailConnector(config);
  await connector.setCredentials(connection.accessToken, connection.refreshToken);
  
  return connector;
}
