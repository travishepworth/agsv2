import { bind, Variable } from "astal";
import { memoryUsage, memoryAvailable, memoryTotal } from "./statsCalc";

export default function MemoryUsage() {
  // Reactive memory usage percentage
  const memoryPercent = Variable.derive([memoryUsage], (usage) =>
    Math.floor(usage * 100),
  );

  // Tooltip with detailed memory usage (in GiB)
  const memoryTooltip = Variable.derive(
    [memoryAvailable, memoryTotal],
    (available, total) =>
      `${((total - available) / 1024 / 1024).toFixed(1)} GiB used`,
  );

  return (
    <box className="ramMonitor" spacing={4}>
      <label label={bind(memoryPercent).as((percent) => ` ${percent}%`)} />
    </box>
  );
}
