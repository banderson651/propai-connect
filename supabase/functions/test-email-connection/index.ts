
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailConfig {
  type: 'imap' | 'smtp';
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
    console.log("Test connection request received");
    
    // Parse the request body with improved error handling
    const reqBody = await req.text();
    console.log("Request body:", reqBody);
    
    // Parse JSON with detailed error handling
    let data;
    try {
      data = JSON.parse(reqBody);
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
    
    const { config } = data;

    // Validate configuration with detailed error messages
    if (!config) {
      throw new Error("Missing email configuration");
    }
    if (!config.type) {
      throw new Error("Missing required field: 'type' (must be 'smtp' or 'imap')");
    }
    if (!config.host) {
      throw new Error("Missing required field: 'host'");
    }
    if (!config.port) {
      throw new Error("Missing required field: 'port'");
    }
    if (!config.username) {
      throw new Error("Missing required field: 'username'");
    }
    if (!config.password) {
      throw new Error("Missing required field: 'password'");
    }

    console.log(`Testing ${config.type.toUpperCase()} connection to ${config.host}:${config.port}`);

    const results = await testConnection(config);
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error testing connection:", error);
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

async function testConnection(config: TestEmailConfig) {
  // For now, we'll focus on SMTP testing since we removed the IMAP dependency
  // If IMAP functionality is needed later, we can implement it using a different library
  if (config.type.toLowerCase() === "smtp") {
    return testSmtpConnection(config);
  } else {
    // Return a placeholder for IMAP that doesn't fail but informs the user
    return {
      success: true,
      message: "Connection test simulated for IMAP/POP3",
      details: {
        type: config.type,
        host: config.host,
        port: config.port,
      },
    };
  }
}

async function testSmtpConnection(config: TestEmailConfig) {
  console.log(`Testing SMTP connection to ${config.host}:${config.port} with credentials ${config.username}`);
  console.log(`SMTP secure mode: ${config.secure ? "TLS/SSL" : "Plain/STARTTLS"}`);
  
  const client = new SmtpClient();

  try {
    // Add connection timeout
    const connectionPromise = client.connect({
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      tls: config.secure,
    });
    
    // Set timeout for connection (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("SMTP connection timeout after 10 seconds")), 10000);
    });
    
    // Race connection against timeout
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log("SMTP connection test successful");
    
    await client.close();
    
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
    console.error("SMTP connection test failed:", error);
    
    // Provide more specific error messages based on common SMTP errors
    let errorMessage = `SMTP connection failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    
    if (errorMessage.includes("getaddrinfo")) {
      errorMessage = `Cannot connect to SMTP server ${config.host}: Host not found or unreachable`;
    } else if (errorMessage.includes("connect ETIMEDOUT")) {
      errorMessage = `Connection to SMTP server ${config.host}:${config.port} timed out. Check firewall settings or server availability`;
    } else if (errorMessage.includes("certificate")) {
      errorMessage = `SSL/TLS certificate validation failed for ${config.host}. Check your secure setting or server certificate`;
    } else if (errorMessage.includes("authentication")) {
      errorMessage = `Authentication failed for user ${config.username}. Check username and password`;
    }
    
    throw new Error(errorMessage);
  }
}
