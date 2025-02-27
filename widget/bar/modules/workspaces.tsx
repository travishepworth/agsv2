import { bind, exec } from "astal";
import Hyprland from "gi://AstalHyprland";

let monitor1: object = {};
let monitor2: object = {};
let lastMonitor: string = "";
export default function Workspaces({ monitorName }: { monitorName: string }) {
  const hypr = Hyprland.get_default();

  // Determine the range of workspace IDs based on the monitor name
  const workspaceRange = monitorName === "MSI MAG342CQR" ? [1, 10] : [11, 20];

  const isMainMonitor = monitorName === "MSI MAG342CQR";

  return (
    <box className="WorkspacesContainer">
      <box>
        {bind(hypr, "workspaces").as((wss) => {
          const workspaceButtons = [];
          for (let i = workspaceRange[0]; i <= workspaceRange[1]; i++) {
            const ws = wss.find((ws) => ws.id === i);
            workspaceButtons.push(
              <button
                className={bind(hypr, "focusedWorkspace").as((fw) => {

                  // SUS CODE AHEAD
                  let primaryMonitor: boolean = false;
                  for (let j = workspaceRange[0]; j <= workspaceRange[1]; j++) {
                    const wsc = wss.find((wsc) => wsc.id === j);
                    if (wsc === fw && monitorName === "MSI MAG342CQR") {
                      primaryMonitor = true;
                      break;
                    }
                  }

                  switch (monitorName) {
                    case "MSI MAG342CQR":
                      if (ws === fw) {
                        lastMonitor = monitorName;
                        monitor1 = ws;
                        return "focused";
                      } else if (ws === monitor1 && primaryMonitor === false) {
                        return "focused";
                      } else if (ws) {
                        return "occupied";
                      } else {
                      }
                    case "Sceptre L24":
                      if (ws === fw) {
                        lastMonitor = monitorName;
                        monitor2 = ws;
                        return "focused";
                      } else if (
                        ws === monitor2 &&
                        lastMonitor != monitorName
                      ) {
                        return "focused";
                      } else if (ws) {
                        return "occupied";
                      }
                  }
                  // FINISH SUS CODE
                })}
                onClicked={() =>
                  exec(["bash", "-c", `hyprctl dispatch workspace ${i}`])
                }
              >
                {isMainMonitor ? i : i - 10}
              </button>,
            );
          }
          return workspaceButtons;
        })}
      </box>
    </box>
  );
}
