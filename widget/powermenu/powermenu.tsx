import { App, Astal, Gtk, Gdk  } from "astal/gtk3";
import { Variable, bind, execAsync } from "astal";

export default function PowerMenu() {
  // Function to hide the window
  const hide = () => {
    App.get_window("power-menu")!.hide();
  };

  return (
    <window
      name="power-menu"
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT} // Center the window
      application={App}
      visible={false} // Starts hidden, toggle via AGS config
      keymode={Astal.Keymode.EXCLUSIVE} // Capture all keypresses
      exclusivity={Astal.Exclusivity.IGNORE} // Prevent other windows from being focused
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          hide();
        }
      }}
    >
      {/* Center the buttons in the fullscreen window */}
      <box
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        spacing={20} // Space between rows
        vertical
      >
        {/* Top Row: Lock and Logout */}
        <box spacing={20} halign={Gtk.Align.CENTER} className="power-buttons">
          <button
            className="lock"
            onClicked={() => {
              execAsync(["bash", "-c", "hyprlock"]); // Replace with your lock command
              hide();
            }}
            widthRequest={200}
            heightRequest={200}
          >
            <label label="" />
          </button>
          <button
            className="logout"
            onClicked={() => {
              execAsync(["bash", "-c", "hyprctl dispatch exit"]); // Logout for Hyprland
              hide();
            }}
            widthRequest={200}
            heightRequest={200}
          >
            <label label="󰍃" />
          </button>
        </box>

        {/* Bottom Row: Poweroff and Restart */}
        <box spacing={20} halign={Gtk.Align.CENTER} className="power-buttons">
          <button
            className="poweroff"
            onClicked={() => {
              execAsync(["bash", "-c", "systemctl poweroff"]); // Poweroff
              hide();
            }}
            widthRequest={200}
            heightRequest={200}
          >
            <label label="⏻" />
          </button>
          <button
            className="restart"
            onClicked={() => {
              execAsync(["bash", "-c", "systemctl reboot"]); // Restart
              hide();
            }}
            widthRequest={200}
            heightRequest={200}
          >
            <label label="" />
          </button>
        </box>
      </box>
    </window>
  );
}
