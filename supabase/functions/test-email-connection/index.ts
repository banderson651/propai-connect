import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { ImapClient } from "https://deno.land/x/imap@v0.1.0/mod.ts";
import { EmailAccountService } from "../services/EmailAccountService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailConfig {
  type: 'IMAP' | 'SMTP';
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { config } = await req.json();

    if (!config || !config.type || !config.host || !config.port || !config.username || !config.password) {
      throw new Error("Missing required configuration");
    }

    const emailService = EmailAccountService.getInstance();
    const results = await emailService.testConnection(config);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function testConnection(config: TestEmailConfig) {
  if (config.type === "IMAP") {
    return testImapConnection(config);
  } else {
    return testSmtpConnection(config);
  }
}

async function testImapConnection(config: TestEmailConfig) {
  const client = new ImapClient({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  try {
    await client.connect();
    await client.login();
    await client.logout();
    return {
      success: true,
      message: "IMAP connection successful",
      details: {
        type: "IMAP",
        host: config.host,
        port: config.port,
      },
    };
  } catch (error) {
    throw new Error(`IMAP connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function testSmtpConnection(config: TestEmailConfig) {
  const client = new SmtpClient({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  try {
    await client.connect();
    await client.auth();
    await client.quit();
    return {
      success: true,
      message: "SMTP connection successful",
      details: {
        type: "SMTP",
        host: config.host,
        port: config.port,
      },
    };
  } catch (error) {
    throw new Error(`SMTP connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

const account = {
  email: "user@example.com",
  display_name: "User Name",
  imap_host: "imap.example.com",
  imap_port: 993,
  imap_username: "user@example.com",
  imap_password: "password",
  imap_secure: true,
  smtp_host: "smtp.example.com",
  smtp_port: 587,
  smtp_username: "user@example.com",
  smtp_password: "password",
  smtp_secure: true,
  is_default: true
};
