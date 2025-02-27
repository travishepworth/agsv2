import { Gtk } from "astal/gtk3";
import { execAsync } from "astal"; // For launching the command

export default function StyleButton() {
  const launchStyle = () => {
    execAsync("nwg-look")
      .catch((err) => console.error("Failed to launch nwg-look:", err));
  };

  return (
    <button
      className="StyleButton"
      onClicked={launchStyle}
      halign={Gtk.Align.CENTER}
    >
      <box spacing={5}>
        <label label="" />
      </box>
    </button>
  );
}
