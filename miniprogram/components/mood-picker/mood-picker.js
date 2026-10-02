const { MOODS, MOOD_EMOJI } = require("../../utils/quantity");

Component({
  properties: {
    label: { type: String, value: "" },
    value: { type: String, value: "" },
  },
  data: {
    moods: MOODS.map((name) => ({ name, emoji: MOOD_EMOJI[name] })),
  },
  methods: {
    pick(event) {
      const mood = event.currentTarget.dataset.mood;
      const next = this.data.value === mood ? "" : mood;
      this.triggerEvent("change", { mood: next });
    },
  },
});
