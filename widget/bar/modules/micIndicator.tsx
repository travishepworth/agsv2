import { Variable, bind } from "astal";
import Wp from "gi://AstalWp";

export default function MicIndicator() {
  const wp = Wp.get_default();
  const micMuted = Variable<boolean>(false).poll(
    1000,
    () => {
      const defaultSource = wp?.get_default_microphone();
      return defaultSource ? defaultSource.mute : false;
    }
  );

  return (
    <box className="MicIndicator">
      <label
        label={bind(micMuted).as((muted) => (!muted ? "" : ""))}
      />
    </box>
  )
}
