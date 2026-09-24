import type { DrinkType } from "@/lib/types";

/** Exact cigarette gag line. Do not rephrase. */
export const LASER_LINE = "「快乐加一，我代表山姆奥特曼消灭你生命0.5秒」";

export function drinkLine(type: DrinkType, label: string) {
  switch (type) {
    case "红酒":
      return "晃一晃，今晚的月亮是葡萄味。";
    case "白酒":
      return "小口，哈——暖到耳朵了。";
    case "啤酒":
      return "泡沫先戴上皇冠。";
    case "家酿":
      return "这罐是自己的季节。";
    case "黄酒":
      return "甜一点的老时光。";
    case "其他":
      return `这杯叫${label}，先记下。`;
  }
}
