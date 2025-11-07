// Debug script to check JWT expiration in browser console
// Paste this into your browser's DevTools console when logged in as guest

const session = JSON.parse(localStorage.getItem("guestSession"));

if (!session) {
  console.log("❌ No guest session found");
} else {
  // Decode JWT (without verification)
  const token = session.token;
  const parts = token.split(".");

  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));

    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    const iat = payload.iat;

    console.log("🔐 JWT Debug Info:");
    console.log("-------------------");
    console.log("Issued At (iat):", new Date(iat * 1000).toLocaleString());
    console.log("Expires At (exp):", new Date(exp * 1000).toLocaleString());
    console.log("Current Time:", new Date().toLocaleString());
    console.log("-------------------");
    console.log("Time until expiry:", Math.floor((exp - now) / 3600), "hours");
    console.log("Is Expired?", exp < now ? "❌ YES" : "✅ NO");
    console.log("-------------------");
    console.log("Full Payload:", payload);
  }

  console.log("\n📅 Session Dates:");
  console.log("Session Created:", session.timestamp);
  console.log("Frontend Session Expires:", session.sessionExpiresAt);
  console.log(
    "Database Access Code Expires:",
    session.guestData.access_code_expires_at
  );
}
