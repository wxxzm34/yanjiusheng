export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startEmbeddedCron } = await import("./lib/wechat/job");
  startEmbeddedCron();
}
