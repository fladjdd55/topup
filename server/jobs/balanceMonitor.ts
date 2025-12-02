import { getAccountBalance } from "../dingconnect";
import { sendEmail } from "../email";

const LOW_BALANCE_THRESHOLD = 50.00; // Alert if under $50

export function startBalanceMonitorJob() {
  setInterval(async () => {
    try {
      const { Balance, CurrencyIso } = await getAccountBalance();
      console.log(`[Balance Monitor] Current: ${Balance} ${CurrencyIso}`);

      if (Balance < LOW_BALANCE_THRESHOLD) {
        await sendEmail({
          to: "admin@yourdomain.com",
          subject: "⚠️ URGENT: Low Balance Alert",
          html: `<p>Your DingConnect balance is low: <strong>${Balance} ${CurrencyIso}</strong>.</p><p>Please recharge immediately to avoid service interruption.</p>`
        });
      }
    } catch (error) {
      console.error("[Balance Monitor] Failed to check balance", error);
    }
  }, 1000 * 60 * 60); // Check every 1 hour
}
