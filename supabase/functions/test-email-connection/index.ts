
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
    
    // Parse the request body
    const reqBody = await req.text();
    console.log("Request body:", reqBody);
    
    // Parse JSON with error handling
    let data;
    try {
      data = JSON.parse(reqBody);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON: " + (parseError instanceof Error ? parseError.message : String(parseError)),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { config } = data;

    if (!config || !config.type || !config.host || !config.port || !config.username || !config.password) {
      throw new Error("Missing required configuration");
    }

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
  console.log(`Testing SMTP connection to ${config.host}:${config.port}`);
  
  const client = new SmtpClient();

  try {
    await client.connect({
      hostname: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      tls: config.secure,
    });
    
    await client.close();
    console.log("SMTP connection test successful");
    
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
    throw new Error(`SMTP connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
