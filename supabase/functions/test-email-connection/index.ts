
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { ImapFlow } from "npm:imapflow@1.0.162";
import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailConnectionConfig {
  type: "IMAP" | "POP3";
  host: string;
  port: number;
  username: string;
  password: string;
  email: string;
  secure: boolean;
}

interface TestEmailConfig extends EmailConnectionConfig {
  recipient?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...config }: { action: "test-connection" | "send-test-email" } & TestEmailConfig = await req.json();
    
    if (action === "test-connection") {
      const result = await testConnection(config);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "send-test-email" && config.recipient) {
      const result = await sendTestEmail(config);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action specified" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message || "Unknown error occurred"}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function testConnection(config: EmailConnectionConfig) {
  // For now we only support IMAP, POP3 would require different library
  if (config.type === "IMAP") {
    try {
      const client = new ImapFlow({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
        logger: false,
        // Timeout after 10 seconds - normal connections should be fast
        timeout: 10000,
      });

      // Connect and immediately disconnect to verify credentials
      await client.connect();
      await client.logout();
      
      return {
        success: true,
        message: "Connection successful! Your IMAP email account is properly configured."
      };
    } catch (error) {
      console.error("IMAP connection error:", error);
      
      let errorMessage = "Unable to connect to mail server.";
      if (error.message.includes("auth")) {
        errorMessage = "Authentication failed. Please check your username and password.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Connection timed out. The mail server is not responding.";
      } else if (error.message.includes("certificate")) {
        errorMessage = "TLS/SSL negotiation failed. Please check your security settings.";
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  } else {
    return {
      success: false,
      message: "POP3 connections are currently not supported. Please use IMAP instead."
    };
  }
}

async function sendTestEmail(config: TestEmailConfig) {
  if (!config.recipient) {
    return {
      success: false,
      message: "Recipient email address is required."
    };
  }

  try {
    const smtpClient = new SMTPClient({
      user: config.username,
      password: config.password,
      host: config.host.replace('imap.', 'smtp.'), // Convert IMAP to SMTP server
      port: 587, // Default SMTP port
      tls: true,
      timeout: 10000,
    });

    const message = {
      from: config.email,
      to: config.recipient,
      subject: "PropAI Test Email",
      text: "This is a test email from PropAI to verify your email server configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4F46E5;">PropAI Test Email</h2>
          <p>This is a test email sent from PropAI to verify your email server configuration.</p>
          <p>If you received this email, your email settings are correctly configured!</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Sent from PropAI - Real Estate Automation Platform</p>
        </div>
      `,
    };

    await smtpClient.sendAsync(message);

    return {
      success: true,
      message: `Test email sent to ${config.recipient} from ${config.email} successfully!`
    };
  } catch (error) {
    console.error("SMTP error:", error);
    return {
      success: false,
      message: `Failed to send test email: ${error.message || "Unknown error"}`
    };
  }
}
