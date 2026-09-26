const { MAX_COUNT, normalizeCount } = require("../../utils/quantity");

Component({
  properties: {
    value: { type: String, value: "1" },
  },
  data: {
    text: "1",
  },
  observers: {
    value(value) {
      const text = value == null ? "1" : String(value);
      if (text !== this.data.text) this.setData({ text });
    },
  },
  lifetimes: {
    attached() {
      this.setData({ text: this.data.value == null ? "1" : String(this.data.value) });
    },
  },
  methods: {
    emit(text) {
      this.setData({ text });
      this.triggerEvent("change", { value: text });
    },
    onInput(event) {
      const raw = String(event.detail.value ?? "");
      if (raw === "" || /^\d{1,3}$/.test(raw)) this.emit(raw);
      else this.emit(this.data.text);
    },
    onBlur() {
      this.emit(String(normalizeCount(this.data.text)));
    },
    dec() {
      const current = normalizeCount(this.data.text);
      this.emit(String(Math.max(1, current - 1)));
    },
    inc() {
      const current = normalizeCount(this.data.text);
      this.emit(String(Math.min(MAX_COUNT, current + 1)));
    },
  },
});
