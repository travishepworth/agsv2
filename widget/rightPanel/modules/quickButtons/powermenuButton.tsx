import { Gtk } from "astal/gtk3";
import { execAsync } from "astal"; // For launching the command

export default function PowermenuButton() {
  // const launchBlueberry = () => {
  //   execAsync("blueberry")
  //     .then(() => console.log("Blueberry launched"))
  //     .catch((err) => console.error("Failed to launch Blueberry:", err));
  // };

  return (
    <button
      className="BluetoothButton"
      // onClicked={launchBlueberry}
      halign={Gtk.Align.CENTER}
    >
      <box spacing={5}>
        <label label="⏻" />
      </box>
    </button>
  );
}
