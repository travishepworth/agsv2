import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { timeout } from "astal/time";
import Variable from "astal/variable";
import Brightness from "./brightness";
import Wp from "gi://AstalWp";

export const requestState = Variable("");

function OnScreenProgress({ visible }: { visible: Variable<boolean> }) {
  const brightness = Brightness.get_default();
  const speaker = Wp.get_default()!.get_default_speaker();

  const iconName = Variable("");
  const value = Variable(0);
  const spotifyVolume = Variable(0);
  const libreWolfVolume = Variable(0);
  const vesktopVolume = Variable(0);
  const gameVolume = Variable(0);

  // I was gonna say this is scuffed,
  // but it's kinda chad AF
  // Also very resource effecient (mostly)
  requestState.subscribe((state) => {
    const applictation = state.split(":")[0];
    const volume = parseInt(state.split(":")[1]);
    switch (applictation) {
      case "spotify":
        visible.set(true);
        spotifyVolume.set(volume / 100);
        timeout(2000, () => {
          if (state === requestState.get()) {
            visible.set(false);
          }
        });
        break;
      case "librewolf":
        visible.set(true);
        libreWolfVolume.set(volume / 100);
        timeout(2000, () => {
          if (state === requestState.get()) {
            visible.set(false);
          }
        });
        break;
      case "chromium":
        visible.set(true);
        vesktopVolume.set(volume / 100);
        timeout(2000, () => {
          if (state === requestState.get()) {
            visible.set(false);
          }
        });
        break;
      case "other":
        visible.set(true);
        gameVolume.set(volume / 100);
        timeout(2000, () => {
          if (state === requestState.get()) {
            visible.set(false);
          }
        });
        break;
    }
  });

  let count = 0;
  function show(v: number, icon: string) {
    visible.set(true);
    value.set(v);
    iconName.set(icon);
    count++;
    timeout(2000, () => {
      count--;
      if (count === 0) visible.set(false);
    });
  }

  return (
    <revealer
      setup={(self) => {
        self.hook(brightness, "notify::screen", () =>
          show(brightness.screen, "display-brightness-symbolic"),
        );

        if (speaker) {
          self.hook(speaker, "notify::volume", () =>
            show(speaker.volume, speaker.volumeIcon),
          );
        }
      }}
      revealChild={visible()}
      transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
    >
      <box className="OSD">
        <box vertical>
          <levelbar
            inverted={true}
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            value={libreWolfVolume()}
            orientation={Gtk.Orientation.VERTICAL}
            setup={(self) => {
              self.remove_offset_value("full");
            }}
          />
          <label label={""} />
        </box>
        <box vertical>
          <levelbar
            inverted={true}
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            value={vesktopVolume()}
            orientation={Gtk.Orientation.VERTICAL}
            setup={(self) => {
              self.remove_offset_value("full");
            }}
          />
          <label label={""} />
        </box>
        <box vertical>
          <levelbar
            inverted={true}
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            value={gameVolume()}
            orientation={Gtk.Orientation.VERTICAL}
            setup={(self) => {
              self.remove_offset_value("full");
            }}
          />
          <label label={""} />
        </box>
        <box vertical>
          <levelbar
            inverted={true}
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            value={spotifyVolume()}
            orientation={Gtk.Orientation.VERTICAL}
            setup={(self) => {
              self.remove_offset_value("full");
            }}
          />
          <label label={""} />
        </box>
        <box vertical>
          <levelbar
            inverted={true}
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            value={value()}
            orientation={Gtk.Orientation.VERTICAL}
            setup={(self) => {
              self.remove_offset_value("full");
            }}
          />
          <label label={""} />
        </box>
      </box>
    </revealer>
  );
}

export default function OSD(monitor: Gdk.Monitor) {
  const visible = Variable(false);

  return (
    <window
      gdkmonitor={monitor}
      className="OSD"
      namespace="osd"
      application={App}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={Astal.WindowAnchor.BOTTOM}
    >
      <eventbox onClick={() => visible.set(false)}>
        <OnScreenProgress visible={visible} />
      </eventbox>
    </window>
  );
}
