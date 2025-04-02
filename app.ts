import { App } from "astal/gtk3";
import style from "./style.scss";
import { requestState } from "./widget/osd/osd";
import Bar from "./widget/bar/Bar";
import Applauncher from "./widget/appLauncher/Applauncher";
import NotificationPopups from "./widget/notifications/NotificationPopups";
import LeftPanel from "./widget/leftPanel/LeftPanel";
import OSD from "./widget/osd/osd";
import wallpaperSwitcher from "./widget/wallpaperSwitcher/wallpaperSwitcher";
import PowerMenu from "./widget/powermenu/powermenu";
import { execAsync } from "astal";

App.start({
  requestHandler(request: string, res: (response: any) => void) {
    requestState.set(request);
    res("ok");
  },
  css: style,
  main() {
    execAsync([
      "bash",
      "-c",
      `pkill -f "python3 $HOME/.config/ags/scripts/pulseAudioMonitor.py" ; python3 $HOME/.config/ags/scripts/pulseAudioMonitor.py`,
    ])
      .then((stdout) => console.log("Output: ", stdout))
      .catch((err) => console.log("Error: ", err));
    App.get_monitors().map(Bar);
    App.get_monitors().map(Applauncher);
    App.get_monitors().map(NotificationPopups);
    App.get_monitors().map(LeftPanel);
    App.get_monitors().map(OSD);
    App.get_monitors().map(wallpaperSwitcher);
    App.get_monitors().map(PowerMenu);
  },
});
