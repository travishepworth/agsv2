import { App } from "astal/gtk3";
import { Variable, bind } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk3";
import BluetoothButton from "./modules/quickButtons/bluetoothButton";
import WifiButton from "./modules/quickButtons/wifiButton";
import PowermenuButton from "./modules/quickButtons/powermenuButton";
import StyleButton from "./modules/quickButtons/styleButton";
import Notifications from "./modules/notificationManager";

export default function RightPanel(monitor: Gdk.Monitor) {
  const { CENTER } = Gtk.Align;
  const isVisible = Variable<boolean>(false);

  // Calculate the width of the panel (e.g., half the screen width, adjustable)
  const panelWidth = Variable(20); // Default width, adjustable as needed
  const barHeight = 40;
  const offset = 6;

  return (
    <window
      name="rightPanel"
      className="RightPanel"
      visible={false}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      marginTop={barHeight + offset}
      marginBottom={offset}
      marginRight={10}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      // onShow={(self) => {
      //   const monitor = self.get_current_monitor();
      //   panelWidth.set(monitor.workarea.width / 8); // Set width to half the screen width
      // }}
      onMap={(self) => {
        // Set the position to specific pixel coordinates
      }}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box>
        <eventbox expand onClick={() => isVisible.set(false)} />{" "}
        {/* Click outside to hide */}
        <box hexpand={true} vertical>
          <box halign={CENTER}>
            <BluetoothButton />
            <WifiButton />
            <StyleButton />
            <PowermenuButton />
          </box>
          <box halign={CENTER}>
            <Notifications />
          </box>
        </box>
      </box>
    </window>
  );
}
