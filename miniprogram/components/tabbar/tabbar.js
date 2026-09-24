Component({
  properties: {
    current: { type: String, value: "home" },
  },
  methods: {
    go(event) {
      const url = event.currentTarget.dataset.url;
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (current && `/${current.route}` === url) return;
      wx.redirectTo({ url });
    },
  },
});
