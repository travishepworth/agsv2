import { Astal, Gtk, Gdk } from "astal/gtk3";
import Workspaces from "./modules/workspaces";
import SysTray from "./modules/sysTray";
import MicIndicator from "./modules/micIndicator";
import Media from "./modules/media";
import FocusedClient from "./modules/activeApplication";
import Time from "./modules/time";
import CpuUsage from "./modules/systemMonitoring/cpu";
import MemoryUsage from "./modules/systemMonitoring/memory";
import Logo from "./modules/logo";

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  const monitorName = monitor.get_model();
  if (monitorName === null) {
    return;
  }

  return (
    <window
      name="bar"
      className="Bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      visible={true}
      anchor={TOP | LEFT | RIGHT}
    >
      <centerbox>
        <box hexpand halign={Gtk.Align.START}>
          <FocusedClient />
          <Media />
        </box>
        <box hexpand>
          <MemoryUsage />
          <CpuUsage />
          <Workspaces monitorName={monitorName} />
          <Time />
        </box>
        <box hexpand halign={Gtk.Align.END}>
          <MicIndicator />
          <SysTray />
          <Logo />
        </box>
      </centerbox>
    </window>
  );
}
