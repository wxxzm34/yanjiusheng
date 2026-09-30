const { MAX_COUNT, normalizeAmount } = require("../../utils/quantity");

Component({
  properties: {
    value: { type: String, value: "1" },
    max: { type: Number, value: MAX_COUNT },
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
    limit() {
      const max = Number(this.data.max);
      return max > 0 ? max : MAX_COUNT;
    },
    onBlur() {
      this.emit(String(normalizeAmount(this.data.text, this.limit())));
    },
    dec() {
      const current = normalizeAmount(this.data.text, this.limit());
      this.emit(String(Math.max(1, current - 1)));
    },
    inc() {
      const current = normalizeAmount(this.data.text, this.limit());
      this.emit(String(Math.min(this.limit(), current + 1)));
    },
  },
});
