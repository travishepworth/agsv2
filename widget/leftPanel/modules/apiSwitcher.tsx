import { Gtk } from "astal/gtk3";
import { Variable, bind } from "astal";

export default function APISwitcher({
  selected,
  onSelect,
}: {
  selected: Variable<"chatGPT" | "booru">;
  onSelect: (option: "chatGPT" | "booru") => void;
}) {
  return (
    <box
      className="APISwitcher"
      vertical={false}
      spacing={5}
      halign={Gtk.Align.CENTER}
    >
      <button
        className={bind(selected).as((s) => (s === "chatGPT" ? "active" : ""))}
        onClicked={() => onSelect("chatGPT")}
      >
        <label label="ChatGPT" />
      </button>
      <button
        className={bind(selected).as((s) => (s === "booru" ? "active" : ""))}
        onClicked={() => onSelect("booru")}
      >
        <label label="Booru" />
      </button>
    </box>
  );
}
