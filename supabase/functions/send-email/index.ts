
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  messageId?: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Email request received");
    
    // Parse the request body with improved error handling
    const reqBody = await req.text();
    console.log("Request body:", reqBody);
    
    // Parse JSON with detailed error handling
    let emailData: EmailRequest;
    try {
      emailData = JSON.parse(reqBody);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON: " + (parseError instanceof Error ? parseError.message : String(parseError)),
          requestBody: reqBody
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Validate required fields with specific error messages
    if (!emailData.to) {
      throw new Error("Missing required field: 'to' recipient email address");
    }
    if (!emailData.subject) {
      throw new Error("Missing required field: 'subject'");
    }
    if (!emailData.smtp) {
      throw new Error("Missing required field: 'smtp' configuration");
    }
    if (!emailData.smtp.host) {
      throw new Error("Missing required field: 'smtp.host'");
    }
    if (!emailData.smtp.port) {
      throw new Error("Missing required field: 'smtp.port'");
    }
    if (!emailData.smtp.auth || !emailData.smtp.auth.user || !emailData.smtp.auth.pass) {
      throw new Error("Missing required SMTP authentication credentials");
    }

    const { to, subject, text, html, from, messageId, smtp } = emailData;

    console.log(`Attempting to send email to ${to} using SMTP server ${smtp.host}:${smtp.port}`);
    console.log(`SMTP configuration: secure=${smtp.secure}, user=${smtp.auth.user}`);

    // Set a longer connection timeout (30 seconds) for problematic SMTP servers
    const connectionTimeoutMs = 30000;
    
    try {
      const client = new SmtpClient();
      
      // Add connection timeout
      const connectionPromise = client.connectTLS({
        hostname: smtp.host,
        port: smtp.port,
        username: smtp.auth.user,
        password: smtp.auth.pass
      });
      
      // If not secure, try regular connection
      if (!smtp.secure) {
        connectionPromise = client.connect({
          hostname: smtp.host,
          port: smtp.port,
          username: smtp.auth.user,
          password: smtp.auth.pass
        });
      }
      
      // Set timeout for connection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`SMTP connection timeout after ${connectionTimeoutMs/1000} seconds`)), connectionTimeoutMs);
      });
      
      // Race connection against timeout
      await Promise.race([connectionPromise, timeoutPromise]);

      console.log("SMTP connection established successfully");

      const senderEmail = from || smtp.auth.user;
      const sendOptions = {
        from: senderEmail,
        to: to,
        subject: subject,
        content: html || text || "Email sent from PropAI",
        html: html || undefined,
      };
      
      // Add messageId if provided
      if (messageId) {
        sendOptions.headers = {
          "Message-ID": messageId
        };
      }
      
      console.log("Sending email with options:", {
        ...sendOptions,
        content: sendOptions.content ? "Content provided" : "No content",
      });
      
      const sendResult = await client.send(sendOptions);
      
      console.log("SMTP send result:", sendResult);

      await client.close();

      console.log(`Email sent successfully to ${to}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email sent successfully to ${to}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (smtpError) {
      console.error("SMTP error details:", smtpError);
      
      // Try to extract specific connection error details
      let errorDetails = smtpError instanceof Error ? smtpError.stack : String(smtpError);
      
      // Provide more specific error messages based on common SMTP errors
      let errorMessage = `SMTP error: ${smtpError instanceof Error ? smtpError.message : String(smtpError)}`;
      
      if (errorMessage.includes("getaddrinfo")) {
        errorMessage = `Cannot connect to SMTP server ${smtp.host}: Host not found or unreachable`;
      } else if (errorMessage.includes("connect ETIMEDOUT") || errorMessage.includes("timeout")) {
        errorMessage = `Connection to SMTP server ${smtp.host}:${smtp.port} timed out. Check firewall settings or server availability`;
      } else if (errorMessage.includes("certificate")) {
        errorMessage = `SSL/TLS certificate validation failed for ${smtp.host}. Check your secure setting or server certificate`;
      } else if (errorMessage.includes("authentication")) {
        errorMessage = `Authentication failed for user ${smtp.auth.user}. Check username and password`;
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
          details: errorDetails
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: error instanceof Error ? error.stack : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
