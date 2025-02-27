import { Gtk } from "astal/gtk3";
import { execAsync } from "astal"; // For launching the command

export default function WifiButton() {
  const launchWifi = () => {
    execAsync("nm-connection-editor")
      .catch((err) => console.error("Failed to launch nm-connection-editor:", err));
  };

  return (
    <button
      className="WifiButton"
      onClicked={launchWifi}
      halign={Gtk.Align.CENTER}
    >
      <box spacing={5}>
        <label label='󰤨' />
      </box>
    </button>
  );
}
