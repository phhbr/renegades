const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");
  if (!RECAPTCHA_SECRET_KEY) {
    throw new Error("Missing RECAPTCHA_SECRET_KEY environment variable");
  }

  const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
  const response = await fetch(verificationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const result = await response.json();
  return result.success && result.score >= 0.5; // Minimum score threshold
};

export { verifyRecaptcha };