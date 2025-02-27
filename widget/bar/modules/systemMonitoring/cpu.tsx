import { bind, Variable } from "astal";
import { cpuUsage } from "./statsCalc";

export default function CpuUsage() {
  // Reactive CPU usage percentage
  const cpuPercent = Variable.derive([cpuUsage], (usage) => Math.floor(usage * 100));
  console.log(cpuPercent);

  return (
    <box className="cpuMonitor" spacing={4}>
      <label label={bind(cpuPercent).as((percent) => ` ${percent}%`)} />
    </box>
  );
}
