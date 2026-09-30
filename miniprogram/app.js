const { scheduleEntrySync } = require("./utils/sync");

App({
  onLaunch() {
    scheduleEntrySync();
  },
  onShow() {
    scheduleEntrySync();
  },
});
