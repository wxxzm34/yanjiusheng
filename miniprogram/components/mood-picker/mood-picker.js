const { MOODS } = require("../../utils/quantity");

Component({
  properties: {
    label: { type: String, value: "心情" },
    value: { type: String, value: "" },
  },
  data: {
    moods: MOODS,
  },
  methods: {
    pick(event) {
      const mood = event.currentTarget.dataset.mood;
      const next = this.data.value === mood ? "" : mood;
      this.triggerEvent("change", { mood: next });
    },
  },
});
