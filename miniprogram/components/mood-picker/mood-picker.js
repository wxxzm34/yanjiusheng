Component({
  properties: {
    label: { type: String, value: "心情" },
    value: { type: String, value: "" },
  },
  data: {
    moods: ["无聊", "开心", "难过"],
  },
  methods: {
    pick(event) {
      const mood = event.currentTarget.dataset.mood;
      const next = this.data.value === mood ? "" : mood;
      this.triggerEvent("change", { mood: next });
    },
  },
});
