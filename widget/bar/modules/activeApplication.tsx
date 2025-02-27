import { bind } from "astal";
import Hyprland from "gi://AstalHyprland";

export default function FocusedClient() {
  const hypr = Hyprland.get_default();
  const focused = bind(hypr, "focusedClient");

  const truncateText = (text: string, maxLength: number=30) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  return (
    <box className="ActiveApplication" visible={focused.as(Boolean)}>
      {focused.as(
        (client) =>
          client && <label label={bind(client, "title").as((title: string) => truncateText(title))} />,
      )}
    </box>
  );
}
