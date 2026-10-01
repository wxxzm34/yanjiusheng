const { MAX_COUNT, clampQty } = require("../../utils/quantity");

Component({
  properties: {
    value: { type: String, value: "1" },
    min: { type: String, value: "1" },
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
    floor() {
      const min = parseInt(this.data.min, 10);
      return Number.isFinite(min) ? min : 1;
    },
    limit() {
      const max = Number(this.data.max);
      return max > 0 ? max : MAX_COUNT;
    },
    current() {
      return clampQty(this.data.text, this.floor(), this.limit());
    },
    onBlur() {
      this.emit(String(this.current()));
    },
    dec() {
      const current = this.current();
      if (current <= this.floor()) return;
      this.emit(String(current - 1));
    },
    inc() {
      const current = this.current();
      if (current >= this.limit()) return;
      this.emit(String(current + 1));
    },
  },
});
