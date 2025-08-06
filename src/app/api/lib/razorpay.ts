import razorpay from "razorpay";

export const razorpayInstance = new razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

function getRazorpayXHeaders() {
  const credentials = `${process.env.RAZOR_PAY_KEY}:${process.env.RAZOR_PAY_SECRET}`;
  const encoded = Buffer.from(credentials).toString("base64");

  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

export async function createRazorpayXContact(name: string, email: string) {
  const res = await fetch("https://api.razorpay.com/v1/contacts", {
    method: "POST",
    headers: getRazorpayXHeaders(),
    body: JSON.stringify({
      name,
      email,
      type: "employee",
      reference_id: `contact_${Date.now()}`,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.description || "Failed to create contact");
  }

  const data = await res.json();
  console.log("Fund Account Created ",data);
  return data.id;
}

export async function createRazorpayXFundAccount(
  contactId: string,
  accountName: string,
  ifsc: string,
  accountNumber: string
) {
  const res = await fetch("https://api.razorpay.com/v1/fund_accounts", {
    method: "POST",
    headers: getRazorpayXHeaders(),
    body: JSON.stringify({
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: {
        name: accountName,
        ifsc,
        account_number: accountNumber,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.description || "Failed to create fund account");
  }

  const data = await res.json();
  console.log("Fund Account Created ",data);
  
  return data.id;
}
